
import React from 'react';
import { Loader2 } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 flex items-center justify-center z-50">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <div className="mx-auto w-48 h-32 mb-6 flex items-center justify-center">
            <img 
              src="/lovable-uploads/90826b5b-bdf3-4b8c-be34-883255175d64.png" 
              alt="Govardhini Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">GOVARDHINI</h1>
          <h2 className="text-2xl font-semibold text-emerald-300">PREMIUM CATTLE FEED</h2>
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <p className="text-emerald-200 mt-4 text-sm">Loading your dairy management system...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
