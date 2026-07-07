
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sunil.physical',
  appName: 'Physical Education App',
  webDir: 'out',
  server: {
    url: 'http://10.54.20.193:9002',
    cleartext: true
  }
};

export default config;
