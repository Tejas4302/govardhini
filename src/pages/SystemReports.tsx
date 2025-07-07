
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';

const SystemReports = () => {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('govardhini_user') || '{}');

  const generateReport = async () => {
    if (!reportType || !startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select report type and date range",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      let query = supabase.from(getTableName(reportType)).select('*');
      
      if (startDate && endDate) {
        query = query.gte('created_at', startDate.toISOString())
                    .lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setReportData(data);
      
      toast({
        title: "Success! ✅",
        description: `${reportType} report generated successfully.`,
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTableName = (type: string) => {
    switch (type) {
      case 'farmers': return 'farmers';
      case 'cattle': return 'cattle_profiles';
      case 'milk': return 'milk_production';
      case 'health': return 'health_checkups';
      default: return 'farmers';
    }
  };

  const downloadReport = () => {
    if (!reportData) return;

    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(reportData[0]).join(",") + "\n" +
      reportData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900">
      <Navigation user={user} />
      
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 md:w-96 md:h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md animate-fade-in">
              <CardHeader>
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-emerald-400 mr-2" />
                  <CardTitle className="text-2xl font-bold text-white">Generate Report</CardTitle>
                </div>
                <CardDescription className="text-emerald-300">
                  Create detailed reports for analysis
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-emerald-200">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="glass-input border-emerald-500/30 text-white">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-emerald-500/30">
                      <SelectItem value="farmers" className="text-white hover:bg-emerald-600/20">
                        Farmers Report
                      </SelectItem>
                      <SelectItem value="cattle" className="text-white hover:bg-emerald-600/20">
                        Cattle Report
                      </SelectItem>
                      <SelectItem value="milk" className="text-white hover:bg-emerald-600/20">
                        Milk Production Report
                      </SelectItem>
                      <SelectItem value="health" className="text-white hover:bg-emerald-600/20">
                        Health Checkups Report
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-emerald-200">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal glass-input border-emerald-500/30 text-white hover:bg-emerald-500/20"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-800 border-emerald-500/30" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-emerald-200">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal glass-input border-emerald-500/30 text-white hover:bg-emerald-500/20"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-800 border-emerald-500/30" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className="text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button
                  onClick={generateReport}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold"
                >
                  {isLoading ? 'Generating...' : 'Generate Report 📊'}
                </Button>
              </CardContent>
            </Card>

            {reportData && (
              <Card className="agricultural-glass border-emerald-500/20 backdrop-blur-md animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">Report Results</CardTitle>
                  <CardDescription className="text-emerald-300">
                    {reportData.length} records found
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <p className="text-emerald-200">
                        Report generated successfully with {reportData.length} records.
                      </p>
                    </div>
                    
                    <Button
                      onClick={downloadReport}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReports;
