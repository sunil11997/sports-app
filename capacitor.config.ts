import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sunil.physical',
  appName: 'Physical Education App',
  webDir: 'public',
  server: {
    url: 'https://physicaleducation.vercel.app',
    cleartext: true
  }
};

export default config;