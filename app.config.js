/**
 * CitizenNow Enhanced - Production App Configuration
 * This replaces app.json for environment-aware configuration
 */

const IS_PRODUCTION = process.env.EXPO_PUBLIC_ENV === 'production';
const IS_STAGING = process.env.EXPO_PUBLIC_ENV === 'staging';
const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

export default {
  expo: {
    name: IS_PRODUCTION ? 'CitizenNow' : IS_STAGING ? 'CitizenNow Staging' : 'CitizenNow Dev',
    slug: 'citizennow-enhanced',
    version: APP_VERSION,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },

    // iOS Configuration
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_PRODUCTION
        ? 'com.citizennow.app'
        : IS_STAGING
          ? 'com.citizennow.staging'
          : 'com.citizennow.dev',
      buildNumber: BUILD_NUMBER,
      infoPlist: {
        NSCameraUsageDescription: 'CitizenNow needs camera access to scan documents for citizenship test preparation.',
        NSMicrophoneUsageDescription: 'CitizenNow needs microphone access for pronunciation practice and voice interaction.',
        NSPhotoLibraryUsageDescription: 'CitizenNow needs photo library access to help you upload and manage study materials.',
        NSSpeechRecognitionUsageDescription: 'CitizenNow uses speech recognition to help you practice speaking English and civics answers.',
      },
      config: {
        usesNonExemptEncryption: false, // Set to true if using custom encryption
      },
    },

    // Android Configuration
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: IS_PRODUCTION
        ? 'com.citizennow.app'
        : IS_STAGING
          ? 'com.citizennow.staging'
          : 'com.citizennow.dev',
      versionCode: parseInt(BUILD_NUMBER),
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'CAMERA',
        'RECORD_AUDIO',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'NOTIFICATIONS',
      ],
      config: {
        googleMobileAdsAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY', // Replace if using AdMob
      },
    },

    // Web Configuration
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      output: 'single', // Single-page application
    },

    // Plugins
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff',
          sounds: ['./assets/sounds/notification.wav'],
        },
      ],
    ],

    // Extra configuration
    extra: {
      eas: {
        projectId: '', // Add your EAS project ID here after running: eas init
      },
    },

    // Owner (for EAS)
    owner: '', // Add your Expo username or organization

    // Privacy & Legal
    privacy: 'public', // Change to 'unlisted' if you don't want app in Expo search

    // Updates (OTA Updates via EAS Update)
    updates: {
      fallbackToCacheTimeout: 0,
      url: '', // Will be filled after EAS Update setup
    },
    runtimeVersion: {
      policy: 'sdkVersion', // or 'appVersion' or 'nativeVersion'
    },

    // Asset optimization
    assetBundlePatterns: [
      'assets/**/*',
    ],

    // Hooks
    hooks: {
      postPublish: [],
    },
  },
};
