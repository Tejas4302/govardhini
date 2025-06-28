/*
  # Database Performance and Data Integrity Improvements

  1. Performance Optimizations
    - Add missing indexes for frequently queried columns
    - Optimize foreign key relationships
    
  2. Data Integrity Enhancements
    - Add check constraints for data validation
    - Improve referential integrity
    
  3. Security Improvements
    - Enhance RLS policies
    - Add audit trail capabilities
*/

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_cattle_profiles_farmer_phone ON cattle_profiles(owner_phone);
CREATE INDEX IF NOT EXISTS idx_cattle_profiles_type_lactation ON cattle_profiles(type, lactation);
CREATE INDEX IF NOT EXISTS idx_health_checkups_temperature_date ON health_checkups(temperature, date);
CREATE INDEX IF NOT EXISTS idx_milk_production_quantity_date ON milk_production(quantity_litres, date);
CREATE INDEX IF NOT EXISTS idx_feed_requests_farmer_phone ON feed_requests(farmer_phone);
CREATE INDEX IF NOT EXISTS idx_users_active_role_status ON users(active_role, status);
CREATE INDEX IF NOT EXISTS idx_farmers_location ON farmers(state, district, taluk);

-- Add check constraints for better data validation
ALTER TABLE cattle_profiles 
ADD CONSTRAINT check_cattle_age 
CHECK (dob <= CURRENT_DATE AND dob >= '1900-01-01');

ALTER TABLE health_checkups 
ADD CONSTRAINT check_health_date 
CHECK (date <= CURRENT_DATE);

ALTER TABLE milk_production 
ADD CONSTRAINT check_milk_date 
CHECK (date <= CURRENT_DATE);

ALTER TABLE feed_requests 
ADD CONSTRAINT check_feed_date 
CHECK (date <= CURRENT_DATE);

-- Improve phone number validation
ALTER TABLE users 
ADD CONSTRAINT check_phone_format 
CHECK (phone_number ~ '^[0-9]{10}$');

ALTER TABLE farmers 
ADD CONSTRAINT check_farmer_phone_format 
CHECK (phone_number ~ '^[0-9]{10}$');

-- Add Aadhaar number validation (12 digits)
ALTER TABLE farmers 
ADD CONSTRAINT check_aadhaar_format 
CHECK (aadhaar_number IS NULL OR aadhaar_number ~ '^[0-9]{12}$');

-- Add pincode validation (6 digits)
ALTER TABLE farmers 
ADD CONSTRAINT check_pincode_format 
CHECK (pincode ~ '^[0-9]{6}$');

-- Create audit log table for tracking important changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_by uuid REFERENCES users(id),
  changed_at timestamptz DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.active_role = 'Admin' 
      AND users.status = 'approved'
    )
  );

-- Create function to log changes
CREATE OR REPLACE FUNCTION log_changes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id::text, TG_OP, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id::text, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id::text, TG_OP, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to important tables
CREATE TRIGGER audit_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_farmers_changes
  AFTER INSERT OR UPDATE OR DELETE ON farmers
  FOR EACH ROW EXECUTE FUNCTION log_changes();

CREATE TRIGGER audit_cattle_changes
  AFTER INSERT OR UPDATE OR DELETE ON cattle_profiles
  FOR EACH ROW EXECUTE FUNCTION log_changes();

-- Create materialized view for dashboard statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM farmers) as total_farmers,
  (SELECT COUNT(*) FROM cattle_profiles) as total_cattle,
  (SELECT COUNT(*) FROM users WHERE status = 'approved') as active_users,
  (SELECT COUNT(DISTINCT farmer_id) FROM cattle_profiles WHERE farmer_id IS NOT NULL) as farmers_with_cattle,
  (SELECT COALESCE(SUM(quantity_litres), 0) FROM milk_production WHERE date >= CURRENT_DATE - INTERVAL '30 days') as monthly_milk_production,
  (SELECT COUNT(*) FROM health_checkups WHERE temperature > 39.5 AND date >= CURRENT_DATE - INTERVAL '7 days') as recent_health_alerts,
  (SELECT COUNT(*) FROM feed_requests WHERE status = 'Pending') as pending_feed_requests,
  now() as last_updated;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_updated ON dashboard_stats(last_updated);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get cattle health summary
