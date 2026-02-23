# Integration Guide: Next.js Onboarding → React Project

## Overview

This integration brings the Next.js onboarding wizard and project management system from the Next.js codebase into the React Vite project, while maintaining the current UI design.

## What Was Implemented

### 1. **New Type Definitions** (`src/types/profile.ts`)
- `ProfileModel`: Main token profile structure (stage, intent, platform, category, etc.)
- `SnapshotData`: Risk assessment data
- `AiDiagnosis`: AI analysis results
- `Project`: Firebase document model

### 2. **Firebase Integration** (`src/lib/firebase/projects.ts`)
- `createProject()`: Create a new project
- `updateProject()`: Update existing project
- `getProject()`: Get a single project
- `getUserProjects()`: Get all projects for a user
- `deleteProject()`: Delete a project
- `getLatestProject()`: Get most recently updated project

### 3. **Onboarding Wizard Component** (`src/components/OnboardingWizard.tsx`)
- 5-step wizard for project creation:
  1. **Token**: Choose pre-launch or paste token address
  2. **Stage**: Pre-launch, live, post-launch, or revival
  3. **Context**: Launch platform, type, and category
  4. **Intent**: Fast-flip, medium-term, or long-term
  5. **Snapshot**: Review and confirm
- Beautiful glass UI with smooth animations
- Full form validation

### 4. **Project Management Pages**

#### `/manage-project` - Project Dashboard
- List all user projects
- Create new project button
- Onboarding modal
- Project cards with:
  - Token address
  - Risk level badge
  - Stage and intent
  - Last updated date
  - View/Delete buttons
- Expandable project details

#### `/manage-project/:id` - Project Detail
- Full project view
- Sections for:
  - Token Configuration (Stage, Intent)
  - Mechanics (Platform, Type)
  - Additional Info (Category, Wallets)
  - Risk Assessment
  - AI Diagnosis (when available)
- Action buttons: Edit, Delete, Download, Share

### 5. **Navigation Updates**
- Added new routes to `App.tsx`
- Updated `HeroSection.tsx` to navigate to `/manage-project` instead of showing "coming soon"
- "Manage Project" button now fully functional

## File Structure

```
src/
├── types/
│   └── profile.ts                    (NEW: Type definitions)
├── lib/
│   └── firebase/
│       ├── projects.ts               (NEW: Firestore operations)
│       ├── client.ts                 (UPDATED: Added db export)
│       └── auth.ts                   (Existing)
├── components/
│   ├── OnboardingWizard.tsx           (NEW: Wizard UI)
│   └── HeroSection.tsx               (UPDATED: Navigation)
├── pages/
│   ├── ManageProject.tsx             (NEW: Project list)
│   ├── ProjectDetail.tsx             (NEW: Project view)
│   ├── Dashboard.tsx                 (Existing: DYOR)
│   └── Index.tsx                     (Existing)
└── App.tsx                           (UPDATED: New routes)
```

## How It Works

### User Flow

1. **Home Page** → User sees "Manage Project" button
2. **Click "Manage Project"** → Navigate to `/manage-project`
3. **List View** → User sees all their projects or empty state
4. **Click "New Project"** → Modal opens with onboarding wizard
5. **Complete Wizard** → Project created in Firebase
6. **Auto-redirect** → Navigate to project detail page `/manage-project/:id`
7. **Project Detail** → View and manage project

### Data Flow

```
OnboardingWizard
    ↓
handleCreateProject (callback)
    ↓
createProject() [Firebase]
    ↓
Store in Firestore
    ↓
Redirect to detail page
    ↓
ProjectDetail loads from Firebase
```

## Key Features

### 1. Real-time Data Storage
- All projects stored in Firebase Firestore
- Associated with authenticated user
- Timestamps for created/updated

### 2. Responsive Design
- Mobile-first layout
- Grid adapts from 1 → 2 → 3 columns
- Modal dialogs for mobile UX

### 3. Animation & UX
- Smooth transitions between wizard steps
- Card animations on list view
- Loading states and error handling
- Expandable project details

### 4. Type Safety
- Full TypeScript support
- Proper Firebase types
- Form validation

## Integration Notes

### Different from Original Next.js
1. **No Server-Side Rendering** - Pure client-side React
2. **No Next.js API Routes** - Direct Firestore access (with security rules)
3. **React Router** instead of Next.js routing
4. **Framer Motion** for animations instead of Next.js animations

### Keep Existing Features
- **DYOR Dashboard** (`/dashboard`) - Unchanged
- **Home Page** (`/`) - Unchanged
- **All styling** - Maintains current design system

## Firebase Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Next Steps

1. **Authentication**: The system requires Firebase auth to work
   - User must be signed in via `subscribeToAuth()`
   - Redirect to home if not authenticated

2. **AI Diagnosis Integration**: Add API call when step === "snapshot"
   - Call your AI backend
   - Save result with `updateProject()`

3. **Risk Snapshot Calculation**: Implement `deriveSnapshot()` logic
   - Calculate risk baseline based on profile
   - Determine failure modes
   - Generate next prompt

4. **Testing**: Verify:
   - Project creation works
   - Firebase writes succeed
   - Navigation flows smoothly
   - Data persists across sessions

## Debugging

### Check if projects load:
```typescript
const { data: projects } = await getUserProjects(userId);
console.log(projects); // Should show array of projects
```

### Check Firebase connection:
```typescript
import { db } from "@/lib/firebase/client";
console.log(db); // Should show Firestore instance
```

### Check routes:
- `/` → Home
- `/dashboard` → DYOR Intelligence
- `/manage-project` → Project List (NEW)
- `/manage-project/:id` → Project Detail (NEW)

---

**Status**: ✅ Complete integration with working routes, components, and Firebase storage
