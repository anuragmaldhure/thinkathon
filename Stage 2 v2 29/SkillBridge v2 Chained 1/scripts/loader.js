/**
 * Loader utilities for showing/hiding loading states
 * Provides consistent loading UI across the application
 */

/**
 * Show a global loading overlay with optional message
 * @param {string} message - Loading message to display
 */
export function showLoader(message = 'Loading...') {
  let loader = document.getElementById('global-loader');
  
  if (!loader) {
    // Create loader if it doesn't exist
    loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
    loader.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" style="border-color: #374151;"></div>
        <p class="text-gray-700 loader-message font-medium">${message}</p>
      </div>
    `;
    document.body.appendChild(loader);
  } else {
    // Update existing loader message
    const messageEl = loader.querySelector('.loader-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
    loader.style.display = 'flex';
  }
}

/**
 * Hide the global loading overlay
 */
export function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.style.display = 'none';
  }
}

/**
 * Remove the loader from DOM completely
 */
export function removeLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.remove();
  }
}
