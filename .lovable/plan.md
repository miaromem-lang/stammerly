

## Plan: Post-Waitlist Product Showcase Page

### What happens today
- `/` is the waitlist landing page. After signup, the user sees a toast and stays on the same page.

### What we'll build

**1. New page: `/product` (Product Showcase)**

A public page with two clear audience sections and the footer:

- **Hero section** -- "Thanks for joining! Here's what's coming" with Stammerly branding
- **For Parents (D2C)** -- Hardware device (£89 one-time) + app subscription (£4.99/mo). Benefits: daily practice sessions, progress tracking, video tips, parent dashboard
- **For Professionals (B2B)** -- Software subscription (£9.99/mo per clinician). Benefits: AI-powered insights, SOAP note automation, clinical analytics, NHS/DTAC compliance
- **How It Works** -- Brief visual flow of the Circle of Support concept
- **Hybrid Intelligence callout** -- Link to `/research` for the academic framework
- **Footer** -- Existing footer component

**2. Modify `Index.tsx` (waitlist page)**

After successful waitlist signup, redirect to `/product` using `useNavigate` instead of just showing a toast. The toast will still show, but the user lands on the product page.

For duplicate signups ("already on the list"), also redirect to `/product`.

**3. Add route in `App.tsx`**

Add `/product` as a public route.

**4. Database change: Add `user_type` to `waitlist_signups`**

Add an optional `user_type` column (`text`, nullable) so the product page can optionally capture which audience the visitor identifies with (via CTA buttons like "I'm a Parent" / "I'm a Therapist" that link to waitlist or surveys).

### Files to create/edit
- **Create** `src/pages/Product.tsx` -- Full product showcase page
- **Edit** `src/pages/Index.tsx` -- Add `useNavigate`, redirect after signup
- **Edit** `src/App.tsx` -- Add `/product` route
- **Migration** -- `ALTER TABLE waitlist_signups ADD COLUMN user_type text;`

