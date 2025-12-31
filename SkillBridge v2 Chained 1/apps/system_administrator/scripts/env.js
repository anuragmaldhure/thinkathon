/**
 * Application configuration
 * Contains app-wide settings and preferences
 */
const env = {
  ENVIRONMENT: 'development',
  PLATFORM_ENVIRONMENT: 'development',
  AUTH_ENABLED: true,
  SOCIAL_LOGIN_ENABLED: false,
  PHONE_AUTH_ENABLED: false,
  FEEDBACK_ENABLED: true,
  FEEDBACK_API_KEY: 'eyJidXNpbmVzc0lkZWFJZCI6IjFjOWY5MTI4LTgyODAtNGI0Mi1hOWFjLWQ4MmUzNWVkODYxMyIsImNyZWF0ZWRBdCI6MTc2NzAwNzY3NDkwNywiY3JlYXRlZEJ5IjoiY29kZWdlbmVzaXMifQ==',
  ASSISTANT_ENABLED: true,
  TIRAM_AI_TAG_ENABLED: true,
  CLARITY_ENABLED: false,
  app: {
    name: 'SkillBridge',
    logo: 'assets/imgs/logo.svg',
    logoWithText: 'assets/imgs/logo-with-text.png',
    themePreset: 'default',
    navigation: 'sidenav', // Can be 'topnav' or 'sidenav'
    businessIdeaId: '1c9f9128-8280-4b42-a9ac-d82e35ed8613',
    personaRole: 'System Administrator',
    appType: 'business',
  },
  // this key wil be used to setup the firebase config
  // FIREBASE_CONFIG: {
  //   FIREBASE_API_KEY: 'AIzaSyAldxfNbCwJ8FgvIKkZs0YldxSuvD5Tros',
  //   FIREBASE_AUTH_DOMAIN: 'tiram-gen-apps-dev.firebaseapp.com',
  //   FIREBASE_PROJECT_ID: 'tiram-gen-apps-dev',
  //   FIREBASE_STORAGE_BUCKET: 'tiram-gen-apps-dev.firebasestorage.app',
  //   FIREBASE_MESSAGING_SENDER_ID: '840404686153',
  //   FIREBASE_APP_ID: '1:840404686153:web:61f5748dd23271f09f7698',
  //   MEASUREMENT_ID: 'G-0WTW65DNJF',
  //   FIRESTORE_DB_NAME: 'gen-app-db-13',
  // },
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  FIREBASE_CONFIG: {
    FIREBASE_API_KEY: 'AIzaSyCmg0yw5tKI7f_OrqpK7Hm5i9jMqpShuFQ',
    FIREBASE_AUTH_DOMAIN: 'preview-stack.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'preview-stack',
    FIREBASE_STORAGE_BUCKET: 'preview-stack.firebasestorage.app',
    FIREBASE_MESSAGING_SENDER_ID: '499966267572',
    FIREBASE_APP_ID: '1:499966267572:web:51e6bb6c5cbee832e3c7e1',
    MEASUREMENT_ID: 'G-0LGESVYGJ0',
    FIRESTORE_DB_NAME: 'skillbridge',
  },
  BASE_URL: 'https://qvm-api-skillbridge-v2-1c9f.azurewebsites.net/system_administrator',
  REFINER: {
    ENABLED: false,
    POSITION: 'bottom-right', // Can be 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    HIGHLIGHT_COLOR: '#f04a01',
  },
};

export { env };
