# Centralized Authentication & Role-Based Navigation - Implementation Plan

## 📋 Overview
Transform SkillBridge from per-app authentication to centralized authentication with role-based app visibility.

---

## 🎯 Objectives

1. **Remove Sign-Up**: Keep only sign-in functionality
2. **Create Default Admin**: Pre-configured admin account
3. **Centralized Authentication**: Single auth page before navigator
4. **Role-Based Navigation**: Show apps based on user role and reportees

---

## 🏗️ Architecture Changes

### Current Flow
```
Root → Navigator → App Auth → App Dashboard
```

### New Flow
```
Root → Centralized Auth → Navigator (Role-Based) → App Dashboard
```

---

## 📦 Phase 1: Authentication Infrastructure Setup

### 1.1 Create Root-Level Auth Page

**File**: `auth.html` (root level)

**Features**:
- ✅ Single sign-in form (no sign-up)
- ✅ Firebase authentication
- ✅ Role detection after login
- ✅ Redirect to navigator.html with user context
- ✅ Forgot password option
- ✅ Error handling & validation

**UI Components**:
```
┌─────────────────────────────────────┐
│         SkillBridge Logo            │
│      Sign In to Your Account        │
│                                     │
│  Email: [___________________]       │
│  Password: [_______________]        │
│                                     │
│  [ ] Remember Me   Forgot Password? │
│                                     │
│  [      Sign In      ]              │
│                                     │
│  Default Admin Credentials:         │
│  Email: admin@skillbridge.com       │
│  Password: Admin@123                │
└─────────────────────────────────────┘
```

---

### 1.2 Create Default Admin Account

**Method 1: Firebase Console (Manual)**
1. Go to Firebase Console → Authentication → Users
2. Add user:
   - Email: `admin@skillbridge.com`
   - Password: `Admin@123`
   - UID: (auto-generated)

**Method 2: Firestore Document**
```javascript
// employees collection
{
  employeeId: "admin-001",
  email: "admin@skillbridge.com",
  firebaseUid: "<firebase-auth-uid>",
  role: "employee",
  systemRole: "systemAdmin", // Check systemRole for admin access
  firstName: "System",
  lastName: "Administrator",
  employeeStatus: "active",
  departmentId: null,
  teamLeadId: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
```

---

### 1.3 Create Shared Auth Utilities

**File**: `apps/shared/auth-utils.js`

**Functions**:

```javascript
/**
 * Get user role and check if they have reportees
 * Note: team_lead is NOT a stored role - it's computed dynamically
 * If employee has reportees, they are considered a team_lead
 * @param {string} firebaseUid - Firebase Auth UID
 * @returns {Promise<Object>} { isAdmin, hasReportees, employeeData }
 */
export async function getUserRoleAndReportees(firebaseUid) {
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
}

/**
 * Get employee document by Firebase UID
 */
export async function getEmployeeByFirebaseUid(firebaseUid) {
  const q = query(
    collection(db, 'employees'),
    where('firebaseUid', '==', firebaseUid),
    where('employeeStatus', '==', 'active')
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    throw new Error('Employee record not found');
  }
  
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

/**
 * Check authentication and redirect if needed
 */
export function requireAuth(redirectUrl = '/auth.html') {
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
```

**File**: `apps/shared/auth-guard.js`

```javascript
/**
 * Reusable auth guard for all pages
 * Add this to the top of every page
 */
import { auth } from '../system_administrator/scripts/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';

export function initAuthGuard() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '../../auth.html';
    }
  });
}
```

---

## 📦 Phase 2: Modify Navigator.html

### 2.1 Add Authentication Check

**Add to navigator.html**:

```javascript
import { auth } from './apps/system_administrator/scripts/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getUserRoleAndReportees } from './apps/shared/auth-utils.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Check authentication
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Redirect to auth page
      window.location.href = './auth.html';
      return;
    }
    
    try {
      // Get user role and reportees
      const userRole = await getUserRoleAndReportees(user.uid);
      
      // Update UI with user info
      displayUserProfile(userRole.employeeData);
      
      // Render app cards based on role
      renderAppCards(userRole);
      
      // Initialize other features
      initialiseFeedback();
      if (!localStorage.getItem('prototype_confirmed')) {
        showConfirmationModal();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Error loading user data. Please try again.');
      await auth.signOut();
      window.location.href = './auth.html';
    }
  });
});
```

---

### 2.2 Dynamic App Card Rendering

**Role-Based Logic**:

