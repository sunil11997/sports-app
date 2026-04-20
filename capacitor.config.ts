
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.waghamba.sportshub',
  appName: 'शासकीय माध्यमिक आश्रम शाळा वाघांबा',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // To use AI Hub features which are Server Actions, 
    // it's best to point this to your hosted production URL
    url: 'https://studio-7167909516-12009.web.app',
    allowNavigation: [
      'studio-7167909516-12009.web.app',
      '*.google.com',
      '*.firebaseapp.com'
    ]
  }
};

export default config;
