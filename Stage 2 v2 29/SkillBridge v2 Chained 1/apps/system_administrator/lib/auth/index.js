/**
 * @fileoverview Handles Firebase authentication setup, state management, and token injection.
 */
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { showToast } from '../toast/toast.js'; // Assuming showToast is needed here for 401
import { env } from '../../scripts/env.js';
import { auth } from '../../scripts/firebase.js';

// --- Auth State Promise ---
let authStateResolved = false;
let resolveAuthStatePromise;
let rejectAuthStatePromise;
const authStatePromise = new Promise((resolve, reject) => {
  resolveAuthStatePromise = resolve;
  rejectAuthStatePromise = reject;
});

/**
 * Quickly check if user might be authenticated based on cached data
 * This is used for immediate UI decisions before Firebase auth resolves
 * @returns {boolean} true if user appears to be authenticated (cached)
 */
function getCachedAuthState() {
  const s = localStorage.getItem('lastAuthState');
  const t = localStorage.getItem('lastAuthTime');
  if (!s || !t) return false;

  // Reduce cache validity to 2 minutes for better security and freshness
  const isValidCache =
    Date.now() - parseInt(t, 10) < 2 * 60 * 1000 && s === 'authenticated';

  if (isValidCache) {
    // Double-check with current Firebase auth state if available
    try {
      if (auth.currentUser) {
        return true;
      }
    } catch (e) {
      console.warn('Error checking current auth state:', e);
    }
  }

  return isValidCache;
}

/**
 * Cache the current auth state for faster subsequent loads
 * @param {boolean} isAuthenticated
 */
function cacheAuthState(isAuthenticated) {
  localStorage.setItem(
    'lastAuthState',
    isAuthenticated ? 'authenticated' : 'unauthenticated',
  );
  localStorage.setItem('lastAuthTime', Date.now().toString());
}

// Ensure we only resolve the promise once, but update cache on all state changes
const resolveInitialAuthState = (user) => {
  if (!authStateResolved) {
    authStateResolved = true;
    resolveAuthStatePromise(user || null); // Resolve with the user object (or null)
  }

  // Always update cache when auth state changes (not just on initial load)
  cacheAuthState(!!user);
};

// Helper function to reject auth state promise on critical errors
const rejectAuthStateOnError = (error) => {
  if (!authStateResolved) {
    authStateResolved = true;
    rejectAuthStatePromise(error);
  }
};

// --- Auth Guard ---
let __authGuardInitialized = false;

/**
 * Initializes the authentication state listener, manages the authStatePromise,
 * and redirects to login if necessary.
 */
export function initializeAuthGuard() {
  if (__authGuardInitialized) {
    console.debug('[AuthGuard] Already initialized, skipping.');
    return;
  }
  __authGuardInitialized = true;

  onAuthStateChanged(
    auth,
    (user) => {
      // Resolve the promise with the initial user state
      resolveInitialAuthState(user);

      // Perform redirection check only if auth is enabled and not on auth page
      if (env.AUTH_ENABLED && !window.location.pathname.includes('auth.html')) {
        if (!user) {
          console.log(
            'Auth Guard: No user signed in, redirecting to auth.html',
          );
          handleUnauthorized(); // Use the common unauthorized handler
        }
      }
    },
    (error) => {
      console.error('Auth Guard: Error checking auth state:', error);
      // Reject the promise on critical errors, resolve with null for non-critical
      if (
        error.code === 'auth/network-request-failed' ||
        error.code === 'auth/internal-error'
      ) {
        rejectAuthStateOnError(error);
      } else {
        resolveInitialAuthState(null);
      }

      // Still handle redirect if appropriate based on error/policy
      if (env.AUTH_ENABLED && !window.location.pathname.includes('auth.html')) {
        handleUnauthorized();
      }
    },
  );
}

// --- Fetch Interceptor Helpers ---

