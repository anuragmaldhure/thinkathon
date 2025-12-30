import { auth } from '../system_administrator/scripts/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

/**
 * Reusable auth guard for all pages
 * Redirects to auth page if user is not authenticated
 * @param {Function} onAuthenticated - Callback function to run when user is authenticated
 * @param {string} redirectUrl - URL to redirect to if not authenticated (default: /auth.html)
 */
export function initAuthGuard(onAuthenticated, redirectUrl = '../../auth.html') {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = redirectUrl;
    } else {
      // User is authenticated, run callback
      if (typeof onAuthenticated === 'function') {
        onAuthenticated(user);
      }
    }
  });
}

/**
 * Alternative auth guard that returns a promise
 * Use this when you need to wait for auth state before proceeding
 * @param {string} redirectUrl - URL to redirect to if not authenticated
 * @returns {Promise<Object>} Firebase user object
 */
export function waitForAuth(redirectUrl = '../../auth.html') {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = redirectUrl;
      } else {
        resolve(user);
      }
    });
  });
}
