

## Security Remediation Plan

### Overview

The security scan identified 1 error-level issue and 2 warning-level issues. After investigation, **the error-level issue is a false positive** - `daily_analytics` is a secure view, not an unprotected table. However, I recommend fixing the warning-level issues for GDPR compliance (right to deletion).

---

### What Needs to Be Fixed

#### 1. Missing DELETE Policy on `practice_sessions` (Warning)

**Current State:** Users can INSERT, UPDATE, and SELECT their own practice sessions, but cannot DELETE them.

**Problem:** Users cannot exercise their GDPR "right to erasure" for their own health records.

**Solution:** Add a DELETE policy allowing users to remove their own sessions.

```sql
CREATE POLICY "Users can delete own sessions"
ON public.practice_sessions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
```

---

#### 2. Missing UPDATE/DELETE Policies on `user_achievements` (Warning)

**Current State:** Users can INSERT and SELECT their achievements, but cannot UPDATE or DELETE them.

**Problem:** If an achievement is incorrectly awarded (e.g., system glitch), there's no way to correct it.

**Solution:** Add UPDATE and DELETE policies.

```sql
CREATE POLICY "Users can update own achievements"
ON public.user_achievements
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own achievements"
ON public.user_achievements
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
```

---

#### 3. Resolve False Positive: `daily_analytics` (Error)

**Current State:** The scan flagged this as "no RLS policies" but investigation shows:
- It's a VIEW, not a table
- It has `security_invoker = true`
- It queries `practice_sessions` which has RLS
- The view itself filters by `WHERE user_id = auth.uid()`

**Action:** Mark this finding as resolved with explanation.

---

### Implementation Steps

1. **Database Migration** - Create a single migration to add the missing policies:
   - DELETE policy for `practice_sessions`
   - UPDATE policy for `user_achievements`
   - DELETE policy for `user_achievements`

2. **Update Security Findings** - Mark the `daily_analytics` false positive as ignored with proper documentation.

---

### Technical Details

```text
+---------------------------+
|   Security Changes        |
+---------------------------+
          |
          v
+---------------------------+
| practice_sessions         |
| + DELETE policy           |
| (user_id = auth.uid())    |
+---------------------------+
          |
          v
+---------------------------+
| user_achievements         |
| + UPDATE policy           |
| + DELETE policy           |
| (user_id = auth.uid())    |
+---------------------------+
          |
          v
+---------------------------+
| daily_analytics           |
| Mark as FALSE POSITIVE    |
| (secure view with RLS)    |
+---------------------------+
```

---

### Summary

| Action | Type | Priority |
|--------|------|----------|
| Add DELETE policy to `practice_sessions` | Database Migration | Medium |
| Add UPDATE/DELETE policies to `user_achievements` | Database Migration | Medium |
| Mark `daily_analytics` finding as resolved | Security Manager | Low |

**Estimated Changes:**
- 1 database migration file
- 1 security finding update

**No code changes required** - this is purely database policy work.

