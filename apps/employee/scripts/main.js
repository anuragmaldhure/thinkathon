import { env } from './env.js';

// Import navigation functions
// import { navigation } from '../lib/navigation/index.js';
// Import toast functions
import { showToast } from '../lib/toast/toast.js';
// Import modal functions
// import { Modal, ModalUtils } from '../lib/modal/modal-min.js';
// Import loader functions
import { hideLoader, showLoader } from './loader.js';
// Import auth functions from the dedicated module
import { setupAutoAuthProtection } from '../lib/auth/index.js';
// Import interceptor initializer
import { initializeFetchInterceptor } from './interceptors.js';


// Global page initialization function that can be called by auth system
window.initializeMainModules = (userEmail = null) => {
};

// Initialize sidenav when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Automatically setup auth protection for all pages
  if (env.AUTH_ENABLED) {
    setupAutoAuthProtection((user) => {
    });
  } else {
  }
});

// Initialize the Fetch Interceptor
if (env?.BASE_URL?.trim() !== '') initializeFetchInterceptor();

// Re-export everything that might be needed by HTML pages
export { env, hideLoader, showLoader, showToast };
