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

const onIdle = (cb) => {
  if ('requestIdleCallback' in window)
    return requestIdleCallback(cb, { timeout: 2000 });
  return setTimeout(cb, 500);
};

const addResourceHints = () => {
  [
    ['dns-prefetch', 'https://www.clarity.ms'],
    ['preconnect', 'https://www.clarity.ms'],
    ['dns-prefetch', 'https://feedback-lib.tiram.app'],
    ['preconnect', 'https://feedback-lib.tiram.app'],
    ['dns-prefetch', 'https://refiner-lib.tiram.app'],
    ['preconnect', 'https://refiner-lib.tiram.app'],
    ['dns-prefetch', 'https://tiramai-helpbot-lib.vercel.app'],
    ['preconnect', 'https://tiramai-helpbot-lib.vercel.app'],
  ].forEach(([rel, href]) => {
    const l = document.createElement('link');
    l.rel = rel;
    l.href = href;
    document.head.appendChild(l);
  });
};
addResourceHints();

// Global page initialization function that can be called by auth system
window.initializeMainModules = (userEmail = null) => {
  // Initialize navigation
  // navigation();

  // Initialize the modules
  onIdle(() => {
    if (env?.ENVIRONMENT?.toLowerCase()?.includes('dev')) {
      if (env?.FEEDBACK_ENABLED) initialiseFeedback(userEmail);
      if (env?.REFINER?.ENABLED) initialiseRefiner(userEmail);
      if (env?.ASSISTANT_ENABLED) initialiseHelpbot();
      if (env?.CLARITY_ENABLED) initialiseClarity();
      if (env?.TIRAM_AI_TAG_ENABLED) renderTiramAITag(userEmail);
    }
  });
};

// Initialize sidenav when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Automatically setup auth protection for all pages
  if (env.AUTH_ENABLED) {
    setupAutoAuthProtection((user) => {
      window.initializeMainModules(user?.email || null);
    });
  } else {
    // If auth is disabled, initialize immediately
    window.initializeMainModules(null);
  }
});

// Initialize the Fetch Interceptor
if (env?.BASE_URL?.trim() !== '') initializeFetchInterceptor();

// Re-export everything that might be needed by HTML pages
export { env, hideLoader, showLoader, showToast };

/**
 * Initialize Microsoft Clarity
 */
const initialiseClarity = () => {
  console.log('[Main] Initializing Clarity');
  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', 'pmiuvhd6tc');

  // Set custom tags for Clarity
  clarity('set', 'business_idea_id', env.app.businessIdeaId);
  clarity('set', 'persona_name', env.app.personaRole);
};

/**
 * Initialize the feedback module
 */
const initialiseFeedback = (userEmail) => {
  console.log('[Main] Initializing Feedback');
  // Add CDN for feedback
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'https://feedback-lib.tiram.app/tiramai-feedback-lib.css';
  document.body.appendChild(style);

  const script = document.createElement('script');
  script.src = 'https://feedback-lib.tiram.app/tiramai-feedback-lib.min.js';

  // Initialize the feedback lib on script load
  script.onload = function () {
    new window.TiramaiFeedbackLib({
      // Required
      apiKey: env?.FEEDBACK_API_KEY ?? 'no_api_key_found',

      // Context
      businessIdeaId: env?.app?.businessIdeaId ?? 'N/A',
      projectName: env?.app?.name ?? 'N/A',
      personaRole: env?.app?.personaRole ?? 'N/A',
      email: userEmail ?? env?.app?.email ?? 'N/A',
      environment: env?.PLATFORM_ENVIRONMENT ?? 'development',

      onError: function (error) {
        console.error('An error occurred during feedback submission:', error);
        // showToast(
        //   "Sorry, we couldn't submit your feedback. Please try again.",
        //   'error',
        // );
      },
    });
  };

  // If the script fails to load, show a warning
  script.onerror = function () {
    console.error(`Failed to load script: ${script.src}`);
    // showToast('Some features may be unavailable', 'warning');
  };

  document.body.appendChild(script);
};

/**
 * Initialize the refiner module
 */
