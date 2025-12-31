# Authentication and Role-Based Navigation Implementation Plan

## Executive Summary
This document outlines the detailed implementation plan for adding Firebase Authentication to the SkillBridge navigator.html and implementing role-based app card visibility based on user roles. The implementation follows the Jewelmer authentication pattern as a reference.

---

## Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [Target Architecture](#target-architecture)
3. [Database Schema](#database-schema)
4. [Implementation Phases](#implementation-phases)
5. [Detailed Implementation Steps](#detailed-implementation-steps)
6. [Role-Based Logic](#role-based-logic)
7. [File Structure](#file-structure)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Rollback Plan](#rollback-plan)

---

## 1. Current State Analysis

### Current navigator.html Structure
- **Pure HTML/CSS/JS implementation** without authentication
- **Three app cards** displayed to all users:
  - SkillBridge Admin Portal (`apps/system_administrator/dashboard.html`)
  - SkillBridge Team Management Portal (`apps/team_lead/team_dashboard.html`)
  - SkillBridge Employee Portal (`apps/employee/employee_dashboard.html`)
- **No user session management**
- **No role-based access control**

### Existing Infrastructure in Sub-Apps
- Each app folder (`employee`, `team_lead`, `system_administrator`) has:
  - `scripts/firebase.js` - Firebase configuration
  - `scripts/env.js` - Environment variables
  - `scripts/main.js` - Main application logic
  - Firebase Firestore integration (both Full and Lite)

---

## 2. Target Architecture

### High-Level Flow
```
User visits navigator.html
    ↓
Authentication Check
    ↓
NOT AUTHENTICATED → Redirect to auth.html with redirect parameter
    ↓
User Signs In (Email/Phone/Social)
    ↓
Fetch User Data from Firestore
    ↓
Determine User Role(s)
    ↓
Check if User is Team Lead (has reportees)
    ↓
Display Appropriate App Cards
    ↓
User Clicks App Card → Navigate to App
```

### Components to Create
1. **auth.html** - Authentication page (similar to Jewelmer)
2. **auth/ folder structure** - Shared authentication library
3. **firebase.js** - Firebase configuration for navigator
4. **Role Detection Logic** - Dynamic app card filtering

---

## 3. Database Schema

### Collections Structure

#### `users` Collection
```javascript
{
  uid: "string",              // Firebase Auth UID
  email: "string",            // User email
  firstName: "string",        // First name
  lastName: "string",         // Last name
  role: "string",             // Primary role: "systemAdmin" | "employee" | "teamLead"
  employeeId: "string",       // Unique employee identifier
  departmentId: "string",     // Department reference
  createdAt: "timestamp",
  updatedAt: "timestamp",
  lastLoginAt: "timestamp"
}
```

#### `employees` Collection
```javascript
{
  id: "string",               // Employee ID (matches user.employeeId)
  firstName: "string",
  lastName: "string",
  email: "string",
  departmentId: "string",
  teamLeadId: "string|null",  // ID of team lead (null if no team lead)
  isActive: boolean,
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### Role Determination Logic

#### Role Hierarchy
1. **System Administrator** (systemAdmin)
   - Has role = "systemAdmin" in users collection
   - Can access Admin Portal

2. **Team Lead** (teamLead)
   - Has role = "employee" in users collection
   - **AND** other employees have this employee's ID as their teamLeadId
   - Can access Team Management Portal + Employee Portal

3. **Employee** (employee)
   - Has role = "employee" in users collection
   - No other employees have this employee's ID as their teamLeadId
   - Can access Employee Portal only

---

## 4. Implementation Phases

### Phase 1: Authentication Infrastructure (Days 1-2)
- Create auth.html page
- Set up Firebase configuration
- Implement authentication methods (Email, Phone, Social)
- Create redirect flow

### Phase 2: Role Detection Logic (Days 3-4)
- Create getUserData function
- Implement isTeamLead check
- Build role determination algorithm

### Phase 3: Dynamic App Cards (Days 5-6)
- Implement conditional rendering
- Add role-based filtering
- Update navigator.html UI

### Phase 4: Testing & Refinement (Days 7-8)
- Test all role scenarios
- Implement error handling
- Add loading states
- Security audit

---

## 5. Detailed Implementation Steps

### Step 1: Create Root-Level Files

#### A. Create `auth.html`
**Location:** Root folder (same level as navigator.html)

**Key Features:**
- Email/Password Sign In
- Email/Password Sign Up with email verification
- Forgot Password flow
- Optional: Phone Auth (if enabled)
- Optional: Social Login (Google, Apple)
- Redirect back to navigator.html after successful auth

**Based on Jewelmer Pattern:**
```html
<!-- Structure -->
- Header with logo/branding
- Auth form container
  - Email/Password form
  - Sign Up form
  - Forgot Password form
- Social login buttons (optional)
- Phone auth (optional)
- Terms & Privacy links
```

#### B. Create `scripts/` folder structure
```
SkillBridge v2 Chained 1/
├── auth.html
├── navigator.html
├── scripts/
│   ├── firebase.js         (NEW)
│   ├── env.js              (NEW)
│   ├── main.js             (NEW)
│   ├── loader.js           (NEW)
│   ├── interceptors.js     (OPTIONAL)
├── lib/
│   ├── auth/
│   │   └── index.js        (NEW - Shared auth utilities)
│   ├── toast/
│   │   └── toast.js        (NEW - For notifications)
│   ├── tailwindcss/
│       └── tailwindcss.js  (OPTIONAL)
```

---

### Step 2: Create Firebase Configuration

#### File: `scripts/firebase.js`
```javascript
/**
 * Firebase configuration for SkillBridge Navigator
 * Centralized Firebase initialization
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
import { env } from './env.js';

// Firebase configuration from env
const firebaseConfig = {
  apiKey: env.FIREBASE_CONFIG.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_CONFIG.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_CONFIG.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_CONFIG.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_CONFIG.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_CONFIG.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_CONFIG.MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

### Step 3: Create Environment Configuration

#### File: `scripts/env.js`
```javascript
/**
 * Environment configuration
 * Copy from apps/employee/scripts/env.js or apps/system_administrator/scripts/env.js
 */

export const env = {
  AUTH_ENABLED: true,
  PHONE_AUTH_ENABLED: false,  // Optional
  SOCIAL_LOGIN_ENABLED: false, // Optional
  
  FIREBASE_CONFIG: {
    FIREBASE_API_KEY: "YOUR_API_KEY",
    FIREBASE_AUTH_DOMAIN: "YOUR_AUTH_DOMAIN",
    FIREBASE_PROJECT_ID: "YOUR_PROJECT_ID",
    FIREBASE_STORAGE_BUCKET: "YOUR_STORAGE_BUCKET",
    FIREBASE_MESSAGING_SENDER_ID: "YOUR_SENDER_ID",
    FIREBASE_APP_ID: "YOUR_APP_ID",
    MEASUREMENT_ID: "YOUR_MEASUREMENT_ID"
  },
  
  // Other configuration...
};
```

---

### Step 4: Create Authentication Utilities

#### File: `lib/auth/index.js`
```javascript
/**
 * Shared authentication utilities
 * Handles auth state monitoring and redirection
 */

import { auth, db } from '../../scripts/firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { doc, getDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

/**
 * Setup automatic authentication protection
 * Redirects to auth.html if user is not authenticated
 */
export function setupAutoAuthProtection(onAuthenticatedCallback) {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          // Fetch user data
          const userData = await getUserData(user.uid);
          
          if (onAuthenticatedCallback) {
            onAuthenticatedCallback(user, userData);
          }
          
          resolve({ user, userData });
        } catch (error) {
          console.error('Error fetching user data:', error);
          reject(error);
        }
      } else {
        // User is not signed in
        // Redirect to auth page with current page as redirect parameter
        const currentPage = window.location.pathname.split('/').pop();
        window.location.href = `auth.html?redirect=${currentPage}`;
      }
    }, reject);
  });
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    throw new Error('User data not found');
  }
}

