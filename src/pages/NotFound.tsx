
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-teal-900 flex items-center justify-center p-4">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5 animate-fade-in">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-6xl">🐄</span>
              </div>
            </div>
            <CardTitle className="text-6xl font-bold text-white mb-4">404</CardTitle>
            <CardTitle className="text-3xl font-bold text-white mb-2">Page Not Found</CardTitle>
            <CardDescription className="text-emerald-300 text-lg">
              Oops! The page you're looking for doesn't exist in our pasture.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className="text-emerald-400 text-lg">
              The cattle may have wandered off, but don't worry - we'll help you find your way back to the farm!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/dashboard')}
                className="grass-green hover:bg-emerald-700 text-white font-semibold px-6 py-3 flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go to Dashboard
              </Button>
              
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400 px-6 py-3 flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </Button>
            </div>

            <div className="mt-8">
              <p className="text-emerald-300 text-sm mb-4">
                Looking for something specific? Try these popular destinations:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/farmers')}
                  className="text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                >
                  Farmers Directory
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/search-farmers')}
                  className="text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                >
                  Search Farmers
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/analytics')}
                  className="text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                >
                  Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional decorative elements */}
        <div className="text-center mt-8 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <p className="text-emerald-400 text-sm opacity-75">
            "Even the best shepherds sometimes lose their way in the digital pasture." 🌾
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
