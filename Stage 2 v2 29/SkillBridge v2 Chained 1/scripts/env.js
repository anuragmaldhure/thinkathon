/**
 * Navigator Environment Configuration
 * Contains app-wide settings and Firebase configuration for the navigator page
 */
export const env = {
  ENVIRONMENT: 'development',
  PLATFORM_ENVIRONMENT: 'development',
  AUTH_ENABLED: true,
  SOCIAL_LOGIN_ENABLED: false,
  PHONE_AUTH_ENABLED: false,
  FEEDBACK_ENABLED: true,
  FEEDBACK_API_KEY: 'eyJidXNpbmVzc0lkZWFJZCI6IjFjOWY5MTI4LTgyODAtNGI0Mi1hOWFjLWQ4MmUzNWVkODYxMyIsImNyZWF0ZWRBdCI6MTc2NzAwNzY3NTg2MywiY3JlYXRlZEJ5IjoiY29kZWdlbmVzaXMifQ==',
  ASSISTANT_ENABLED: true,
  TIRAM_AI_TAG_ENABLED: true,
  CLARITY_ENABLED: false,
  
  app: {
    name: 'SkillBridge',
    logo: 'assets/imgs/logo.png',
    logoWithText: 'assets/imgs/logo-with-text.png',
    businessIdeaId: '1c9f9128-8280-4b42-a9ac-d82e35ed8613',
    personaRole: 'Navigator',
    appType: 'business',
  },
  
  // Firebase Configuration
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
  
  REFINER: {
    ENABLED: true,
  },
};