/**
 * Check if user is a team lead
 * A team lead is an employee who has other employees reporting to them
 */
export async function isUserTeamLead(employeeId) {
  if (!employeeId) return false;
  
  try {
    // Query employees collection to check if any employee has this employeeId as their teamLeadId
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, where('teamLeadId', '==', employeeId));
    const querySnapshot = await getDocs(q);
    
    // If any documents found, user is a team lead
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking team lead status:', error);
    return false;
  }
}

/**
 * Determine user roles for app card display
 * Returns array of app identifiers user can access
 */
export async function getUserAccessibleApps(userData) {
  const accessibleApps = [];
  
  // Check if System Admin
  if (userData.role === 'systemAdmin') {
    accessibleApps.push('system_administrator');
  }
  
  // Check if Employee or Team Lead
  if (userData.role === 'employee') {
    // All employees can access employee portal
    accessibleApps.push('employee');
    
    // Check if this employee is also a team lead
    const isTeamLead = await isUserTeamLead(userData.employeeId);
    if (isTeamLead) {
      accessibleApps.push('team_lead');
    }
  }
  
  return accessibleApps;
}
```

---

### Step 5: Update navigator.html

#### A. Add Script Imports
```html
<head>
  <!-- Existing head content -->
  
  <!-- Add Tailwind CSS for auth page consistency -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Firebase and main scripts -->
  <script type="module" src="scripts/main.js"></script>
