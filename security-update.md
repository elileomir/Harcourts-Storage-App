# 🔒 Security Update: Supabase Database Changes
**Project:** `umjpswrbowxkmatqgqgr`  
**URL:** `https://umjpswrbowxkmatqgqgr.supabase.co`  
**Applied:** 2026-04-21  
**Severity:** Breaking changes for any app sharing this database  

---

## Table of Contents
1. [What Changed & Why](#1-what-changed--why)
2. [Breaking Change 1 — Admin Role Moved to `app_metadata`](#2-breaking-change-1--admin-role-moved-to-app_metadata)
3. [Breaking Change 2 — Anon RLS Policies Scoped Down](#3-breaking-change-2--anon-rls-policies-scoped-down)
4. [Am I Affected? Quick Checklist](#4-am-i-affected-quick-checklist)
5. [Migration Guide: Assigning Admin Roles](#5-migration-guide-assigning-admin-roles)
6. [Migration Guide: App-by-App RLS Impact](#6-migration-guide-app-by-app-rls-impact)
7. [Testing Your App After Migration](#7-testing-your-app-after-migration)
8. [New RPC Functions Available](#8-new-rpc-functions-available)
9. [Rollback Instructions](#9-rollback-instructions)

---

## 1. What Changed & Why

Three categories of changes were applied to the shared database:

| # | Change | Risk Before | Status |
|---|--------|-------------|--------|
| 1 | `is_admin()` reads `app_metadata.role` instead of `user_metadata.role` | Users could promote themselves to admin by editing their own profile | ✅ Fixed |
| 2 | Blanket `USING (true)` anon policies removed | Anyone with the anon key could read ALL data (PII, revenue, leads) | ✅ Fixed |
| 3 | New server-side RPC aggregation functions added | N/A (additive only) | ✅ New feature |

> **Why this matters for your app:** If your app assigns admin roles, reads data as `anon`, or checks `user_metadata.role` to determine permissions, it is affected.

---

## 2. Breaking Change 1 — Admin Role Moved to `app_metadata`

### What changed in the database

```sql
-- OLD (insecure): users could modify their own user_metadata via browser SDK
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin';
END;
$$;

-- NEW (secure): app_metadata is server-controlled only, cannot be modified by users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$;
```

### Why `user_metadata` was a security hole

The Supabase browser client allows **any authenticated user** to call:
```js
await supabase.auth.updateUser({ data: { role: 'admin' } })
```
This sets `user_metadata.role = 'admin'` on their own account without any server check. Since the old `is_admin()` read from `user_metadata`, any user could self-promote to admin.

`app_metadata` can **only be set via the Supabase service role key** (server-side), which the browser never has access to.

### Existing admins: Already backfilled ✅

All 6 existing admin users have already had their `app_metadata.role` set to `'admin'`. You can verify:

```sql
SELECT email, 
       raw_user_meta_data->>'role'  AS user_meta_role,
       raw_app_meta_data->>'role'   AS app_meta_role
FROM auth.users
ORDER BY email;
```

Expected output for admins — both columns should show `'admin'`:
```
email                              | user_meta_role | app_meta_role
-----------------------------------+----------------+--------------
admin@harcourts.com               | admin          | admin
brad.reeves@harcourts.com.au      | admin          | admin
elijah.mirandilla@harcourts.com.au| admin          | admin
...
```

### 🔴 Action Required in Your App

If your app has **any code that sets the admin role**, you must update it.

#### ❌ Old way (no longer works)
```typescript
// This sets user_metadata — is_admin() no longer reads this
const { error } = await supabase.auth.updateUser({
  data: { role: 'admin' }
})
```

#### ✅ New way (server-side only — requires service role key)

**Option A: Next.js API Route** (recommended)
```typescript
// app/api/admin/assign-role/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only env var
)

export async function POST(req: NextRequest) {
  // 1. Verify the caller is themselves an admin
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data: { user } } = await supabaseAdmin.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  
  // Check caller is admin
  const callerMeta = user?.app_metadata as { role?: string } | undefined
  if (callerMeta?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // 2. Set app_metadata on the target user
  const { userId, role } = await req.json()
  
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role } // 'admin' | 'user'
  })
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  // 3. Also update the profiles table to keep it in sync
  await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  
  return NextResponse.json({ success: true, user: data.user })
}
```

**Option B: Supabase Edge Function**
```typescript
// supabase/functions/assign-admin-role/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { userId, role } = await req.json()
  
  // Update app_metadata (server-controlled, secure)
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role }
  })
  
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Option C: Supabase Dashboard (one-off manual assignment)**
1. Go to `https://supabase.com/dashboard/project/umjpswrbowxkmatqgqgr`
2. Navigate to **Authentication → Users**
3. Click on the user → **Edit User**
4. Set **App Metadata**: `{"role": "admin"}`
5. Save

**Option D: SQL (run in Supabase SQL Editor)**
```sql
-- Replace 'user@example.com' with the actual email
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) 
                        || '{"role": "admin"}'::jsonb
WHERE email = 'user@example.com';
```

### Reading the admin role in client code

If your app reads the role from the JWT to conditionally show UI:

```typescript
// ❌ Old way — no longer reliable
const { data: { user } } = await supabase.auth.getUser()
const isAdmin = user?.user_metadata?.role === 'admin'

// ✅ New way — read from app_metadata
const { data: { user } } = await supabase.auth.getUser()
const isAdmin = (user?.app_metadata as { role?: string })?.role === 'admin'

// ✅ Alternative — read from profiles table (synced)
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()
const isAdmin = profile?.role === 'admin'
```

> ⚠️ **Important:** `app_metadata` is embedded in the JWT, so after setting it server-side, the **user must sign out and sign back in** (or call `supabase.auth.refreshSession()`) for the new role to be reflected in the client JWT.

```typescript
// Force token refresh after admin grants a role
await supabase.auth.refreshSession()
const { data: { user } } = await supabase.auth.getUser()
console.log(user?.app_metadata) // should now show { role: 'admin' }
```

---

## 3. Breaking Change 2 — Anon RLS Policies Scoped Down

### Full Policy Diff

The following policies were **dropped** and replaced:

| Table | Dropped Policy | Impact |
|-------|---------------|--------|
| `storage_units` | `Allow anon all` (ALL ops) | Anon can no longer INSERT/DELETE units; can only SELECT available ones and UPDATE status |
| `bookings` | `Allow anon all` (ALL ops) | Anon can no longer UPDATE/DELETE bookings |
| `call_analytics` | `Allow anon all` (ALL ops) | **Anon can no longer READ call analytics** (sensitive revenue data) |
| `knowledge_base` | `Allow anon all` (ALL ops) | Anon can no longer INSERT/UPDATE/DELETE knowledge articles |
| `waitlist_requests` | `Allow anon all` (ALL ops) | Anon can no longer DELETE or UPDATE waitlist records |
| `profiles` | `Allow anon all` (ALL ops) | **Anon can no longer read or write ANY profiles** |
| `platform_settings` | `Allow anon all` (ALL ops) | **Anon can no longer read platform settings** |
| `australian_public_holidays` | `Allow anon all` (ALL ops) | Anon can no longer INSERT/UPDATE/DELETE holiday records |

### Current anon permissions (what remains)

| Table | anon: SELECT | anon: INSERT | anon: UPDATE | anon: DELETE |
|-------|-------------|-------------|-------------|-------------|
| `storage_units` | ✅ (Available only) | ❌ | ✅ (status field) | ❌ |
| `bookings` | ✅ (all rows) | ✅ | ❌ | ❌ |
| `call_analytics` | ❌ | ✅ | ❌ | ❌ |
| `knowledge_base` | ✅ (all rows) | ❌ | ❌ | ❌ |
| `waitlist_requests` | ✅ (all rows) | ✅ | ❌ | ❌ |
| `profiles` | ❌ | ❌ | ❌ | ❌ |
| `platform_settings` | ❌ | ❌ | ❌ | ❌ |
| `australian_public_holidays` | ✅ (all rows) | ❌ | ❌ | ❌ |
| `callback_requests` | ✅ (via public policy) | ✅ (via public policy) | ❌ | ❌ |

---

## 4. Am I Affected? Quick Checklist

Run through this list for each app that connects to `umjpswrbowxkmatqgqgr`:

### Admin Role Checklist
- [ ] Does your app have a UI or API route that promotes users to admin?
- [ ] Does your app read `user_metadata.role` anywhere to check admin status?
- [ ] Does your app set `user_metadata.role` to assign roles?

→ If **any box is checked**, follow [Section 5](#5-migration-guide-assigning-admin-roles).

### Anon Access Checklist
- [ ] Does your app make API calls **without a user being logged in** (no `Authorization` header)?
- [ ] Does your app use the **anon key** directly in server-side code (not service role)?
- [ ] Does your app fetch `profiles`, `platform_settings`, or `call_analytics` without authentication?
- [ ] Does your app INSERT, UPDATE, or DELETE to `storage_units`, `bookings`, or `knowledge_base` as an unauthenticated user?

→ If **any box is checked**, follow [Section 6](#6-migration-guide-app-by-app-rls-impact).

---

## 5. Migration Guide: Assigning Admin Roles

### For any new admin user going forward

You **must** use one of these methods (not the browser SDK):

**Method 1: SQL (fastest for one-off)**
```sql
-- Run in Supabase SQL Editor → https://supabase.com/dashboard/project/umjpswrbowxkmatqgqgr/editor
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) 
                        || jsonb_build_object('role', 'admin')
WHERE email = 'newadmin@harcourts.com.au';

-- Also update the profiles table for consistency
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'newadmin@harcourts.com.au');
```

**Method 2: Server API call (for automation)**
```bash
# Using the Supabase Management API
# Replace USER_ID and YOUR_SERVICE_ROLE_KEY

curl -X PATCH \
  'https://umjpswrbowxkmatqgqgr.supabase.co/auth/v1/admin/users/USER_ID' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"app_metadata": {"role": "admin"}}'
```

**Method 3: Supabase Dashboard**
1. Open: `https://supabase.com/dashboard/project/umjpswrbowxkmatqgqgr/auth/users`
2. Find the user → click the three dots → **Edit User**
3. Under **App Metadata**, set: `{"role": "admin"}`
4. Click **Save**

### To demote an admin back to user
```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) 
                        || jsonb_build_object('role', 'user')
WHERE email = 'former-admin@harcourts.com.au';

UPDATE public.profiles
SET role = 'user'
WHERE id = (SELECT id FROM auth.users WHERE email = 'former-admin@harcourts.com.au');
```

### Verify the change worked
```sql
SELECT 
  email,
  raw_app_meta_data->>'role' AS app_meta_role,
  (SELECT role FROM public.profiles WHERE id = u.id) AS profiles_role
FROM auth.users u
WHERE email = 'newadmin@harcourts.com.au';
```

---

## 6. Migration Guide: App-by-App RLS Impact

### App Type: Next.js / React Web App (authenticated users)

**No changes needed** for authenticated operations — all existing `authenticated` role policies remain unchanged. Users who are logged in will continue to have full access to the tables they had access to before.

The only change is admin checks now require `app_metadata`. Update your admin check:

```typescript
// lib/auth.ts — update your admin check utility
export function isUserAdmin(user: User | null): boolean {
  // ✅ Read from app_metadata (server-controlled)
  return (user?.app_metadata as { role?: string })?.role === 'admin'
  
  // ❌ Don't use this anymore:
  // return user?.user_metadata?.role === 'admin'
}
```

---

### App Type: ElevenLabs / External AI Agent (anon key)

The agent uses the anon key. Verify its operations still work:

**✅ These still work (no change needed):**
- `GET /rest/v1/storage_units?status=eq.Available` — reads available units
- `GET /rest/v1/bookings` — reads all bookings
- `GET /rest/v1/waitlist_requests` — reads waitlist
- `GET /rest/v1/knowledge_base` — reads knowledge articles
- `POST /rest/v1/bookings` — creates bookings
- `POST /rest/v1/call_analytics` — logs calls
- `POST /rest/v1/waitlist_requests` — adds to waitlist
- `PATCH /rest/v1/storage_units?id=eq.X` — updates unit status

**❌ These now fail (if agent was using them):**
- `GET /rest/v1/call_analytics` — anon can no longer read analytics
- `GET /rest/v1/profiles` — anon can no longer read profiles
- `GET /rest/v1/platform_settings` — anon can no longer read settings
- `GET /rest/v1/storage_units?status=eq.Unavailable` — anon cannot see occupied units
- `DELETE /rest/v1/bookings?id=eq.X` — anon cannot delete bookings

If the agent needs any of the blocked operations, it should be upgraded to use a **service role key** accessed through a dedicated API endpoint (never embedded in the agent prompt/config directly).

---

### App Type: Express / Node.js Backend (using anon key)

If your Node.js backend uses the anon key for server-to-server calls, you have two options:

**Option A: Switch to service role key** (recommended for trusted server code)
```typescript
import { createClient } from '@supabase/supabase-js'

// Server-side only — never expose to browsers
const supabaseService = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // bypasses RLS entirely
)

// Now all operations work regardless of RLS policies
const { data } = await supabaseService.from('call_analytics').select('*')
```

**Option B: Pass the user's JWT** (if acting on behalf of an authenticated user)
```typescript
// Forward the user's auth token from the request header
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    global: {
      headers: {
        Authorization: `Bearer ${userJwtFromRequest}`
      }
    }
  }
)
// Now operates as the authenticated user, inheriting their RLS permissions
```

---

### App Type: Public-Facing Web Page (no login, uses anon key)

If you have a public page that reads data without users logging in:

**`profiles` table — previously readable, now blocked:**
```typescript
// ❌ This now returns an empty array (RLS blocks anon)
const { data } = await supabase.from('profiles').select('*')

// ✅ Option 1: Require users to log in first
// ✅ Option 2: Create a specific view with only public-safe columns
// Run in SQL Editor:
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, email FROM profiles; -- only expose non-sensitive columns

CREATE POLICY "Anyone can view public profiles"
  ON public.public_profiles FOR SELECT
  TO anon USING (true);

// ✅ Option 3: Use service role on server-side and return only what's needed
```

**`platform_settings` table — previously readable by anon, now blocked:**
```typescript
// ❌ This now returns empty (anon blocked)
const { data } = await supabase.from('platform_settings').select('*')

// ✅ If your public app needs specific settings, create an Edge Function:
// supabase/functions/public-settings/index.ts
Deno.serve(async () => {
  const supabaseAdmin = createClient(url, serviceKey)
  const { data } = await supabaseAdmin
    .from('platform_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['public_rate', 'contact_phone']) // only public settings
  
  return new Response(JSON.stringify(data))
})
```

---

### App Type: Any App with Custom Admin UI

If you have a page where admins can promote/demote other users:

```typescript
// components/UserManagement.tsx (or equivalent)

// ❌ Old approach — stops working
const handlePromoteToAdmin = async (userId: string) => {
  // This ONLY sets user_metadata — is_admin() no longer reads this
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'admin' }  // ❌ Wrong field
  })
}

// ✅ New approach — call your server API route
const handlePromoteToAdmin = async (userId: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch('/api/admin/assign-role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    },
    body: JSON.stringify({ userId, role: 'admin' })
  })
  
  if (!response.ok) throw new Error('Failed to assign role')
  
  // Important: user needs to refresh their token to see the new role
  // Notify them to re-login or call refreshSession() on their client
}
```

---

## 7. Testing Your App After Migration

### Test 1: Verify admin access still works

Run this SQL to confirm all admins have `app_metadata.role` set:
```sql
SELECT email, 
       raw_app_meta_data->>'role' AS app_role,
       (SELECT role FROM public.profiles p WHERE p.id = u.id) AS profiles_role
FROM auth.users u
WHERE raw_app_meta_data->>'role' = 'admin'
   OR raw_user_meta_data->>'role' = 'admin'
ORDER BY email;
```
Expected: Every row should have `app_role = 'admin'`.

### Test 2: Verify admin routes still work

Log in as an admin user and verify:
- `/dashboard/users` is accessible (middleware checks `is_admin()`)
- `/dashboard/admin` is accessible
- If you get redirected to `/dashboard?error=unauthorized`, the JWT hasn't refreshed yet — sign out and sign back in.

### Test 3: Verify anon access behaves correctly

```bash
# Replace ANON_KEY with your actual anon key
ANON_KEY="eyJ..."
BASE="https://umjpswrbowxkmatqgqgr.supabase.co/rest/v1"

# Should return ONLY units with status=Available ✅
curl "$BASE/storage_units?status=eq.Available" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"

# Should return 403 / empty — anon cannot read all units ✅
curl "$BASE/storage_units" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"

# Should return 403 / empty — anon cannot read analytics ✅
curl "$BASE/call_analytics" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"

# Should return 403 / empty — anon cannot read profiles ✅
curl "$BASE/profiles" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"

# Should succeed — anon can still insert bookings ✅
curl -X POST "$BASE/bookings" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"unit_id": 1, "status": "Pending"}'
```

### Test 4: Verify is_admin() returns correct values

Run as authenticated user via SQL Editor:
```sql
-- Should return true for admin users, false for regular users
SELECT auth.email(), is_admin();
```

Or in your app:
```typescript
const { data } = await supabase.rpc('is_admin')
console.log('Is admin:', data) // true or false
```

---

## 8. New RPC Functions Available

Two new server-side aggregation functions are available for any app to use. These pre-compute expensive analytics on the database side instead of the client.

### `get_unit_booking_stats(facility?)`

Returns unit counts and facility list. Useful for any app showing occupancy info.

```typescript
// Get all facilities and unit counts
const { data } = await supabase.rpc('get_unit_booking_stats')
// Returns: { units: { total, available, occupied, submitted }, facilities: [...] }

// Filter to a specific facility
const { data } = await supabase.rpc('get_unit_booking_stats', { p_facility: 'Penguin' })
```

### `get_call_analytics_aggregated(start_date?, end_date?)`

Returns pre-aggregated call data. Replaces fetching thousands of rows and processing in JS.

```typescript
// Get last 30 days (default)
const { data } = await supabase.rpc('get_call_analytics_aggregated')

// Get a custom date range
const { data } = await supabase.rpc('get_call_analytics_aggregated', {
  p_start_date: '2026-04-01T00:00:00Z',
  p_end_date:   '2026-04-21T23:59:59Z'
})

// Returns:
// {
//   summary: { total_calls, successful_handoffs, total_credits, high_quality_leads, ... },
//   daily_volume: [{ day, calls, handoffs, avg_duration, total_credits }],
//   csat_distribution: { "4 - Satisfied": 52, ... },
//   competitor_mentions: [{ name, count }],
//   move_in_windows: [{ window, count }]
// }
```

> These functions require `authenticated` role. The `anon` role cannot call `get_call_analytics_aggregated` (analytics data is protected).

---

## 9. Rollback Instructions

If any of these changes break a critical app and you need to revert temporarily:

### Rollback is_admin() to read user_metadata (NOT recommended — re-opens security hole)

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- WARNING: Reverted to insecure version — fix ASAP
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin';
END;
$$;
```

### Restore anon read access to a specific table (temporary, document and remove ASAP)

```sql
-- Example: Temporarily restore anon read to platform_settings
CREATE POLICY "TEMP anon read platform_settings"
  ON public.platform_settings FOR SELECT
  TO anon USING (true);

-- Document when this was added and set a reminder to remove it
COMMENT ON POLICY "TEMP anon read platform_settings" ON public.platform_settings
IS 'Temporary rollback - added 2026-04-21. Remove once [APP NAME] migrated to use authenticated access.';
```

> ⚠️ Any rollback that restores `USING (true)` for anon re-opens the security exposure. Treat rollbacks as **48-hour maximum** while the proper fix is implemented.

---

## Summary of Actions Required Per App

| App | Action Required | Priority |
|-----|----------------|----------|
| **Harcourts Storage App** | ✅ Already updated | Done |
| **Any app that sets admin roles** | Update role assignment to use `app_metadata` via server API | 🔴 Critical |
| **Any app that reads `user_metadata.role`** | Switch to reading `app_metadata.role` | 🔴 Critical |
| **AI Agent / ElevenLabs** | Verify agent still works with new scoped anon policies | 🟡 High |
| **Any app reading `profiles` as anon** | Add authentication or create a public view | 🟡 High |
| **Any app reading `platform_settings` as anon** | Move to server-side with service role | 🟡 High |
| **Any app reading `call_analytics` as anon** | Require authentication | 🟡 High |
| **Any app using authenticated users** | No changes needed | ✅ No action |

---

*Generated: 2026-04-21 | Project: umjpswrbowxkmatqgqgr | Harcourts Storage Platform*
