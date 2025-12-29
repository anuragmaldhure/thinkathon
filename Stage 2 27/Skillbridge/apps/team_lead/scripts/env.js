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
  FEEDBACK_API_KEY: 'eyJidXNpbmVzc0lkZWFJZCI6Ijg5ZDllNzg5LTIxYzAtNDk3Zi1iYTljLWQyYzBiOTM2ZGNmOSIsImNyZWF0ZWRBdCI6MTc2Njg0OTE5MzI5MCwiY3JlYXRlZEJ5IjoiY29kZWdlbmVzaXMifQ==',
  ASSISTANT_ENABLED: true,
  TIRAM_AI_TAG_ENABLED: true,
  CLARITY_ENABLED: false,
  app: {
    name: 'SkillBridge',
    logo: 'assets/imgs/logo.png',
    logoWithText: 'assets/imgs/logo-with-text.png',
    themePreset: 'default',
    navigation: 'sidenav', // Can be 'topnav' or 'sidenav'
    businessIdeaId: '89d9e789-21c0-497f-ba9c-d2c0b936dcf9',
    personaRole: 'Team Lead',
    appType: 'business',
  },
  // this key wil be used to setup the firebase config
  FIREBASE_CONFIG: {
    FIREBASE_API_KEY: 'AIzaSyAldxfNbCwJ8FgvIKkZs0YldxSuvD5Tros',
    FIREBASE_AUTH_DOMAIN: 'tiram-gen-apps-dev.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'tiram-gen-apps-dev',
    FIREBASE_STORAGE_BUCKET: 'tiram-gen-apps-dev.firebasestorage.app',
    FIREBASE_MESSAGING_SENDER_ID: '840404686153',
    FIREBASE_APP_ID: '1:840404686153:web:61f5748dd23271f09f7698',
    MEASUREMENT_ID: 'G-0WTW65DNJF',
    FIRESTORE_DB_NAME: 'gen-app-db-10',
  },
  BASE_URL: 'https://qvm-api-skillbridge-89d9.azurewebsites.net/team_lead',
  REFINER: {
    ENABLED: false,
    POSITION: 'bottom-right', // Can be 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    HIGHLIGHT_COLOR: '#f04a01',
  },
};

export { env };
