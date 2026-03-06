

## Plan: Add Hidden Admin Login Page

### Problem
The `/signin` page is a "Coming Soon" placeholder with no login form. Admin users cannot authenticate to access the protected hub routes.

### Changes

1. **Create `src/pages/AdminLogin.tsx`**
   - Minimal email/password login form using `useAuth().signIn()`
   - On success, redirect based on role: admins go to `/hub/therapist` (default hub), others to their role-based hub
   - Styled consistently with the existing Auth page (PageBackground, Card, Stammerly branding)
   - No signup form — login only

2. **Update `src/App.tsx`**
   - Add route: `/admin-login` as a standalone public route (not linked from any navigation)

3. **No other changes needed**
   - `ProtectedRoute` already grants admins access to all hubs via the existing `if (role === 'admin')` bypass
   - `DevRoleSwitcher` already lets admins navigate between hubs
   - The public `/signin` "Coming Soon" page remains unchanged

### How to use
- Navigate manually to `/admin-login` in the browser address bar
- Sign in with your admin credentials
- You'll land on the therapist hub by default, then use the floating Dev Role Switcher to visit any hub

