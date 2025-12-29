# Auth Library Documentation

## 1. Overview

This library provides a centralized, automatic, and user-friendly authentication layer for the application. Its primary goal is to protect application pages from unauthenticated access while providing a smooth user experience by preventing content flashing (FOUC - Flash of Unauthenticated Content).

It handles the entire authentication lifecycle, from the initial check when a user lands on a page to automatically injecting authorization tokens into API requests.

---

## 2. Core Features

- **Automatic Page Protection:** Intercepts page loads and ensures an authentication check is completed _before_ any page-specific content is rendered.
- **Seamless Loading Experience:** Displays a full-page loading screen with the application logo the moment the page starts, preventing any jarring flicker of content.
- **Centralized Logic:** Consolidates all authentication state management, loading UI, and redirection logic into a single, cohesive module.
- **Automatic Token Injection:** Provides helper functions designed to be used with a `fetch` interceptor to automatically add the Firebase Auth `Authorization: Bearer` token to all outgoing API requests.
- **Optimized for Performance:** Utilizes `localStorage` to cache the user's authentication state, allowing for near-instant verification for returning users and faster page loads.

---

## 3. Dependencies

For the auth library to function correctly, the following dependencies must be available in the project:

- **`scripts/firebase.js`**: A centralized module that initializes and exports the Firebase `auth` service instance.
- **`scripts/env.js`**: An environment configuration file that exports an `env` object containing:
  - `env.AUTH_ENABLED` (boolean): A flag to enable or disable authentication checks globally.
  - `env.BASE_URL` (string): The base URL for your API, used by the token injection logic.
- **`lib/toast/toast.js`**: A utility for displaying toast notifications (optional, but recommended for user feedback).
- **Firebase Auth SDK**: The library imports `onAuthStateChanged` directly from the Firebase CDN.
- **HTML Structure**: The loading screen injects itself directly into the `<body>`. No specific element is required.

---

## 4. Setup & Integration

The auth library is primarily integrated via the application's main entry point, `scripts/main.js`.

**Step 1: Initialize the Auth Listener**

The core `onAuthStateChanged` listener must be initialized when the application starts. This is done by calling `initializeAuthGuard()` once in the global scope of `main.js`. This function sets up the promise that the entire system relies on.

```javascript
// in scripts/main.js
import { initializeAuthGuard } from '../lib/auth/index.js';

initializeAuthGuard();
```

**Step 2: Set Up Page Protection**

To protect pages, call `setupAutoAuthProtection()` within the `DOMContentLoaded` event listener. This function handles showing the loading screen and checking the auth state. It requires a callback function that will only be executed _after_ a user has been successfully authenticated.

```javascript
// in scripts/main.js
import { setupAutoAuthProtection } from '../lib/auth/index.js';

document.addEventListener('DOMContentLoaded', () => {
  if (env.AUTH_ENABLED) {
    setupAutoAuthProtection((user) => {
      // This code runs ONLY after the user is confirmed to be logged in.
      // 'user' is the Firebase user object.
      console.log('User is authenticated, initializing page modules...');
      window.initializeMainModules(user.email);
    });
  } else {
    // If auth is disabled, run the app immediately.
    window.initializeMainModules(null);
  }
});
```

---

## 5. Public API Reference

The following functions are exported and available for use throughout the application.

### `setupAutoAuthProtection(onAuthenticated, options)`

This is the primary function for protecting a page. It orchestrates the loading screen and the authentication check.

- **`onAuthenticated`** `(user: object) => void`: **(Required)** A callback function that will be executed upon successful authentication. It receives the Firebase `user` object as its only argument. This is where you should place your page initialization logic.
- **`options`** `object`: **(Optional)** A configuration object.
  - `options.skipAuthPages` `string[]`: An array of page names (e.g., `["auth.html"]`) where the auth protection should _not_ run.
  - `options.customTitle` `string`: A custom title to display on the loading screen.
  - `options.customMessage` `string`: A custom message to display on the loading screen.

### `initializeAuthGuard()`

Sets up the core Firebase `onAuthStateChanged` listener. This function is the foundation of the auth system and **must be called once** when the application first loads (`main.js`).

### `addAuthHeader(input, init)`

A helper function designed for a `fetch` interceptor. It awaits the central authentication promise and, if the user is authenticated and the request is to the backend API, it adds the `Authorization: Bearer <token>` header to the request.

- **`input`** `string | URL | Request`: The first argument from a `fetch` call.
- **`init`** `RequestInit`: The second argument from a `fetch` call.

### `handleUnauthorized()`

A helper function for a `fetch` interceptor. It handles 401 Unauthorized responses by clearing authentication-related `localStorage` items and redirecting the user to the login page (`auth.html`).

---

## 6. Example Usage (in `scripts/main.js`)

This is the canonical example of how to integrate the library.

```javascript
import { env } from './env.js';
import { navigation } from '../lib/navigation/index.js';
import {
  setupAutoAuthProtection,
  initializeAuthGuard,
} from '../lib/auth/index.js';
import { initializeFetchInterceptor } from './interceptors.js';

// 1. Initialize the core auth listener immediately.
initializeAuthGuard();

// 2. Initialize the fetch interceptor for automatic token handling.
if (env?.BASE_URL?.trim() !== '') {
  initializeFetchInterceptor();
}

// Global function to be called after auth is confirmed.
window.initializeMainModules = (userEmail = null) => {
  navigation();
  // ... other global initializations
};

// 3. Set up page protection when the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
  if (env.AUTH_ENABLED) {
    // Pass a callback to run after successful authentication.
    setupAutoAuthProtection((user) => {
      window.initializeMainModules(user?.email);

      // Call any page-specific function that may exist.
      if (typeof window.initializePage === 'function') {
        window.initializePage();
      }
    });
  } else {
    // If auth is not enabled, run the app right away.
    window.initializeMainModules(null);
    if (typeof window.initializePage === 'function') {
      window.initializePage();
    }
  }
});
```
