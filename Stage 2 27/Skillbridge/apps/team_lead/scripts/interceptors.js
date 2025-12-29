// interceptors.js
import {
  addAuthHeader,
  addAuthHeaderForceRefresh,
  handleUnauthorized,
} from '../lib/auth/index.js';
import { env } from './env.js';

let __fetchInterceptorInitialized = false;

export function initializeFetchInterceptor() {
  if (__fetchInterceptorInitialized) {
    console.debug('[Interceptor] Already initialized, skipping.');
    return;
  }
  __fetchInterceptorInitialized = true;

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const input = args[0];
    const init = args[1] || {};
    const ensureHeaders = (h) =>
      h instanceof Headers ? h : new Headers(h || {});
    const getUrlString = (inp) => {
      if (typeof inp === 'string') return inp;
      if (inp instanceof URL) return inp.toString();
      if (inp instanceof Request) return inp.url;
      return null;
    };

    const urlString = getUrlString(input);
    const isApi = !!(
      urlString &&
      env.BASE_URL &&
      urlString.startsWith(env.BASE_URL)
    );
    if (!isApi) return originalFetch(...args);

    // build safe Request preserving options + headers
    let req;
    if (input instanceof Request) {
      const headers = ensureHeaders(input.headers);
      req = new Request(input, {
        headers,
        ...init,
        headers: ensureHeaders(init.headers || headers),
      });
    } else {
      req = new Request(urlString, {
        ...init,
        headers: ensureHeaders(init.headers),
      });
    }

    try {
      // 1) try with current token
      await addAuthHeader(req, req);
      let res = await originalFetch(req);
      if (res.status !== 401) return res;

      // 2) retry once with forced refresh
      await addAuthHeaderForceRefresh(req, req);
      res = await originalFetch(req);
      if (res.status !== 401) return res;

      // 3) still unauthorized - handle gracefully
      console.warn(`API request to ${urlString} failed with 401 after retry`);
      await handleUnauthorized();
      throw new Error('Unauthorized API request (retry failed)');
    } catch (err) {
      // Don't log auth errors as they are handled by handleUnauthorized
      if (!err.message.includes('Unauthorized')) {
        console.error(`API Fetch failed for ${urlString}:`, err);
      }
      throw err;
    }
  };

  console.log('Fetch interceptor initialized.');
}