```javascript
// Note: team_lead is determined by hasReportees flag, not stored in database
// Admin access is determined by systemRole === "systemAdmin"
function renderAppCards(userRole) {
  const { isAdmin, hasReportees, employeeData } = userRole;
  
  const appsGrid = document.querySelector('.apps-grid');
  appsGrid.innerHTML = ''; // Clear existing cards
  
  // Define app configurations
  const apps = {
    admin: {
      id: 'system_administrator',
      title: 'SkillBridge Admin Portal',
      description: 'Comprehensive administrative platform...',
      persona: 'System Administrator',
      dashboard: 'dashboard.html'
    },
    teamLead: {
      id: 'team_lead',
      title: 'SkillBridge Team Management Portal',
      description: 'Web application for Team Leads...',
      persona: 'Team Lead',
      dashboard: 'team_dashboard.html'
    },
    employee: {
      id: 'employee',
      title: 'SkillBridge Employee Portal',
      description: 'Web application for Employees...',
      persona: 'Employee',
      dashboard: 'employee_dashboard.html'
    }
  };
  
  // Determine which apps to show based on systemRole and reportees
  let appsToShow = [];
  
  if (isAdmin) {
    appsToShow = [apps.admin];
  } else if (hasReportees) {
    appsToShow = [apps.teamLead, apps.employee];
  } else {
    appsToShow = [apps.employee];
  }
  
  // Render cards
  appsToShow.forEach(app => {
    appsGrid.appendChild(createAppCard(app));
  });
}

function createAppCard(app) {
  const card = document.createElement('div');
  card.className = 'app-card';
  card.innerHTML = `
    <div class="app-content">
      <div class="app-info">
        <div class="app-title-container">
          <h3 class="app-title">${app.title}</h3>
          <button class="launch-icon" onclick="navigateToApp('${app.id}', '${app.dashboard}')" title="Launch App">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>
        </div>
        <p class="app-description">${app.description}</p>
        <span class="app-persona">👤 ${app.persona}</span>
      </div>
    </div>
  `;
  return card;
}
```

---

### 2.3 Add User Profile Section

**Add to header**:

```html
<div class="header">
  <!-- Existing content -->
  <h1>SkillBridge</h1>
  
  <!-- NEW: User Profile Section -->
  <div class="user-profile" id="user-profile" style="display: none;">
    <div class="user-info">
      <span class="user-name" id="user-name"></span>
      <span class="user-role" id="user-role"></span>
    </div>
    <button class="sign-out-btn" onclick="handleSignOut()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Sign Out
    </button>
  </div>
  
  <p>Choose an application to explore...</p>
</div>
```

**Add CSS**:

```css
.user-profile {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  box-shadow: var(--shadow-md);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-weight: 600;
  color: var(--gray-900);
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--gray-500);
  background: var(--gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  margin-top: 0.25rem;
}

.sign-out-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.sign-out-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}
```

**Add JavaScript**:

```javascript
function displayUserProfile(employeeData) {
  const userProfile = document.getElementById('user-profile');
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');
  
  userName.textContent = `${employeeData.firstName} ${employeeData.lastName}`;
  
  // Display systemRole if admin, otherwise show role
  const displayRole = employeeData.systemRole === 'systemAdmin' 
    ? 'System Administrator' 
    : employeeData.role;
  userRole.textContent = displayRole.replace('_', ' ').toUpperCase();
  
  userProfile.style.display = 'flex';
}

async function handleSignOut() {
  try {
    await auth.signOut();
    localStorage.removeItem('prototype_confirmed');
    window.location.href = './auth.html';
  } catch (error) {
    console.error('Sign out error:', error);
    alert('Error signing out. Please try again.');
  }
}
```

---

## 📦 Phase 3: Remove Individual App Auth Pages

### 3.1 Files to Delete

```
❌ apps/system_administrator/auth.html
❌ apps/team_lead/auth.html
❌ apps/employee/auth.html
```

---

### 3.2 Add Auth Guards to All Pages

**For each HTML page in all apps, add at the top of script section**:

```html
<script type="module">
  import { auth } from './scripts/firebase.js';
  import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
  
  // Auth guard - redirect if not authenticated
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '../../auth.html';
      return;
    }
    // Continue with page initialization
    initializePage();
  });
  
  async function initializePage() {
    // Existing page initialization code
    // ...
  }
</script>
```

**Pages to Update**:

**System Administrator**:
- analytics_assessment_completion.html
- analytics_dispute_metrics.html
- analytics_skill_gap_heatmap.html
- analytics_tni_dashboard.html
- analytics_training_forecast.html
- assessment_cycle_detail.html
- assessment_cycle_upsert.html
- assessment_cycles_list.html
- dashboard.html
- departments_list.html
- dispute_detail.html
- disputes_list.html
- employee_detail.html
- employee_upsert.html
- employees_list.html
- external_trainer_upsert.html
- skill_categories_list.html
- skill_criticalities_list.html
- skill_detail.html
- skill_upsert.html
- skills_list.html
- trainer_detail.html
- trainers_list.html
- training_session_detail.html
- training_session_upsert.html
- training_sessions_list.html

