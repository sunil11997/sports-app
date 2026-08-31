
import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.NODE_ENV === 'development';
const devServerUrl = process.env.CAPACITOR_DEV_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.sunil.physical',
  appName: 'Waghamba Sports Health Hub',
  webDir: 'out',
  server: devServerUrl ? {
    url: devServerUrl,
    cleartext: true
  } : undefined,
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#235C36',
      sound: 'beep.wav'
    }
  }
};

export default config;

