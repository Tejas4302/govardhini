
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('idle');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check
    if (isOnline) {
      syncOfflineData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    setSyncStatus('syncing');

    try {
      const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');
      let totalSynced = 0;

      // Sync farmers
      const offlineFarmers = JSON.parse(localStorage.getItem('offline_farmers') || '[]');
      const unsyncedFarmers = offlineFarmers.filter((item: any) => !item.synced);
      
      for (const farmer of unsyncedFarmers) {
        try {
          const { error } = await supabase.from('farmers').insert({
            full_name: farmer.fullName,
            phone_number: farmer.phoneNumber,
            aadhaar_number: farmer.aadhaarNumber || null,
            state: farmer.state,
            district: farmer.district,
            taluk: farmer.taluk,
            town_or_village: farmer.townOrVillage,
            pincode: farmer.pincode,
            added_by: user.id || 'offline-user'
          });

          if (!error) {
            farmer.synced = true;
            totalSynced++;
          }
        } catch (error) {
          console.error('Farmer sync error:', error);
        }
      }
      localStorage.setItem('offline_farmers', JSON.stringify(offlineFarmers));

      // Sync cattle
      const offlineCattle = JSON.parse(localStorage.getItem('offline_cattle') || '[]');
      const unsyncedCattle = offlineCattle.filter((item: any) => !item.synced);
      
      for (const cattle of unsyncedCattle) {
        try {
          const { error } = await supabase.from('cattle_profiles').insert({
            cattle_id: cattle.cattleId,
            farmer_name: cattle.farmerName,
            breed: cattle.breed,
            type: cattle.type,
            dob: cattle.dob,
            lactation: cattle.lactation,
            weight_kg: parseFloat(cattle.weightKg),
            owner_phone: cattle.ownerPhone,
            added_by: user.id || 'offline-user'
          });

          if (!error) {
            cattle.synced = true;
            totalSynced++;
          }
        } catch (error) {
          console.error('Cattle sync error:', error);
        }
      }
      localStorage.setItem('offline_cattle', JSON.stringify(offlineCattle));

      // Sync health checks
      const offlineHealth = JSON.parse(localStorage.getItem('offline_health') || '[]');
      const unsyncedHealth = offlineHealth.filter((item: any) => !item.synced);
      
      for (const health of unsyncedHealth) {
        try {
          const { error } = await supabase.from('health_checkups').insert({
            cattle_id: health.cattleId,
            date: health.checkDate,
            temperature: parseFloat(health.temperature),
            issue: health.issue || null,
            issue_type: health.issueType || null,
            recovery_status: health.recoveryStatus || null,
            added_by: user.id || 'offline-user'
          });

          if (!error) {
            health.synced = true;
            totalSynced++;
          }
        } catch (error) {
          console.error('Health sync error:', error);
        }
      }
      localStorage.setItem('offline_health', JSON.stringify(offlineHealth));

      // Similar sync for milk production and feed requests...

      if (totalSynced > 0) {
        setSyncStatus('success');
        toast({
          title: "Sync Complete ✅",
          description: `${totalSynced} records synced successfully`,
        });
      } else {
        setSyncStatus('idle');
      }

    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      toast({
        title: "Sync Failed",
        description: "Some data could not be synced. Will retry later.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-2 px-3 py-2"
      >
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isOnline ? 'Online' : 'Offline'}
        {syncStatus === 'syncing' && ' - Syncing...'}
        {syncStatus === 'success' && ' - Synced'}
      </Badge>
    </div>
  );
};

export default OfflineSync;
