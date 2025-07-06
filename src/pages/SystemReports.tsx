
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { FileText, Download, Users, User, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import Capacitor Filesystem for mobile file downloads
let CapacitorFilesystem: any = null;
let CapacitorShare: any = null;
try {
  CapacitorFilesystem = require('@capacitor/filesystem').Filesystem;
  CapacitorFilesystem.Directory = require('@capacitor/filesystem').Directory;
  CapacitorShare = require('@capacitor/share').Share;
} catch (error) {
  console.log('Capacitor plugins not available - running in web mode');
}

const SystemReports = () => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
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

      // Handle mobile vs web download
      if (CapacitorFilesystem && CapacitorShare) {
        // Mobile download using Capacitor
        try {
          const result = await CapacitorFilesystem.writeFile({
            path: filename,
            data: csvContent,
            directory: CapacitorFilesystem.Directory.Documents,
            encoding: 'utf8'
          });

          // Share the file so user can save it where they want
          await CapacitorShare.share({
            title: `${reportType} Report`,
            text: `Generated ${reportType} report`,
            url: result.uri,
            dialogTitle: 'Save Report'
          });

          toast({
            title: "Success",
            description: `${reportType} report saved and ready to share`,
          });
        } catch (capacitorError) {
          console.error('Capacitor file operation failed, falling back to web download:', capacitorError);
          // Fallback to web download
          downloadForWeb(csvContent, filename);
        }
      } else {
        // Web download
        downloadForWeb(csvContent, filename);
      }

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

  const downloadForWeb = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Report downloaded successfully",
    });
  };

  const reports = [
    {
      title: 'Farmers Report',
      description: 'Complete list of all registered farmers',
      type: 'farmers',
      icon: Users,
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      title: 'Cattle Report',
      description: 'All cattle profiles and details',
      type: 'cattle',
      icon: () => <span className="text-2xl">🐄</span>,
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Users Report',
      description: 'System users and their roles',
      type: 'users',
      icon: User,
      gradient: 'from-teal-500 to-cyan-600'
    },
    {
      title: 'Health Checkups Report',
      description: 'All health checkup records',
      type: 'health',
      icon: Heart,
      gradient: 'from-red-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
      <Navigation user={user} />
      
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button and Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-white animate-fade-in">System Reports</h1>
          </div>
          
          <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <FileText className="w-8 h-8 mr-3 text-emerald-400" />
                Generate Reports
              </CardTitle>
              <CardDescription className="text-emerald-300">Generate and download comprehensive system reports</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report, index) => {
                  const IconComponent = report.icon;
                  return (
                    <Card key={report.type} className="agricultural-glass border-emerald-500/20 hover:border-emerald-400/40 transition-all hover:bg-emerald-500/10 backdrop-blur-md animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${report.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            {typeof IconComponent === 'function' && IconComponent.name === '' ? 
                              <IconComponent /> : 
                              <IconComponent className="w-6 h-6 text-white" />
                            }
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">{report.title}</h3>
                            <p className="text-emerald-300 text-sm">{report.description}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => generateReport(report.type)}
                          disabled={isGenerating === report.type}
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {isGenerating === report.type ? 'Generating...' : 'Download CSV'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemReports;
