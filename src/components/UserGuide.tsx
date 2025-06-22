
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuide = ({ isOpen, onClose }: UserGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const guideSteps = [
    {
      title: "Welcome to Govardhini! 🐄",
      description: "Your comprehensive cattle management system. Let's take a quick tour to get you started.",
      content: "Govardhini helps you manage farmers, cattle, health records, milk production, and much more!"
    },
    {
      title: "Dashboard Overview 📊",
      description: "Your central hub for all cattle management activities.",
      content: "From the dashboard, you can view analytics, quick stats, and access all major features. Keep track of total cattle, milk production, and health scores at a glance."
    },
    {
      title: "Farmer Management 👨‍🌾",
      description: "Register and manage farmer profiles.",
      content: "Use 'Farmer Onboarding' to add new farmers with their location details. Search and view farmer profiles anytime from the 'Farmers List'."
    },
    {
      title: "Cattle Registration 🐄",
      description: "Add and track individual cattle.",
      content: "Register new cattle with details like breed, weight, age, and lactation status. Each cattle gets a unique ID for easy tracking."
    },
    {
      title: "Health Monitoring 🏥",
      description: "Keep track of cattle health and wellness.",
      content: "Record health checkups, track issues, monitor recovery status, and maintain vaccination records for each cattle."
    },
    {
      title: "Milk Production 🥛",
      description: "Log daily milk production data.",
      content: "Record milk quantities for lactating cattle, track production trends, and generate milk production reports."
    },
    {
      title: "Analytics & Reports 📈",
      description: "Get insights from your data.",
      content: "View comprehensive analytics on milk production trends, health statistics, and overall farm performance."
    },
    {
      title: "User Management 👥",
      description: "Manage system users and permissions (Admin only).",
      content: "Admins can approve new users, manage roles, and control access to different features based on user designation."
    }
  ];

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl glass-card border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/10 animate-fade-in">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20"
          >
            <X className="w-5 h-5" />
          </Button>
          <CardTitle className="text-2xl font-bold text-white">
            {guideSteps[currentStep].title}
          </CardTitle>
          <CardDescription className="text-emerald-300 text-lg">
            {guideSteps[currentStep].description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <p className="text-white leading-relaxed">
              {guideSteps[currentStep].content}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-emerald-300 text-sm mb-2">
              <span>Step {currentStep + 1} of {guideSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / guideSteps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-emerald-900/30 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / guideSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <div>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={skipTour}
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
            >
              Skip Tour
            </Button>

            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
            >
              {currentStep === guideSteps.length - 1 ? 'Get Started!' : 'Next'}
              {currentStep < guideSteps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserGuide;