**Team Lead** (similar pattern):
- add_skills_to_employee.html
- assess_employee.html
- assessment_history.html
- employee_growth.html
- employee_profile.html
- employee_skill_mappings.html
- my_team.html
- skill_trend_analysis.html
- team_dashboard.html
- team_skill_gaps.html
- training_impact.html

**Employee** (similar pattern):
- dispute_detail.html
- employee_dashboard.html
- my_disputes.html
- my_profile.html
- my_skills.html
- my_training_sessions.html
- raise_dispute.html
- skill_growth_detail.html
- training_session_detail.html

---

### 3.3 Update Navigation Links

**Replace all "Sign In/Sign Up" links with "Sign Out"**:

```html
<!-- OLD -->
<a href="./auth.html">Sign In</a>

<!-- NEW -->
<a href="#" onclick="handleSignOut()">Sign Out</a>
```

**Update "Home/Dashboard" links**:

```html
<!-- OLD -->
<a href="./dashboard.html">Dashboard</a>

<!-- NEW -->
<a href="../../navigator.html">Home</a>
```

---

## 📦 Phase 4: Database Structure Updates

### 4.1 Employee Collection Schema

**Required Fields**:

```javascript
{
  // Existing fields
  employeeId: "string",
  email: "string",
  firstName: "string",
  lastName: "string",
  departmentId: "string | null",
  teamLeadId: "string | null",
  employeeStatus: "active" | "inactive",
  role: "employee", // Base role for all employees
  
  // NEW: Required for auth
  firebaseUid: "string", // Link to Firebase Auth user
  systemRole: "systemAdmin" | "", // Check this for admin access, team_lead computed dynamically
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### 4.2 Create Composite Indexes

**File**: `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "employees",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "firebaseUid", "order": "ASCENDING" },
        { "fieldPath": "employeeStatus", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "employees",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "teamLeadId", "order": "ASCENDING" },
        { "fieldPath": "employeeStatus", "order": "ASCENDING" }
      ]
    }
  ]
}
```

**Deploy**:
```bash
firebase deploy --only firestore:indexes
```

---

## 📦 Phase 5: Firebase Security Rules

### 5.1 Update Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to get employee data
    function getEmployeeData() {
      return get(/databases/$(database)/documents/employees/$(request.auth.uid)).data;
    }
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is system admin
    function isSystemAdmin() {
      return isAuthenticated() && getEmployeeData().systemRole == 'systemAdmin';
    }
    
    // Employees collection
    match /employees/{employeeId} {
      // Read: User can read their own record or admin can read all
      allow read: if isAuthenticated() && 
                     (resource.data.firebaseUid == request.auth.uid || isSystemAdmin());
      
      // Write: Only admins can write
      allow write: if isSystemAdmin();
    }
    
    // Other collections (skills, departments, etc.)
    match /{document=**} {
      allow read: if isAuthenticated();
      allow write: if isSystemAdmin();
    }
  }
}
```

---

## 📦 Phase 6: Implementation Checklist

### Step 1: Setup Default Admin ✅

- [ ] Create Firebase Auth user
  - Email: `admin@skillbridge.com`
  - Password: `Admin@123`
- [ ] Create Firestore employee document
  - Link firebaseUid to auth user
  - Set role to "system_administrator"

### Step 2: Create Shared Utilities ✅

- [ ] Create `apps/shared/` folder
- [ ] Create `apps/shared/auth-utils.js`
- [ ] Create `apps/shared/auth-guard.js`
- [ ] Test utility functions

### Step 3: Create Root Auth Page ✅

- [ ] Create `auth.html` at root level
- [ ] Add sign-in form UI
- [ ] Implement Firebase sign-in logic
- [ ] Add forgot password functionality
- [ ] Add error handling
- [ ] Test authentication flow

### Step 4: Modify Navigator ✅

- [ ] Import Firebase Auth
- [ ] Add authentication check
- [ ] Implement role detection
- [ ] Add dynamic app card rendering
- [ ] Add user profile section
- [ ] Add sign-out functionality
- [ ] Test role-based rendering

### Step 5: Update Individual Apps ✅

- [ ] Delete auth.html from each app folder
- [ ] Add auth guard to all pages
  - [ ] System Administrator (26 pages)
  - [ ] Team Lead (11 pages)
  - [ ] Employee (9 pages)
- [ ] Update navigation links
- [ ] Test each app access

### Step 6: Database & Security ✅

