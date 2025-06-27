
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0a455a4d7cec4f6bad46cf6b4c6126fe',
  appName: 'govardhini',
  webDir: 'dist',
  server: {
    url: 'https://0a455a4d-7cec-4f6b-ad46-cf6b4c6126fe.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#10b981",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