/**
 * Attempts to add the Firebase Authorization header to the fetch request options.
 * Waits for initial auth state to be determined.
 * @param {string | URL | Request} input - The fetch input (URL or Request object).
 * @param {RequestInit} init - The fetch options object.
 * @returns {Promise<void>}
 */
export async function addAuthHeader(input, init) {
  await authStatePromise;
  const url = typeof input === 'string' ? input : input?.url;
  if (
    typeof url === 'string' &&
    url.startsWith(env.BASE_URL) &&
    auth.currentUser
  ) {
    try {
      const token = await auth.currentUser.getIdToken(); // no force
      init.headers = init.headers || {};
      init.headers.set
        ? init.headers.set('Authorization', `Bearer ${token}`)
        : (init.headers['Authorization'] = `Bearer ${token}`);
    } catch (e) {
      console.warn('ID token (non-force) error:', e);
    }
  }
}

export async function addAuthHeaderForceRefresh(input, init) {
  await authStatePromise;
  const url = typeof input === 'string' ? input : input?.url;
  if (
    typeof url === 'string' &&
    url.startsWith(env.BASE_URL) &&
    auth.currentUser
  ) {
    const token = await auth.currentUser.getIdToken(true); // force
    init.headers = init.headers || {};
    init.headers.set
      ? init.headers.set('Authorization', `Bearer ${token}`)
      : (init.headers['Authorization'] = `Bearer ${token}`);
  }
}

/**
 * Handles the scenario when a 401 Unauthorized response is received or auth state is invalid.
 * Clears token, shows message, and redirects to login.
 */
export async function handleUnauthorized() {
  console.warn('Handling unauthorized state: clearing token and redirecting.');
  localStorage.removeItem('refreshToken'); // Only remove auth-related item

  // Clear cached auth state since user is now unauthorized
  localStorage.removeItem('lastAuthState');
  localStorage.removeItem('lastAuthTime');

  // Clean up any existing loading screens before redirecting
  if (globalAuthLoadingScreen) {
    const loadingControls = {
      hide: () => {
        const screen = document.getElementById('global-auth-loading-screen');
        if (screen) {
          screen.style.opacity = '0';
          setTimeout(() => {
            if (screen && screen.parentNode) {
              screen.remove();
              const styles = document.getElementById('auth-loading-styles');
              if (styles) styles.remove();
              globalAuthLoadingScreen = null;
            }
          }, 300);
        }
      },
    };
    loadingControls.hide();
  }

  try {
    showToast?.('Session expired. Redirecting…', 'error');
  } catch {}
  setTimeout(() => {
    window.location.href = 'auth.html';
  }, 300);
}

/**
 * Fast initial auth check for page load - prevents content flashing
 * Should be called before rendering any protected content
 * @param {string} currentPage - Current page path for redirection logic
 * @returns {Promise<{shouldRender: boolean, shouldRedirect: boolean, redirectTo: string}>}
 */
async function performInitialAuthCheck(currentPage = window.location.pathname) {
  const isOnAuthPage = currentPage.includes('auth.html');

  // If auth is disabled, always allow rendering
  if (!env.AUTH_ENABLED) {
    return { shouldRender: true, shouldRedirect: false, redirectTo: null };
  }

  // If we're on the auth page, no need for additional checks
  if (isOnAuthPage) {
    return { shouldRender: true, shouldRedirect: false, redirectTo: null };
  }

  // Quick check: if we have cached auth state, use it for immediate decision
  const cachedAuthState = getCachedAuthState();

  if (cachedAuthState) {
    // User appears to be authenticated based on cache, allow rendering
    // Firebase auth will verify in background
    return { shouldRender: true, shouldRedirect: false, redirectTo: null };
  }

  // Ensure auth guard is initialized before waiting for auth state
  if (!__authGuardInitialized) {
    initializeAuthGuard();
  }

  // No cached auth state, wait for Firebase to determine actual state
  try {
    // First, check if Firebase auth is already initialized and has current user
    if (auth.currentUser !== null && auth.currentUser !== undefined) {
      // Auth is already determined, use current user state
      const user = auth.currentUser;
      if (user) {
        return { shouldRender: true, shouldRedirect: false, redirectTo: null };
      } else {
        return {
          shouldRender: false,
          shouldRedirect: true,
          redirectTo: 'auth.html',
        };
      }
    }

    // If auth state is still being determined, wait for it with a reasonable timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Auth state determination timeout')),
        8000,
      ); // 8 second timeout
    });

    const user = await Promise.race([authStatePromise, timeoutPromise]);

    if (user) {
      // User is authenticated, allow rendering
      return { shouldRender: true, shouldRedirect: false, redirectTo: null };
    } else {
      // User is not authenticated, redirect to auth page
      return {
        shouldRender: false,
        shouldRedirect: true,
        redirectTo: 'auth.html',
      };
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    // On error or timeout, redirect to auth for safety
    return {
      shouldRender: false,
      shouldRedirect: true,
      redirectTo: 'auth.html',
    };
  }
}

