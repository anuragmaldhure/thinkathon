let loader = document.getElementById('tiramai-loader');

if (!loader) {
  document.addEventListener('DOMContentLoaded', async () => {
    await document.body.insertAdjacentHTML(
      'beforeend',
      `
    <div
      id="tiramai-loader"
      class="hidden fixed inset-0 bg-background/80 backdrop-blur-sm items-center justify-center z-[999999]"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-t-primary border-b-accent"
      ></div>
    </div>
    `,
    );
    loader = document.getElementById('tiramai-loader');
  });
}

/**
 * Shows the loader with a message
 * @param {string} message - The message to display
 */
export function showLoader(message = 'Loading...') {
  if (loader) {
    // Check if the message div already exists
    let messageDiv = loader.querySelector('.loader-message');
    if (!messageDiv) {
      // If it doesn't exist, create it
      messageDiv = document.createElement('div');
      messageDiv.className = 'loader-message font-medium text-md lg:text-lg';
      loader.appendChild(messageDiv);
    }
    // Update the message
    messageDiv.textContent = message;
    loader.style.display = 'flex';
    loader.style.flexDirection = 'column';
    loader.style.alignItems = 'center';
    loader.style.justifyContent = 'center';
    loader.style.gap = '4px';
  } else {
    console.error('Loader element not found');
  }
}

export function hideLoader() {
  if (loader) {
    loader.style.display = 'none';
  } else {
    console.error('Loader element not found');
  }
}
