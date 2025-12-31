/**
 * Main initialization module for SkillBridge Navigator
 * Handles application setup and module initialization
 */

import { env } from './env.js';
import { showLoader, hideLoader } from './loader.js';

// Global flag to track intentional logout vs session expiration
window.isIntentionalLogout = false;

/**
 * Initialize feedback module
 * Uses Tiram AI feedback library
 */
export function initialiseFeedback(userEmail = null) {
  if (!env.FEEDBACK_ENABLED) {
    console.log('[Main] Feedback disabled in config');
    return;
  }

  console.log('[Main] Initializing Feedback');
  
  // Add CSS
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'https://feedback-lib.tiram.app/tiramai-feedback-lib.css';
  document.head.appendChild(style);

  // Add JS
  const script = document.createElement('script');
  script.src = 'https://feedback-lib.tiram.app/tiramai-feedback-lib.min.js';

  script.onload = function () {
    if (window.TiramaiFeedbackLib) {
      new window.TiramaiFeedbackLib({
        apiKey: env.FEEDBACK_API_KEY,
        businessIdeaId: env.app.businessIdeaId,
        projectName: env.app.name,
        personaRole: env.app.personaRole,
        email: userEmail || 'N/A',
        environment: env.ENVIRONMENT,
      });
      console.log('[Main] Feedback initialized');
    }
  };

  script.onerror = function () {
    console.error('[Main] Failed to load Feedback library');
  };

  document.body.appendChild(script);
}

/**
 * Initialize refiner module
 * Uses Tiram AI refiner library
 */
export function initialiseRefiner(userEmail = null) {
  if (!env.REFINER?.ENABLED) {
    console.log('[Main] Refiner disabled in config');
    return;
  }

  console.log('[Main] Initializing Refiner');
  
  // Add CSS
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'https://refiner-lib.tiram.app/tiramai-refiner-lib.css';
  document.head.appendChild(style);

  // Add JS
  const script = document.createElement('script');
  script.src = 'https://refiner-lib.tiram.app/tiramai-refiner-lib.min.js';

  script.onload = function () {
    if (window.RefinerLib) {
      new window.RefinerLib({
        apiUrl: 'https://code-genesis-dev.azurewebsites.net/refiner/refine-page?env=dev',
        saveApiUrl: 'https://code-genesis-dev.azurewebsites.net/refiner/apply-changes-to-deployments?env=dev',
        suggestionsApiUrl: 'https://code-genesis-dev.azurewebsites.net/refiner/get-element-suggestions?env=dev',
        fabPosition: 'bottom-right',
        highlightColor: '#374151',
        createdBy: userEmail || 'navigator_user@skillbridge.com',
        personaRole: env.app.personaRole,
        appTitle: env.app.name,
        appType: env.app.appType,
        businessIdeaId: env.app.businessIdeaId,
        environment: env.ENVIRONMENT,
      });
      console.log('[Main] Refiner initialized');
    }
  };

  script.onerror = function () {
    console.error('[Main] Failed to load Refiner library');
  };

  document.body.appendChild(script);
}

/**
 * Global page initialization function
 * Can be called after authentication to initialize modules
 * @param {string} userEmail - User's email address
 */
window.initializeMainModules = (userEmail = null) => {
  console.log('[Main] Initializing modules for user:', userEmail || 'anonymous');
  
  // Use requestIdleCallback for non-critical initialization
  const onIdle = (cb) => {
    if ('requestIdleCallback' in window) {
      return requestIdleCallback(cb, { timeout: 2000 });
    }
    return setTimeout(cb, 500);
  };

  onIdle(() => {
    if (env.FEEDBACK_ENABLED) {
      initialiseFeedback(userEmail);
    }
    if (env.REFINER?.ENABLED) {
      initialiseRefiner(userEmail);
    }
  });
};

// Re-export utilities
export { env, showLoader, hideLoader };