/**
 * Enhanced auth guard that can be used for smooth page transitions
 * @param {Object} options - Configuration options
 * @param {Function} options.onAuthChecking - Called when auth check starts
 * @param {Function} options.onAuthenticated - Called when user is authenticated
 * @param {Function} options.onUnauthenticated - Called when user is not authenticated
 * @param {boolean} options.immediateRedirect - Whether to redirect immediately or call callback
 */
async function initializeEnhancedAuthGuard(options = {}) {
  const {
    onAuthChecking = () => {},
    onAuthenticated = () => {},
    onUnauthenticated = () => {},
    immediateRedirect = true,
  } = options;

  onAuthChecking();

  try {
    const authResult = await performInitialAuthCheck();

    if (authResult.shouldRedirect) {
      if (immediateRedirect) {
        window.location.href = authResult.redirectTo;
      } else {
        onUnauthenticated();
      }
    } else if (authResult.shouldRender) {
      onAuthenticated();
    }
  } catch (error) {
    console.error('Enhanced auth guard failed:', error);
    // On error, redirect to auth for safety
    if (immediateRedirect) {
      window.location.href = 'auth.html';
    } else {
      onUnauthenticated();
    }
  }

  // Set up the regular auth state listener for ongoing monitoring
  initializeAuthGuard();
}

/**
 * Automatically injects and manages auth loading screen for any page
 * This runs automatically when the auth module is imported
 */
let globalAuthLoadingScreen = null;

/**
 * Creates and shows the global auth loading screen
 * Automatically injects CSS and HTML needed
 */
