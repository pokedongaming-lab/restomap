import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'RestoMap',
  slug: 'restomap',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'restomap',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#4F46E5',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.restomap.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#4F46E5',
    },
    package: 'com.restomap.app',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
}

export default config
