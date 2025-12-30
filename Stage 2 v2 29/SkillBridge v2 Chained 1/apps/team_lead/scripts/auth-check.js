/**
 * Simple auth check that can be imported into any page
 * Import this at the top of your page's main script to protect it
 */
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

// Immediately check authentication
const authCheck = new Promise((resolve, reject) => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Redirect to auth page
      window.location.href = '../../auth.html';
      reject(new Error('Not authenticated'));
    } else {
      resolve(user);
    }
  });
});

export default authCheck;