function createGlobalAuthLoadingScreen() {
  // Helper function to create control methods
  const createControls = (screenElement) => ({
    updateMessage: (message) => {
      try {
        const messageEl = document.querySelector('.auth-loading-message');
        if (messageEl) messageEl.textContent = message;
      } catch (e) {
        console.warn('Failed to update loading message:', e);
      }
    },

    hide: () => {
      try {
        const screen =
          screenElement ||
          document.getElementById('global-auth-loading-screen');
        if (screen) {
          screen.style.opacity = '0';
          setTimeout(() => {
            if (screen && screen.parentNode) {
              screen.remove();
              // Also remove the styles
              const styles = document.getElementById('auth-loading-styles');
              if (styles) styles.remove();
              globalAuthLoadingScreen = null;
            }
          }, 300);
        }
      } catch (e) {
        console.warn('Failed to hide loading screen:', e);
        // Force cleanup on error
        globalAuthLoadingScreen = null;
      }
    },

    remove: () => {
      try {
        const screen =
          screenElement ||
          document.getElementById('global-auth-loading-screen');
        if (screen && screen.parentNode) {
          screen.remove();
          const styles = document.getElementById('auth-loading-styles');
          if (styles) styles.remove();
          globalAuthLoadingScreen = null;
        }
      } catch (e) {
        console.warn('Failed to remove loading screen:', e);
        // Force cleanup on error
        globalAuthLoadingScreen = null;
      }
    },
  });

  // If loading screen already exists, return controls for it
  const existingScreen =
    globalAuthLoadingScreen ||
    document.getElementById('global-auth-loading-screen');
  if (existingScreen) {
    console.debug(
      '[Auth] Loading screen already exists, returning existing controls',
    );
    return createControls(existingScreen);
  }

  // Inject critical CSS first for immediate styling
  const criticalCSS = `
    <style id="auth-loading-styles">
      #global-auth-loading-screen {
        position: fixed;
        inset: 0;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 1;
        transition: opacity 0.3s ease-out;
      }
      .auth-loading-container {
        text-align: center;
      }
      .auth-loading-logo {
        height: 4rem;
        width: auto;
        margin: 0 auto 1rem auto;
      }
      .auth-loading-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 0.5rem;
        font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .auth-loading-spinner-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: #64748b;
        margin-top: 1.5rem;
      }
      .auth-loading-spinner {
        animation: spin 1s linear infinite;
        border-radius: 50%;
        height: 1.5rem;
        width: 1.5rem;
        border: 2px solid transparent;
        border-top: 2px solid #94a3b8;
        border-bottom: 2px solid #94a3b8;
      }
      .auth-loading-message {
        font-size: 0.875rem;
        font-weight: 500;
        font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    </style>
  `;

  // Inject CSS into head
  document.head.insertAdjacentHTML('beforeend', criticalCSS);

  // Create loading screen HTML
  const loadingHTML = `
    <div id="global-auth-loading-screen">
      <div class="auth-loading-container">
        <div class="mb-6">
          <img src="../../assets/imgs/logo.svg" alt="Logo" class="auth-loading-logo" />
          <h1 class="auth-loading-title">${env.app.name}</h1>
        </div>
        <div class="auth-loading-spinner-container">
          <div class="auth-loading-spinner"></div>
          <span class="auth-loading-message">Initializing application...</span>
        </div>
      </div>
    </div>
  `;

  // Inject into body as first child for maximum visibility
  document.body.insertAdjacentHTML('afterbegin', loadingHTML);
  globalAuthLoadingScreen = document.getElementById(
    'global-auth-loading-screen',
  );

  return createControls(globalAuthLoadingScreen);
}

/**
 * Automatic auth protection setup for pages
 * This runs automatically when main.js is loaded
 * @param {Function} onAuthenticated - Callback when user is authenticated and page should initialize
 * @param {Object} options - Configuration options
 */
export function setupAutoAuthProtection(onAuthenticated = null, options = {}) {
  const {
    skipAuthPages = ['auth.html'],
    customTitle = null,
    customMessage = null,
  } = options;

  const currentPath = window.location.pathname;
  const isAuthPage = skipAuthPages.some((page) => currentPath.includes(page));

  // Skip auth protection for auth pages
  if (isAuthPage) {
    console.log('Skipping auth protection for auth page');
    return;
  }

  // Create loading screen immediately
  const loadingControls = createGlobalAuthLoadingScreen();

  // Safety check: ensure loadingControls is valid
  if (!loadingControls) {
    console.error('[Auth] Failed to create loading controls');
    return;
  }

  // Update title if custom one provided
  if (customTitle) {
    const titleEl = document.querySelector('.auth-loading-title');
    if (titleEl) titleEl.textContent = customTitle;
  }

  // Update initial message if provided
  if (customMessage) {
    loadingControls.updateMessage(customMessage);
  }

  // Initialize enhanced auth guard
  initializeEnhancedAuthGuard({
    onAuthChecking: () => {
      loadingControls?.updateMessage('Checking authentication...');
    },
    onAuthenticated: (user) => {
      loadingControls?.updateMessage('Loading page...');
      loadingControls?.hide();

      // Call the page-specific initialization if provided
      if (onAuthenticated && typeof onAuthenticated === 'function') {
        onAuthenticated(user);
      }
    },
    onUnauthenticated: () => {
      loadingControls?.updateMessage('Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/auth.html';
      }, 500);
    },
    immediateRedirect: false,
  });
}