const initialiseRefiner = (userEmail) => {
  console.log('[Main] Initializing Refiner');
  // Add CDN for refiner
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'https://refiner-lib.tiram.app/tiramai-refiner-lib.css';
  document.body.appendChild(style);

  const script = document.createElement('script');
  script.src = 'https://refiner-lib.tiram.app/tiramai-refiner-lib.min.js';

  // Initialize the refiner lib on script load
  script.onload = function () {
    // Initialize the Tiramai Refiner
    new window.RefinerLib({
      fabPosition: env.REFINER.POSITION,
      highlightColor: env.REFINER.HIGHLIGHT_COLOR,
      createdBy: 'no_email@zpqv.com',
      personaRole: env.app.personaRole || 'user',
      appTitle: env.app.name || 'N/A',
      appType: env.app.appType || 'N/A',
      businessIdeaId: env.app.businessIdeaId || '',
      environment: env.PLATFORM_ENVIRONMENT || 'development',
      email: userEmail ?? env?.app?.email ?? 'N/A',
    });
  };

  // If the script fails to load, show a warning
  script.onerror = function () {
    console.error(`Failed to load script: ${script.src}`);
    // showToast('Some features may be unavailable', 'warning');
  };

  document.body.appendChild(script);
};


/**
 * Initialize the helpbot module
 */
const initialiseHelpbot = async () => {
  try {
    const versionResponse = await fetch('https://tiramai-helpbot-lib.vercel.app/version.json?t=' + Date.now());
    const versionData = await versionResponse.json();
    
    // Inject CSS with version
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = versionData.cdn.css;
    document.body.appendChild(style);

    // Inject JS with version
    const script = document.createElement('script');
    script.src = versionData.cdn.js;

    script.onload = function () {
      new window.TiramaiHelpBotLib({
        ideaId: env?.app?.businessIdeaId ?? 'N/A',
        apiKey: env?.FEEDBACK_API_KEY ?? 'no_api_key_found',
        shouldShowMode: false,
        defaultVersion: 'v1'
      });
      console.log('[Main] Helpbot v' + versionData.version + ' initialized');
    };

    script.onerror = function () {
      console.error('[Main] Failed to load Helpbot library');
    };

    document.body.appendChild(script);
  } catch (error) {
    console.error('[Main] Helpbot initialization error:', error);
  }
};

/**
 * Render Made with ❤️ by TiramAi tag
 */
const renderTiramAITag = (userEmail) => {
  const contentWrapper = document.getElementById('page-content-wrapper');
  if (!contentWrapper) {
    console.warn(
      'TiramAi Tag: Could not find page content wrapper to attach footer.',
    );
    return;
  }

  const tiramAiTag = document.createElement('footer');
  tiramAiTag.id = 'tiram-ai-footer';
  tiramAiTag.innerHTML = `
    <style>
      #tiram-ai-footer {
        padding: 24px;
        margin-top: auto; /* This pushes the footer to the bottom in the flex container */
        background-color: #f8fafc; /* A light grey background */
        border-top: 0px solid #e2e8f0; /* A subtle top border */
        text-align: center;
      }
      #tiram-ai-footer .content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
        color: #475569; /* A muted text color */
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #tiram-ai-footer .heart {
        color: #e53e3e;
        transition: transform 0.2s ease;
      }
      #tiram-ai-footer:hover .heart {
        transform: scale(1.1);
      }
      #tiram-ai-footer a {
        color: #3182ce;
        font-weight: 600;
        text-decoration: none;
        position: relative;
        padding-bottom: 2px;
      }
      #tiram-ai-footer a::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 1px;
        bottom: 0;
        left: 0;
        background-color: #3182ce;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.2s ease;
      }
      #tiram-ai-footer a:hover::after {
        transform: scaleX(1);
        transform-origin: left;
      }
    </style>
    <div class="content">
      <span>Made with</span>
      <span class="heart">❤️</span>
      <span>by</span>
      <a href="https://www.tiram.ai/" target="_blank" rel="noopener noreferrer">TiramAi</a>
    </div>
  `;

  // Insert the footer after the main content wrapper
  contentWrapper.insertAdjacentElement('afterend', tiramAiTag);
};
