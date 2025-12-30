/**
 * Shared Authentication Utilities
 * Handles auth state monitoring, user data fetching, and role-based access control
 */

import { auth, db } from '../../scripts/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc 
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { showError } from '../toast/toast.js';

/**
 * Setup automatic authentication protection
 * Redirects to auth.html if user is not authenticated
 * @param {Function} onAuthenticatedCallback - Callback function when user is authenticated
 * @returns {Promise} Resolves with user and userData when authenticated
 */
export function setupAutoAuthProtection(onAuthenticatedCallback) {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // User is signed in
          try {
            console.log('[Auth] User authenticated:', user.email);
            
            // Fetch user data from Firestore
            const userData = await getUserData(user.uid, user.email);
            console.log('[Auth] User data fetched:', userData);
            
            // Call the callback if provided
            if (onAuthenticatedCallback) {
              onAuthenticatedCallback(user, userData);
            }
            
            // Resolve the promise
            resolve({ user, userData });
            
            // Unsubscribe after successful authentication
            unsubscribe();
          } catch (error) {
            console.error('[Auth] Error fetching user data:', error);
            showError('Failed to load user data. Please try again.');
            reject(error);
          }
        } else {
          // User is not signed in
          console.log('[Auth] No user authenticated, redirecting to auth page');
          
          // Get current page name
          const currentPage = window.location.pathname.split('/').pop() || 'navigator.html';
          
          // Redirect to auth page with current page as redirect parameter
          window.location.href = `/auth.html?redirect=${encodeURIComponent(currentPage)}`;
        }
      },
      (error) => {
        console.error('[Auth] Auth state change error:', error);
        showError('Authentication error occurred');
        reject(error);
      }
    );
  });
}

/**
 * Get user data from Firestore users collection
 * @param {string} uid - Firebase Auth UID
 * @param {string} email - User email address
 * @returns {Promise<Object>} User data object
 */
export async function getUserData(uid, email) {
  try {
    console.log('[Auth] Fetching user data for uid:', uid, 'email:', email);
    
    // First try to find by uid (if already linked)
    const usersRef = collection(db, 'users');
    let q = query(usersRef, where('uid', '==', uid));
    let querySnapshot = await getDocs(q);
    
    // If not found by uid, try by email (for first-time sign-in)
    if (querySnapshot.empty && email) {
      console.log('[Auth] User not found by uid, trying email:', email);
      q = query(usersRef, where('email', '==', email.toLowerCase()));
      querySnapshot = await getDocs(q);
      
      // If found by email, update the uid field
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const docRef = doc(db, 'users', userDoc.id);
        
        console.log('[Auth] Updating uid field for user document:', userDoc.id);
        await updateDoc(docRef, {
          uid: uid,
          modifiedTimestamp: new Date().toISOString()
        });
      }
    }
    
    if (!querySnapshot.empty) {
      // Get the first matching document
      const userDoc = querySnapshot.docs[0];
      return {
        uid,
        docId: userDoc.id,
        ...userDoc.data()
      };
    } else {
      throw new Error('User data not found in database. Please contact administrator.');
    }
  } catch (error) {
    console.error('[Auth] Error fetching user data:', error);
    throw error;
  }
}

/**
 * Check if user is a team lead
 * A team lead is an employee who has other employees reporting to them
 * @param {string} employeeId - Employee ID to check
 * @returns {Promise<boolean>} True if user is a team lead
 */
export async function isUserTeamLead(employeeId) {
  if (!employeeId) {
    console.log('[Auth] No employeeId provided for team lead check');
    return false;
  }
  
  try {
    console.log('[Auth] Checking if employee is team lead:', employeeId);
    
    // Query users collection to check if any employee has this employeeId as their teamLeadId
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('teamLeadId', '==', employeeId));
    const querySnapshot = await getDocs(q);
    
    const isTeamLead = !querySnapshot.empty;
    console.log('[Auth] Team lead status:', isTeamLead, `(${querySnapshot.size} reportees)`);
    
    return isTeamLead;
  } catch (error) {
    console.error('[Auth] Error checking team lead status:', error);
    // Return false on error to be safe
    return false;
  }
}

/**
 * Determine user roles for app card display
 * Returns array of app identifiers user can access
 * @param {Object} userData - User data from Firestore
 * @returns {Promise<string[]>} Array of accessible app identifiers
 */
export async function getUserAccessibleApps(userData) {
  const accessibleApps = [];
  
  console.log('[Auth] Determining accessible apps for user:', userData.email);
  console.log('[Auth] User role:', userData.role);
  console.log('[Auth] User systemRole:', userData.systemRole);
  
  // Check if System Admin (check systemRole field)
  if (userData.systemRole === 'systemAdmin') {
    accessibleApps.push('system_administrator');
    console.log('[Auth] User has systemAdmin systemRole');
  }
  
  // Check if Employee or Team Lead
  if (userData.systemRole === 'employee' || !userData.systemRole) {
    // All employees can access employee portal
    accessibleApps.push('employee');
    console.log('[Auth] User has employee role');
    
    // Check if this employee is also a team lead
    if (userData.employeeId) {
      const isTeamLead = await isUserTeamLead(userData.id);
      if (isTeamLead) {
        accessibleApps.push('team_lead');
        console.log('[Auth] User is also a team lead');
      }
    }
  }
  
  console.log('[Auth] Accessible apps:', accessibleApps);
  return accessibleApps;
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export async function signOutUser() {
  try {
    // Set intentional logout flag
    window.isIntentionalLogout = true;
    
    // Sign out
    await auth.signOut();
    
    console.log('[Auth] User signed out successfully');
    
    // Redirect to auth page
    window.location.href = '/auth.html';
  } catch (error) {
    console.error('[Auth] Error signing out:', error);
    showError('Failed to sign out. Please try again.');
  }
}

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>} Current user or null if not authenticated
 */
export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
