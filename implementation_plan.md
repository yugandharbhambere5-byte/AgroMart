# Implementation Plan - AgroMart User Registration, Login & Forgot Password Flow

This document details the plan to fix and complete the user registration, login, forgot password, and data consistency functionality in AgroMart.

## Proposed Changes

### 1. Database Mock Client (`src/utils/supabase/client.ts`)
- Update `client.ts` to support fully functional database persistence in `localStorage` under `agromart_mock_users`, `agromart_mock_profiles`, `agromart_mock_farmer_profiles`, and `agromart_mock_buyer_profiles` when using placeholder credentials.
- Add mock `signUp`, `signInWithPassword`, `resetPasswordForEmail`, and `from` database query builder (supporting `select`, `insert`, `update`, `delete`, `eq`, `single`).

### 2. Registration Flow (`src/app/register/page.tsx`)
- Update form to:
  - Add fields for Password and Confirm Password.
  - Require password fields before submission.
  - Perform validation (matching passwords, minimum length, duplicate check).
  - Submit using `signUp` with email/phone + password + options metadata.
  - Insert records into `profiles`, `farmer_profiles`, and `buyer_profiles` using standard client table actions (`supabase.from(table).insert(...)`).

### 3. Login Flow (`src/app/login/page.tsx`)
- Update the login form to:
  - Require Password for Farmer, Buyer, and Admin roles.
  - Log in using `signInWithPassword` (allowing email or phone + password).
  - Redirect correctly to `/dashboard/farmer`, `/dashboard/buyer`, or `/dashboard/admin` based on the fetched profile's `role`.

### 4. Forgot Password Flow
- Update password reset request and verification in `src/app/login/page.tsx` to:
  - Allow standard password reset for farmers/buyers (not just admins).
  - Send reset links or mock code.
  - Update user password securely via `supabase.auth.updateUser({ password: newPassword })` and persist it.

### 5. Verification Page (`src/app/verify/page.tsx`)
- Ensure redirection fetches the user role and points the user to their proper dashboard path.

### 6. Dashboard Profile Synchronisation
- Update `src/app/dashboard/farmer/page.tsx` and `src/app/dashboard/buyer/page.tsx` to read the authenticated user's ID, fetch details from the `profiles`, `farmer_profiles`, and `buyer_profiles` tables, and show this information consistently.
- Prevent local storage fallback from overriding real database data.

## Verification Plan

### Automated Tests
- Build and compile check: `npm run build`
- Run linting: `npm run lint`

### Manual Verification
1. Open register page, register a new Farmer (with email/phone and password).
2. Verify profiles entries are inserted.
3. Log out.
4. Log back in with the registered credentials and verify role-based dashboard redirection.
5. Verify profile page displays same farm size, address, etc.
6. Test Forgot Password flow to reset password, log back in.
