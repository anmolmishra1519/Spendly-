import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spendly.app',
  appName: 'Spendly',
  webDir: 'dist',
  backgroundColor: '#F7FAFF',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#F7FAFF',
  },
  ios: {
    backgroundColor: '#F7FAFF',
    contentInset: 'automatic',
  },
};

export default config;