</head>
```

#### B. Create Loading State
```html
<body>
  <!-- Loading overlay -->
  <div id="auth-loading" class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg shadow-xl text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-gray-700">Verifying your access...</p>
    </div>
  </div>
  
  <!-- Existing container (initially hidden) -->
  <div class="container" id="main-content" style="display: none;">
    <!-- Existing content -->
  </div>
</body>
```

#### C. Add Dynamic App Card Rendering Logic
```javascript
<script type="module">
  import { setupAutoAuthProtection, getUserAccessibleApps } from './lib/auth/index.js';
  
  // App card configurations
  const APP_CARDS = {
    system_administrator: {
      title: 'SkillBridge Admin Portal',
      description: 'Comprehensive web-based administrative platform...',
      persona: '👤 System Administrator',
      entryPoint: 'dashboard.html'
    },
    team_lead: {
      title: 'SkillBridge Team Management Portal',
      description: 'Web application for Team Leads...',
      persona: '👤 Team Lead',
      entryPoint: 'team_dashboard.html'
    },
    employee: {
      title: 'SkillBridge Employee Portal',
      description: 'Web application for Employees...',
      persona: '👤 Employee',
      entryPoint: 'employee_dashboard.html'
    }
  };
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // Setup auth protection
      const { user, userData } = await setupAutoAuthProtection();
      
      // Get accessible apps for this user
      const accessibleApps = await getUserAccessibleApps(userData);
      
      // Render app cards
      renderAppCards(accessibleApps);
      
      // Hide loading, show content
      document.getElementById('auth-loading').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
      
    } catch (error) {
      console.error('Authentication error:', error);
      // Redirect to auth page
      window.location.href = 'auth.html?redirect=navigator.html';
    }
  });
  
  function renderAppCards(accessibleApps) {
    const appsGrid = document.querySelector('.apps-grid');
    appsGrid.innerHTML = ''; // Clear existing cards
    
    // Render cards in specific order
    const cardOrder = ['system_administrator', 'team_lead', 'employee'];
    
    cardOrder.forEach(appKey => {
      if (accessibleApps.includes(appKey)) {
        const card = createAppCard(appKey, APP_CARDS[appKey]);
        appsGrid.appendChild(card);
      }
    });
    
    // If no cards, show message
    if (accessibleApps.length === 0) {
      appsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-xl text-gray-600">You don't have access to any applications.</p>
          <p class="text-gray-500 mt-2">Please contact your administrator.</p>
        </div>
      `;
    }
  }
  
  function createAppCard(appKey, config) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
      <div class="app-content">
        <div class="app-info">
          <div class="app-title-container">
            <h3 class="app-title">${config.title}</h3>
            <button class="launch-icon" onclick="navigateToApp('${appKey}', '${config.entryPoint}')" title="Launch App">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15,3 21,3 21,9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </button>
          </div>
          <p class="app-description">${config.description}</p>
          <span class="app-persona">${config.persona}</span>
        </div>
      </div>
    `;
    return card;
  }
  
  // Keep existing navigateToApp function
  function navigateToApp(appFolderName, firstPage) {
    const appUrl = `./apps/${appFolderName}/${firstPage}`;
    window.open(appUrl, '_blank');
  }
</script>
```

---

### Step 6: Create auth.html Implementation

#### Complete auth.html Structure
Based on Jewelmer reference, create a full authentication page with:

1. **Left Panel** (Desktop only)
   - SkillBridge branding
   - Welcome message
   - Feature highlights

2. **Right Panel** (Auth Forms)
   - Email Sign In form
   - Email Sign Up form (with verification)
   - Forgot Password form
   - Optional: Phone Auth
   - Optional: Social Login (Google, Apple)

3. **Authentication Logic**
   - Firebase Auth integration
   - Email verification flow
   - Password reset flow
   - Redirect back to navigator.html after success

**Key Functions in auth.html:**
```javascript
// Get redirect URL from query params
function getRedirectUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('redirect') || 'navigator.html';
}