CREATE OR REPLACE FUNCTION get_cattle_health_summary(cattle_id_param text)
RETURNS TABLE (
  cattle_id text,
  latest_checkup_date date,
  latest_temperature numeric,
  health_status text,
  total_checkups bigint,
  avg_temperature numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.cattle_id,
    hc.latest_date,
    hc.latest_temp,
    CASE 
      WHEN hc.latest_temp > 39.5 THEN 'Alert'
      WHEN hc.latest_temp > 38.5 THEN 'Warning'
      ELSE 'Normal'
    END as health_status,
    hc.checkup_count,
    hc.avg_temp
  FROM cattle_profiles cp
  LEFT JOIN (
    SELECT 
      cattle_id,
      MAX(date) as latest_date,
      (SELECT temperature FROM health_checkups h2 WHERE h2.cattle_id = h1.cattle_id ORDER BY date DESC LIMIT 1) as latest_temp,
      COUNT(*) as checkup_count,
      AVG(temperature) as avg_temp
    FROM health_checkups h1
    WHERE cattle_id = cattle_id_param
    GROUP BY cattle_id
  ) hc ON cp.cattle_id = hc.cattle_id
  WHERE cp.cattle_id = cattle_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get milk production trends
CREATE OR REPLACE FUNCTION get_milk_production_trend(cattle_id_param text, days_param integer DEFAULT 30)
RETURNS TABLE (
  date date,
  quantity_litres numeric,
  running_average numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.date,
    mp.quantity_litres,
    AVG(mp.quantity_litres) OVER (
      ORDER BY mp.date 
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as running_average
  FROM milk_production mp
  WHERE mp.cattle_id = cattle_id_param
    AND mp.date >= CURRENT_DATE - INTERVAL '1 day' * days_param
  ORDER BY mp.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate cattle ownership
CREATE OR REPLACE FUNCTION validate_cattle_ownership(cattle_id_param text, user_id_param uuid)
RETURNS boolean AS $$
DECLARE
  is_valid boolean := false;
BEGIN
  -- Check if user is admin
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id_param 
    AND active_role = 'Admin' 
    AND status = 'approved'
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user added the cattle or farmer
  SELECT EXISTS (
    SELECT 1 FROM cattle_profiles cp
    LEFT JOIN farmers f ON cp.farmer_id = f.id
    WHERE cp.cattle_id = cattle_id_param
    AND (cp.added_by = user_id_param OR f.added_by = user_id_param)
  ) INTO is_valid;
  
  RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve RLS policies with ownership validation
DROP POLICY IF EXISTS "Enable all operations for cattle_profiles" ON cattle_profiles;

CREATE POLICY "Users can view all cattle profiles"
  ON cattle_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert cattle profiles"
  ON cattle_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (added_by = auth.uid());

CREATE POLICY "Users can update their cattle profiles"
  ON cattle_profiles
  FOR UPDATE
  TO authenticated
  USING (validate_cattle_ownership(cattle_id, auth.uid()));

CREATE POLICY "Admins can delete cattle profiles"
  ON cattle_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND active_role = 'Admin' 
      AND status = 'approved'
    )
  );

-- Add similar ownership-based policies for health checkups and milk production
DROP POLICY IF EXISTS "Enable all operations for health_checkups" ON health_checkups;

CREATE POLICY "Users can view health checkups"
  ON health_checkups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert health checkups for their cattle"
  ON health_checkups
  FOR INSERT
  TO authenticated
  WITH CHECK (validate_cattle_ownership(cattle_id, auth.uid()));

CREATE POLICY "Users can update health checkups for their cattle"
  ON health_checkups
  FOR UPDATE
  TO authenticated
  USING (validate_cattle_ownership(cattle_id, auth.uid()));

-- Add notification system for health alerts
CREATE TABLE IF NOT EXISTS health_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cattle_id text NOT NULL REFERENCES cattle_profiles(cattle_id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('high_temperature', 'health_issue', 'overdue_checkup')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on health alerts
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view health alerts"
  ON health_alerts
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to create health alerts automatically
CREATE OR REPLACE FUNCTION check_and_create_health_alerts()
RETURNS trigger AS $$
BEGIN
  -- High temperature alert
  IF NEW.temperature > 39.5 THEN
    INSERT INTO health_alerts (cattle_id, alert_type, severity, message)
    VALUES (
      NEW.cattle_id,
      'high_temperature',
      CASE 
        WHEN NEW.temperature > 41.0 THEN 'critical'
        WHEN NEW.temperature > 40.0 THEN 'high'
        ELSE 'medium'
      END,
      format('High temperature detected: %s°C for cattle %s', NEW.temperature, NEW.cattle_id)
    );
  END IF;
  
  -- Health issue alert
  IF NEW.issue IS NOT NULL AND NEW.issue != '' THEN
    INSERT INTO health_alerts (cattle_id, alert_type, severity, message)
    VALUES (
      NEW.cattle_id,
      'health_issue',
      CASE 
        WHEN NEW.issue_type IN ('Emergency', 'Critical') THEN 'critical'
        WHEN NEW.issue_type IN ('Serious', 'Urgent') THEN 'high'
        ELSE 'medium'
      END,
      format('Health issue reported for cattle %s: %s', NEW.cattle_id, NEW.issue)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for automatic health alerts
CREATE TRIGGER create_health_alerts_trigger
  AFTER INSERT ON health_checkups
  FOR EACH ROW EXECUTE FUNCTION check_and_create_health_alerts();

-- Create summary view for farmer dashboard
CREATE VIEW farmer_cattle_summary AS
SELECT 
  f.id as farmer_id,
  f.full_name as farmer_name,
  f.phone_number as farmer_phone,
  COUNT(cp.id) as total_cattle,
  COUNT(CASE WHEN cp.lactation = true THEN 1 END) as lactating_cattle,
  COUNT(CASE WHEN cp.type = 'Cow' THEN 1 END) as total_cows,
  COUNT(CASE WHEN cp.type = 'Buffalo' THEN 1 END) as total_buffaloes,
  COALESCE(SUM(mp.monthly_production), 0) as monthly_milk_production,
  COUNT(ha.id) as active_health_alerts
FROM farmers f
LEFT JOIN cattle_profiles cp ON f.id = cp.farmer_id
LEFT JOIN (
  SELECT 
    cattle_id,
    SUM(quantity_litres) as monthly_production
  FROM milk_production 
  WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY cattle_id
) mp ON cp.cattle_id = mp.cattle_id
LEFT JOIN health_alerts ha ON cp.cattle_id = ha.cattle_id AND ha.is_resolved = false
GROUP BY f.id, f.full_name, f.phone_number;

-- Grant necessary permissions
GRANT SELECT ON farmer_cattle_summary TO authenticated;
GRANT SELECT ON dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cattle_health_summary(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_milk_production_trend(text, integer) TO authenticated;