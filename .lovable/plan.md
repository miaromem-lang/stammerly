

# Plan: Fix Role Access & Add Logout Functionality

## Summary
This plan addresses two issues: (1) updating your database role to `admin` so the Dev Role Switcher works, and (2) adding a visible logout button so you can sign out from any hub.

---

## What Will Be Done

### 1. Update Your User Role to Admin
Run a database update to change your role from `teacher` to `admin`.

**Result:** You'll see the floating purple Dev Role Switcher button in the bottom-right corner, allowing you to switch between any hub.

### 2. Add Logout Button to All Hubs
Add a visible "Sign Out" button in the header area of each hub page so you can easily log out.

**Where it will appear:**
- Kid Hub
- Parent Hub  
- Teacher Hub
- Therapist Hub
- Clinical Analytics Hub

---

## Technical Details

### Database Change
```sql
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = '63d5c95a-fdb7-477c-a74f-f6dab3c6f086';
```

### Files to Modify

| File | Change |
|------|--------|
| `src/components/HubNavigation.tsx` | Add a logout button using `signOut` from `useAuth` hook |
| `src/pages/TherapistHub.tsx` | Ensure logout is accessible from header |
| `src/pages/TherapistAnalyticsHub.tsx` | Add logout button to header |

### Logout Implementation
```text
+----------------------------------+
|  [Logo] Clinical Portal    [👤 Sign Out] |
+----------------------------------+
```

The button will:
1. Call `signOut()` from the `useAuth` hook
2. Clear the session
3. Redirect to the sign-in page

---

## After Implementation

1. **Dev Role Switcher**: A floating purple button (⚙️) will appear in the bottom-right corner when you're logged in as admin
2. **Sign Out**: Click "Sign Out" in the header to log out from any page
3. **Hub Access**: Use the Dev Role Switcher to navigate between Kid, Parent, Teacher, and Therapist hubs without changing accounts

