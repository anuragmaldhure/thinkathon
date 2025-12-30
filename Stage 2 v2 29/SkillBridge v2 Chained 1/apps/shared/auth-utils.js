import { auth, db } from '../system_administrator/scripts/firebase.js';
import { 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

/**
 * Get user role and check if they have reportees
 * Note: team_lead is NOT a stored role - it's computed dynamically
 * If employee has reportees, they are considered a team_lead
 * Admin access is determined by systemRole === "systemAdmin"
 * @param {string} firebaseUid - Firebase Auth UID
 * @returns {Promise<Object>} { isAdmin, hasReportees, employeeData }
 */
export async function getUserRoleAndReportees(firebaseUid) {
  try {
    // 1. Get employee record by firebaseUid
    const employeeDoc = await getEmployeeByFirebaseUid(firebaseUid);
    
    // 2. Check if user is system admin
    const isAdmin = employeeDoc.systemRole === 'systemAdmin';
    
    // 3. Check if this employee is a team lead (has reportees)
    const reporteesQuery = query(
      collection(db, 'employees'),
      where('teamLeadId', '==', employeeDoc.employeeId),
      where('employeeStatus', '==', 'active')
    );
    const reporteesSnapshot = await getDocs(reporteesQuery);
    
    return {
      isAdmin: isAdmin,
      hasReportees: !reporteesSnapshot.empty,
      employeeData: employeeDoc
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
}

/**
 * Get employee document by Firebase UID
 * @param {string} firebaseUid - Firebase Auth UID
 * @returns {Promise<Object>} Employee data with document ID
 */
export async function getEmployeeByFirebaseUid(firebaseUid) {
  try {
    const q = query(
      collection(db, 'employees'),
      where('firebaseUid', '==', firebaseUid),
      where('employeeStatus', '==', 'active')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Employee record not found or inactive');
    }
    
    return { 
      id: snapshot.docs[0].id, 
      ...snapshot.docs[0].data() 
    };
  } catch (error) {
    console.error('Error fetching employee by firebaseUid:', error);
    throw error;
  }
}

/**
 * Check authentication and redirect if needed
 * @param {string} redirectUrl - URL to redirect to if not authenticated
 * @returns {Promise<Object>} Firebase user object
 */
export function requireAuth(redirectUrl = '/auth.html') {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = redirectUrl;
        reject(new Error('Not authenticated'));
      } else {
        resolve(user);
      }
    });
  });
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>} Current user or null
 */
export function getCurrentUser() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
  });
}
