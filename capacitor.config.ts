import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chatter3.app',
  appName: 'Chatter3',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://app.chatter3.com',
    cleartext: false
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