// After successful sign in
async function onSignInSuccess(user) {
  const redirectUrl = getRedirectUrl();
  window.location.href = redirectUrl;
}
```

---

### Step 7: Create Utility Files

#### File: `scripts/main.js`
```javascript
/**
 * Main initialization for navigator
 */

import { env } from './env.js';

// Re-export utilities that might be needed
export { env };

// Show/hide loader utilities
export function showLoader(message = 'Loading...') {
  // Implementation
}

export function hideLoader() {
  // Implementation
}
```

#### File: `scripts/loader.js`
```javascript
/**
 * Loader utilities for showing loading states
 */

export function showLoader(message = 'Loading...') {
  let loader = document.getElementById('global-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
    loader.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-gray-700 loader-message">${message}</p>
      </div>
    `;
    document.body.appendChild(loader);
  } else {
    loader.querySelector('.loader-message').textContent = message;
    loader.style.display = 'flex';
  }
}

export function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.style.display = 'none';
  }
}
```

---

## 6. Role-Based Logic

### Decision Flow

```
┌─────────────────────────────────────────────────────────┐
│              User Authenticated Successfully            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Fetch userData from │
          │  Firestore (users)   │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Check userData.role │
          └──────────┬───────────┘
                     │
         ┌───────────┴───────────┬──────────────┐
         │                       │              │
         ▼                       ▼              ▼
  ┌─────────────┐      ┌──────────────┐   ┌─────────────┐
  │ systemAdmin │      │   employee   │   │    other    │
  └──────┬──────┘      └──────┬───────┘   └──────┬──────┘
         │                    │                   │
         ▼                    ▼                   ▼
  ┌─────────────┐      ┌──────────────┐   ┌─────────────┐
  │    Show     │      │    Check if  │   │  Show Error │
  │    Admin    │      │   Team Lead  │   │   Message   │
  │   Portal    │      │   (Query)    │   └─────────────┘
  └─────────────┘      └──────┬───────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │  Has         │    │  No          │
            │  Reportees   │    │  Reportees   │
            └──────┬───────┘    └──────┬───────┘
                   │                   │
                   ▼                   ▼
          ┌────────────────┐  ┌────────────────┐
          │ Show Team Lead │  │ Show Employee  │
          │ + Employee     │  │ Portal Only    │
          │ Portals        │  │                │
          └────────────────┘  └────────────────┘
```

### Pseudo Code

```javascript
async function determineUserAccess(userData) {
  const apps = [];
  
  // Step 1: Check for System Admin
  if (userData.role === 'systemAdmin') {
    apps.push('system_administrator');
    return apps; // Admin only needs admin portal
  }
  
  // Step 2: Check for Employee role
  if (userData.role === 'employee') {
    // All employees get employee portal
    apps.push('employee');
    
    // Step 3: Check if employee is also a team lead
    const isTeamLead = await checkIfTeamLead(userData.employeeId);
    
    if (isTeamLead) {
      apps.push('team_lead');
    }
  }
  
  return apps;
}

async function checkIfTeamLead(employeeId) {
  // Query: SELECT COUNT(*) FROM employees WHERE teamLeadId = employeeId
  const query = query(
    collection(db, 'employees'),
    where('teamLeadId', '==', employeeId)
  );
  
  const snapshot = await getDocs(query);
  return snapshot.size > 0; // If > 0, user is a team lead
}
```

---

## 7. File Structure

### Final Directory Structure
```
SkillBridge v2 Chained 1/
├── auth.html                        (NEW - Auth page)
├── navigator.html                   (MODIFIED - Add auth checks)
├── scripts/
│   ├── firebase.js                  (NEW)
│   ├── env.js                       (NEW)
│   ├── main.js                      (NEW)
│   └── loader.js                    (NEW)
├── lib/
│   ├── auth/
│   │   └── index.js                 (NEW - Auth utilities)
│   ├── toast/
│   │   ├── toast.js                 (NEW - Toast notifications)
│   │   └── toast.css                (NEW)
│   └── tailwindcss/
│       └── tailwindcss.js           (OPTIONAL)
├── apps/
│   ├── employee/                    (EXISTING)
│   ├── team_lead/                   (EXISTING)
│   └── system_administrator/        (EXISTING)
└── vercel.json                      (EXISTING)
```

---

## 8. Security Considerations

### Authentication Security
1. **Email Verification Required**
   - Force email verification before access (except test accounts)
   - Check `user.emailVerified` flag

2. **Session Management**
   - Store Firebase ID tokens in localStorage
   - Implement token refresh mechanism
   - Handle expired sessions gracefully

3. **Role Validation**
   - Always validate roles on the server-side (Firestore Security Rules)
   - Never trust client-side role data alone

### Firestore Security Rules

```javascript
// Example Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Users can only read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      // Only authenticated users can write (for signup)
      allow write: if request.auth != null;
    }
    
    // Employees collection
    match /employees/{employeeId} {
      // Employees can read their own data
      allow read: if request.auth != null;
      // Only admins can write
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'systemAdmin';
    }
  }
}
```

### Additional Security Measures
1. **HTTPS Only** - Ensure all requests use HTTPS
2. **Content Security Policy** - Add CSP headers
3. **XSS Protection** - Sanitize all user inputs
4. **CSRF Protection** - Implement CSRF tokens for sensitive actions

---

## 9. Testing Strategy

### Test Scenarios

#### Scenario 1: System Administrator
**Setup:**
- User with `role: "systemAdmin"` in Firestore

**Expected Behavior:**
- After sign in, see only Admin Portal card
- Can navigate to `apps/system_administrator/dashboard.html`

**Test Steps:**
1. Sign in as admin user
2. Verify only 1 card is displayed
3. Verify card title is "SkillBridge Admin Portal"
4. Click launch button
5. Verify correct redirect

---

#### Scenario 2: Team Lead
**Setup:**
- User with `role: "employee"` and `employeeId: "TL001"`
- Other employees in Firestore with `teamLeadId: "TL001"`

**Expected Behavior:**
- After sign in, see Team Management Portal + Employee Portal cards
- Can navigate to both apps

**Test Steps:**
1. Sign in as team lead user
2. Verify 2 cards are displayed
3. Verify cards are "Team Management Portal" and "Employee Portal"
4. Test navigation to both apps

---

#### Scenario 3: Regular Employee
**Setup:**
- User with `role: "employee"` and `employeeId: "EMP001"`
- No other employees have `teamLeadId: "EMP001"`

**Expected Behavior:**
- After sign in, see only Employee Portal card
- Can navigate to employee app only

**Test Steps:**
1. Sign in as regular employee
2. Verify only 1 card is displayed
3. Verify card title is "SkillBridge Employee Portal"
4. Click launch button
5. Verify correct redirect

---

#### Scenario 4: Unauthenticated Access
**Setup:**
- No user signed in

**Expected Behavior:**
- Immediate redirect to auth.html
- After sign in, redirect back to navigator.html

**Test Steps:**
1. Clear all cookies/localStorage
2. Navigate to navigator.html
3. Verify redirect to auth.html
4. Sign in
5. Verify redirect back to navigator.html

---

#### Scenario 5: New User Signup
**Setup:**
- New user registration

**Expected Behavior:**
- Email verification required
- Cannot access until email verified
- Default role assignment

**Test Steps:**
1. Go to auth.html
2. Click Sign Up
3. Fill form and submit
4. Check email for verification link
5. Verify blocked access before verification
6. Click verification link
7. Sign in
8. Verify appropriate cards displayed

---

### Test Data

Create test users in Firebase:

```javascript
// System Admin
{
  uid: "admin-test-001",
  email: "admin@skillbridge.test",
  firstName: "Admin",
  lastName: "User",
  role: "systemAdmin",
  employeeId: "ADMIN001"
}

// Team Lead
{
  uid: "lead-test-001",
  email: "teamlead@skillbridge.test",
  firstName: "Team",
  lastName: "Lead",
  role: "employee",
  employeeId: "TL001"
}

// Regular Employee
{
  uid: "emp-test-001",
  email: "employee@skillbridge.test",
  firstName: "Regular",
  lastName: "Employee",
  role: "employee",
  employeeId: "EMP001"
}
```

---

## 10. Rollback Plan

### If Issues Arise

#### Immediate Rollback Steps
1. **Rename files:**
   ```bash
   mv navigator.html navigator-new.html
   mv navigator-backup.html navigator.html
   ```

2. **Remove new files:**
   - Delete `auth.html`
   - Delete `scripts/` folder (new one)
   - Delete `lib/auth/` folder

3. **Clear user caches:**
   - Instruct users to clear localStorage
   - Clear browser cache

#### Partial Rollback (Keep Auth, Remove Role Logic)
- Modify navigator.html to show all cards
- Keep authentication but bypass role checks
- Add admin override parameter

```javascript
// Emergency override
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('admin') === 'override') {
  // Show all cards
  renderAppCards(['system_administrator', 'team_lead', 'employee']);
}
```

---

## Implementation Checklist

### Pre-Implementation
- [ ] Backup current navigator.html
- [ ] Document current Firebase configuration
- [ ] Create test Firebase users
- [ ] Review Jewelmer auth.html for reference
- [ ] Set up development environment

### Phase 1: Infrastructure
- [ ] Create `scripts/firebase.js`
- [ ] Create `scripts/env.js`
- [ ] Create `scripts/main.js`
- [ ] Create `scripts/loader.js`
- [ ] Create `lib/auth/index.js`
- [ ] Create `lib/toast/toast.js`
- [ ] Test Firebase connection

### Phase 2: Authentication
- [ ] Create `auth.html`
- [ ] Implement email sign in
- [ ] Implement email sign up
- [ ] Implement forgot password
- [ ] Implement email verification check
- [ ] Test auth flows

### Phase 3: Role Logic
- [ ] Implement `getUserData` function
- [ ] Implement `isUserTeamLead` function
- [ ] Implement `getUserAccessibleApps` function
- [ ] Add Firestore queries
- [ ] Test role detection

### Phase 4: Navigator Update
- [ ] Add auth check to navigator.html
- [ ] Implement dynamic card rendering
- [ ] Add loading states
- [ ] Test with different user roles
- [ ] Add error handling

### Phase 5: Testing
- [ ] Test admin user
- [ ] Test team lead user
- [ ] Test regular employee
- [ ] Test unauthenticated access
- [ ] Test email verification flow
- [ ] Test password reset flow
- [ ] Test edge cases

### Phase 6: Security
- [ ] Review Firestore Security Rules
- [ ] Implement token refresh
- [ ] Add session timeout
- [ ] Test security scenarios
- [ ] Security audit

### Phase 7: Documentation
- [ ] Update README
- [ ] Document new file structure
- [ ] Create user guide
- [ ] Document test procedures
- [ ] Update deployment docs

---

## Success Metrics

### Functional Metrics
- ✅ All users must authenticate before accessing navigator
- ✅ System admins see only Admin Portal
- ✅ Team leads see Team Management + Employee Portal
- ✅ Regular employees see only Employee Portal
- ✅ Email verification enforced
- ✅ Redirect after auth works correctly

### Performance Metrics
- ⚡ Auth check completes in < 2 seconds
- ⚡ Role determination completes in < 1 second
- ⚡ Page load after auth in < 3 seconds

### Security Metrics
- 🔒 No unauthorized access to restricted apps
- 🔒 Tokens expire and refresh properly
- 🔒 Firestore rules prevent data leakage

---

## Additional Considerations

### Future Enhancements
1. **Multi-Role Support**
   - Allow users to have multiple roles
   - Add role switcher UI

2. **Permission Granularity**
   - Feature-level permissions
   - Page-level access control

3. **Audit Logging**
   - Track user access attempts
   - Log role changes

4. **Admin Panel**
   - User management interface
   - Role assignment UI

### Maintenance
- **Regular Security Audits**
- **Firebase SDK Updates**
- **Performance Monitoring**
- **User Feedback Collection**

---

## Conclusion

This implementation plan provides a comprehensive roadmap for adding authentication and role-based navigation to SkillBridge. By following the Jewelmer pattern and implementing proper security measures, we can ensure a secure and user-friendly experience.

The phased approach allows for incremental testing and validation, reducing the risk of deployment issues. The detailed role-based logic ensures that users see only the applications they're authorized to access.

**Estimated Timeline:** 7-10 days
**Difficulty Level:** Medium
**Risk Level:** Low (with proper testing)

---

## Support & Resources

### Documentation Links
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

### Internal Resources
- Jewelmer auth.html (reference implementation)
- Existing app auth flows in `apps/*/` folders
- Firebase console for testing

### Contact
For questions or issues during implementation, refer to the project documentation or contact the development team.

---

**Document Version:** 1.0  
**Last Updated:** December 30, 2024  
**Author:** GitHub Copilot  
**Status:** Ready for Implementation