- [ ] Update employee records with firebaseUid
- [ ] Create composite indexes
- [ ] Deploy indexes to Firebase
- [ ] Update security rules
- [ ] Test security rules

### Step 7: Testing ✅

- [ ] Test flow: Root → Auth → Navigator
- [ ] Test admin login → Shows only admin card
- [ ] Test team lead (with reportees) → Shows team + employee cards
- [ ] Test employee (no reportees) → Shows only employee card
- [ ] Test direct app access without auth → Redirects to auth
- [ ] Test sign-out → Redirects to auth
- [ ] Test forgot password flow
- [ ] Test cross-browser compatibility

---

## 🧪 Testing Scenarios

### Test Case 1: Admin User
```
1. Navigate to root URL
2. Sign in with admin@skillbridge.com
3. Verify: Only Admin Portal card is visible
4. Click Admin Portal card
5. Verify: Dashboard opens without re-authentication
6. Navigate back to navigator
7. Click Sign Out
8. Verify: Redirected to auth.html
```

### Test Case 2: Team Lead (with reportees)
```
1. Sign in as team lead
2. Verify: Team Management + Employee Portal cards visible
3. Test access to both apps
4. Verify: No admin portal access
```

### Test Case 3: Employee (no reportees)
```
1. Sign in as regular employee
2. Verify: Only Employee Portal card visible
3. Test employee portal access
4. Verify: No admin or team lead access
```

### Test Case 4: Direct App Access
```
1. Sign out completely
2. Try to access: /apps/system_administrator/dashboard.html
3. Verify: Redirected to /auth.html
4. Sign in
5. Verify: Redirected to navigator
6. Verify: Can access app
```

---

## 📊 Data Migration Script

**If you have existing users without firebaseUid**:

```javascript
// migration-script.js
import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

async function migrateEmployees() {
  const employeesRef = collection(db, 'employees');
  const snapshot = await getDocs(employeesRef);
  
  for (const docSnap of snapshot.docs) {
    const employee = docSnap.data();
    
    // Skip if already has firebaseUid
    if (employee.firebaseUid) continue;
    
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        employee.email,
        'TempPassword@123' // Default temp password
      );
      
      // Update Firestore document
      await updateDoc(doc(db, 'employees', docSnap.id), {
        firebaseUid: userCredential.user.uid,
        role: 'employee',
        systemRole: employee.systemRole || '', // Check systemRole for admin
        updatedAt: new Date()
      });
      
      console.log(`Migrated: ${employee.email}`);
    } catch (error) {
      console.error(`Failed to migrate ${employee.email}:`, error);
    }
  }
}

// Run migration
migrateEmployees();
```

---

## 🚀 Deployment Steps

### 1. Pre-Deployment
```bash
# Backup current database
firebase firestore:export gs://your-bucket/backup-$(date +%Y%m%d)

# Test locally
npx http-server -p 5500
```

### 2. Deploy
```bash
# Deploy indexes first
firebase deploy --only firestore:indexes

# Wait for indexes to build (2-5 minutes)

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy hosting
firebase deploy --only hosting
```

### 3. Post-Deployment
- [ ] Test admin login
- [ ] Test all role scenarios
- [ ] Monitor Firebase Auth logs
- [ ] Monitor Firestore usage

---

## 📝 Notes & Considerations

### Security
- Change default admin password immediately after first login
- Implement password reset flow for all users
- Add rate limiting for login attempts
- Enable MFA for admin accounts (future enhancement)

### Performance
- Firestore queries are optimized with composite indexes
- Auth state persists across browser sessions
- Consider implementing auth token refresh logic

### User Experience
- Add loading states during authentication
- Show clear error messages
- Implement "Remember Me" functionality
- Add session timeout (optional)

### Future Enhancements
- [ ] Password reset workflow
- [ ] Email verification
- [ ] Multi-factor authentication
- [ ] Session management dashboard
- [ ] Audit logs for authentication events
- [ ] Role management UI for admins

---

## 🆘 Troubleshooting

### Issue: "Employee record not found"
**Solution**: Ensure firebaseUid in Firestore matches Auth UID

### Issue: "Missing composite index"
**Solution**: Deploy indexes and wait for build completion

### Issue: Auth loop (redirecting to auth repeatedly)
**Solution**: Check onAuthStateChanged implementation

### Issue: Role not detected correctly
**Solution**: Verify employee record has correct role field

---

## 📞 Support

For issues or questions:
- Email: support@tiram.ai
- Documentation: [Link to docs]

---

## ✅ Sign-Off

**Prepared By**: Development Team  
**Date**: December 29, 2025  
**Version**: 1.0  
**Status**: Ready for Implementation
