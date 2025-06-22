
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';

const SystemReports = () => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const { toast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  const generateReport = async (reportType: string) => {
    setIsGenerating(reportType);
    try {
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (reportType) {
        case 'farmers':
          const farmersResult = await supabase.from('farmers').select('*').order('full_name');
          data = farmersResult.data || [];
          filename = 'farmers_report.csv';
          headers = ['Full Name', 'Phone Number', 'District', 'Taluk', 'Village', 'State', 'Pincode'];
          break;

        case 'cattle':
          const cattleResult = await supabase.from('cattle_profiles').select('*').order('cattle_id');
          data = cattleResult.data || [];
          filename = 'cattle_report.csv';
          headers = ['Cattle ID', 'Farmer Name', 'Type', 'Breed', 'Weight (kg)', 'Date of Birth', 'Lactation'];
          break;

        case 'users':
          const usersResult = await supabase.from('users').select('*').order('full_name');
          data = usersResult.data || [];
          filename = 'users_report.csv';
          headers = ['Full Name', 'Phone Number', 'Designation', 'Status', 'Created At'];
          break;

        case 'health':
          const healthResult = await supabase.from('health_checkups').select('*').order('date', { ascending: false });
          data = healthResult.data || [];
          filename = 'health_checkups_report.csv';
          headers = ['Cattle ID', 'Date', 'Temperature', 'Issue Type', 'Issue', 'Recovery Status'];
          break;
      }

      if (data.length === 0) {
        toast({
          title: "No Data",
          description: "No data available for this report",
          variant: "destructive"
        });
        return;
      }

      // Generate CSV content
      const csvContent = [
        headers.join(','),
        ...data.map(row => {
          switch (reportType) {
            case 'farmers':
              return [row.full_name, row.phone_number, row.district, row.taluk, row.town_or_village, row.state, row.pincode].join(',');
            case 'cattle':
              return [row.cattle_id, row.farmer_name, row.type, row.breed, row.weight_kg, row.dob, row.lactation].join(',');
            case 'users':
              return [row.full_name, row.phone_number, row.designation, row.status, new Date(row.created_at).toLocaleDateString()].join(',');
            case 'health':
              return [row.cattle_id, row.date, row.temperature, row.issue_type || '', row.issue || '', row.recovery_status || ''].join(',');
            default:
              return '';
          }
        })
      ].join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${reportType} report downloaded successfully`,
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const reports = [
    {
      title: 'Farmers Report',
      description: 'Complete list of all registered farmers',
      type: 'farmers',
      icon: '👨‍🌾',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Cattle Report',
      description: 'All cattle profiles and details',
      type: 'cattle',
      icon: '🐄',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Users Report',
      description: 'System users and their roles',
      type: 'users',
      icon: '👤',
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Health Checkups Report',
      description: 'All health checkup records',
      type: 'health',
      icon: '❤️',
      gradient: 'from-red-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation user={user} />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">System Reports</CardTitle>
              <CardDescription className="text-gray-300">Generate and download comprehensive system reports</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report) => (
                  <Card key={report.type} className="glass-card border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${report.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                          {report.icon}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{report.title}</h3>
                          <p className="text-gray-300 text-sm">{report.description}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => generateReport(report.type)}
                        disabled={isGenerating === report.type}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                      >
                        {isGenerating === report.type ? 'Generating...' : 'Download CSV'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemReports;
