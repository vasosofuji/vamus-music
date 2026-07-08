import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.matej.vamus',
  appName: 'Vamus',
  webDir: 'public',
  server: {
    url: 'http://10.130.96.248:3000',
    cleartext: true
  }
};

export default config;
