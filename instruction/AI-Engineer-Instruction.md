# AI Software Engineer - Reverse Engineering & Bug Fix Protocol

## Mission Overview

You are a **Senior Full-Stack Software Engineer** tasked with conducting a comprehensive reverse engineering analysis and resolution of critical bugs in a **Next.js + Supabase Storage Application**. Your role is to methodically diagnose root causes, provide detailed findings, and deliver production-ready fixes.

**Technology Stack:**
- **Framework:** Next.js (React-based, SSR/SSG) with TypeScript
- **UI Stack:** Tailwind CSS, Radix UI primitives, Lucide icons, Recharts
- **State & Data:** React Query (TanStack Query), Supabase JS client
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Deployment:** Netlify/Vercel (frontend)
- **Additional:** ESLint, TypeScript, date-fns, clsx, class-variance-authority

---

## PHASE 1: REVERSE ENGINEERING (Sequential Tool Usage)

### Objective
Conduct a **full reverse engineering analysis** of the application to understand architecture, data flow, authentication patterns, real-time subscriptions, and component relationships.

### Sequential Analysis Steps

#### Step 1: Code Repository Exploration
**Using:** Git historical analysis
**Actions:**
1. Execute: `git log --oneline --all | head -50` → Identify project timeline and key commits
2. Execute: `git log --grep="bug\|fix\|auth\|supabase\|realtime\|connection" --oneline` → Find related commits
3. Execute: `git diff HEAD~20..HEAD -- src/` → Analyze recent structural changes
4. Execute: `git log -p --follow -- "auth\|middleware\|provider"` → Track authentication flow changes
5. **Document:** Commit history patterns, rollback candidates, breaking changes

**Deliverable:** Timeline of changes, potential regression points, version history

---

#### Step 2: Project Structure Analysis
**Using:** File system inspection + Git metadata
**Actions:**
1. Map directory structure focusing on:
   - `/app/` or `/pages/` (routing)
   - `/components/` (component hierarchy)
   - `/lib/` or `/utils/` (utilities, Supabase client)
   - Authentication-related files (middleware, providers, guards)
   - Hooks (custom hooks for auth, queries, real-time)

2. Identify key files:
   - Supabase client initialization (`createClient()`, middleware setup)
   - Authentication context/provider
   - API routes (`/api/auth/*`)
   - Middleware files (`middleware.ts`, `middleware.js`)
   - Layout components (root layout, auth layout)
   - React Query configuration

3. **Document:** File locations, naming conventions, layering patterns

**Deliverable:** Complete file map with functional responsibilities

---

#### Step 3: Supabase Configuration Analysis
**Using:** Environment files + Git configuration history
**Actions:**
1. Review environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (if backend uses it)
   - Any custom Supabase configuration

2. Check Supabase initialization:
   - Client creation pattern (`createBrowserClient`, `createServerClient`, `createRouteHandlerClient`)
   - Auth persistence configuration
   - Real-time subscription setup
   - Timeout configurations
   - Connection retry logic

3. Review Supabase dashboard settings (from code/docs):
   - Email templates configuration
   - Redirect URLs (Auth > URL Configuration)
   - SMTP settings
   - Auth providers enabled
   - Session settings

4. **Document:** All Supabase configurations, initialization patterns, client types

**Deliverable:** Supabase configuration audit

---

#### Step 4: Authentication Flow Analysis
**Using:** Code inspection of auth-related files
**Actions:**
1. Map authentication providers:
   - `signInWithPassword()`
   - `signInWithOAuth()` (social login)
   - `signInWithOtp()`
   - `signUp()`
   - `signInWithMagicLink()`

2. Trace login flow:
   - Form submission → API route/Server Action
   - Session creation/storage
   - Redirect URLs and callback handling
   - State persistence across navigation
   - Token refresh mechanism

3. Trace signup/invitation flow:
   - User invitation creation (admin-initiated)
   - Email sending and template rendering
   - Email link handling and callback
   - Password setup flow
   - Account activation routing

4. Check auth state management:
   - `onAuthStateChange()` listeners
   - Session storage mechanism
   - Context providers and hooks
   - Redux/Zustand/Context API usage

5. **Document:** Complete auth flow diagrams, state transitions, callback handlers

**Deliverable:** Auth flow documentation with decision trees

---

#### Step 5: Real-Time Subscriptions & Connection Management
**Using:** Code search for Supabase realtime setup
**Actions:**
1. Find all real-time subscriptions:
   - `channel()` setup
   - `on('postgres_changes', ...)` listeners
   - Subscription lifecycle management
   - `subscribe()`, `unsubscribe()` patterns

2. Check connection handling:
   - Error listeners (`CHANNEL_ERROR`, `CLOSED`, `TIMED_OUT`)
   - Reconnection logic
   - Visibility change handlers
   - Network status detection

3. Trace data fetching:
   - React Query usage for initial loads
   - Real-time channel setup timing
   - Data freshness guarantees
   - Cache invalidation patterns

4. Check for cleanup:
   - `useEffect` cleanup functions
   - Memory leak prevention
   - Subscription removal on unmount

5. **Document:** All real-time subscriptions, their triggers, and error handling

**Deliverable:** Real-time architecture documentation

---

#### Step 6: Middleware & Request Handling Analysis
**Using:** Next.js middleware inspection
**Actions:**
1. Review `middleware.ts`:
   - Session validation on each request
   - Auth state refresh triggers
   - Redirect logic based on auth status
   - Cookie/header handling

2. Check API routes for auth:
   - Supabase client instantiation (browser vs server)
   - Cookie management
   - Session handling
   - Error responses

3. Analyze request/response cycle:
   - How cookies are set/read
   - Session persistence across requests
   - State hydration on page load

4. **Document:** Middleware logic, session flow, timing dependencies

**Deliverable:** Middleware and request handling flow diagram

---

#### Step 7: Component-Level Analysis (Focus on Problematic Flows)
**Using:** Code inspection of:
- Login/Signup components
- Protected page components
- Data-fetching components with infinite loading
- Invitation acceptance components

**Actions:**
1. For each problematic component:
   - Identify all Supabase calls
   - Find React Query setup
   - Check loading/error states
   - Identify dependency arrays
   - Check cleanup functions

2. Look for:
   - Missing error boundaries
   - Incomplete loading state handling
   - Race conditions in async operations
   - Stale closures in event handlers
   - Unhandled promise rejections

3. **Document:** Component dependency graph, potential race conditions

**Deliverable:** Component analysis with flagged risky patterns

---

### Phase 1 Deliverable: Comprehensive Reverse Engineering Report
**Include:**
1. Complete architecture diagram
2. Data flow for authentication
3. Real-time subscription flow
4. Component hierarchy
5. Session lifecycle diagram
6. Git commit timeline with potential regression points
7. Configuration audit
8. Risk assessment for each area

---

## PHASE 2: ROOT CAUSE ANALYSIS

### Issue #1: Database Connection Instability & Infinite Loading

**Symptoms:**
- After login, couple of minutes of idle → endless loading
- Page doesn't display data without cache clear + refresh
- "Loading..." states persist indefinitely

**Root Cause Investigation Steps:**

1. **Connection Timeout Analysis**
   - Find default Supabase client timeouts
   - Check if timeouts are explicitly configured
   - Verify token refresh interval
   - Check if session is being silently invalidated

2. **Session Persistence Issues**
   - Verify session is stored and retrieved correctly
   - Check if cookies are HTTP-only and properly set
   - Identify if auth state is lost after inactivity
   - Check for race conditions in session validation

3. **Real-Time Channel Issues**
   - Verify channels are not closing after inactivity
   - Check if channels reconnect on visibility change
   - Look for missing `setAuth()` calls on token refresh
   - Check error handling for disconnections

4. **React Query Cache Issues**
   - Verify stale time configuration
   - Check if data is being invalidated prematurely
   - Look for missing `onError` handlers
   - Check for infinite retry loops

5. **Network & Connectivity**
   - Check if visibility change listeners exist
   - Verify online/offline detection
   - Look for connection pool exhaustion
   - Check middleware for request throttling

**Testing Strategy:**
- Reproduce: Open app → login → wait 5 minutes idle → click a link
- Check browser DevTools:
  - Network tab for failed requests
  - Console for errors
  - Application tab for stored session/cookies
  - WebSocket connections (real-time status)

**Common Causes (Order of Probability):**
1. **Expired session without automatic refresh** → Session token expired, not refreshed silently
2. **Real-time channel died** → Channel disconnected on idle, no reconnection
3. **Supabase client reinitialization** → Client created per-render causing connection loss
4. **Cookie/Session storage issue** → Session not persisted or lost on page navigation
5. **React Query infinite loading** → Query stuck in loading state, retry loop disabled

---

### Issue #2: Invite Flow & Password Setup Redirect Loop

**Symptoms:**
- User receives invitation email
- Clicks link → routed to login page (not password setup)
- Even when setup completes, user redirected back to login instead of dashboard
- Intermittent: Sometimes works, sometimes loops

**Root Cause Investigation Steps:**

1. **Email Template Analysis**
   - Check email templates in Supabase Auth > Email Templates
   - Verify `{{ .ConfirmationURL }}` or custom URL construction
   - Check if URL includes correct redirect parameters
   - Look for localhost/hardcoded URLs in templates

2. **Invite User Creation Flow**
   - Who creates invites (admin action)?
   - How is invite email generated?
   - Is there a custom invite system or using Supabase invites?
   - Check if user is created in `auth.users` before email sent

3. **Callback Route Analysis**
   - Find `/auth/callback` or `/auth/confirm` route handler
   - Check for code/token exchange logic
   - Verify session is created after exchange
   - Check for premature redirects before session is ready
   - Look for redirect URL construction (checking for `/login` hardcoding)

4. **Password Setup Page Logic**
   - Is there a dedicated password setup page?
   - How is user identity verified on this page?
   - Check if this page requires special auth state (not fully logged in yet)
   - Verify redirect after password creation

5. **Auth State Validation Issues**
   - Check middleware logic for invited users
   - Verify if middleware is redirecting to login prematurely
   - Check for race conditions between session creation and redirect
   - Look for hard redirects vs conditional redirects

6. **URL Configuration Mismatch**
   - Verify `emailRedirectTo` URLs match Supabase dashboard settings
   - Check if callback URL in code matches dashboard
   - Verify redirect URLs are whitelisted in Supabase

**Testing Strategy:**
- Create test user, send invite to email
- Click link in email, monitor Network tab and Console
- Check if code exchange happens successfully
- Verify session exists after callback
- Check if redirect happens before session ready

**Common Causes (Order of Probability):**
1. **Wrong callback URL in email template** → Email links to old/wrong callback, or template has localhost
2. **Middleware redirects to login prematurely** → Middleware checks `user` before invite-user-setup is complete
3. **Race condition: redirect before session ready** → Callback redirects before `exchangeCodeForSession()` completes
4. **Missing auth state for invite flow** → No special handling for users with incomplete profiles
5. **Session not refreshing after password change** → Password updated but session not invalidated/refreshed
6. **localStorage/cookie not synced** → Session exists on server but client doesn't know

---

## PHASE 3: COMPREHENSIVE FINDINGS DOCUMENT

### Structure:

#### 1. Executive Summary
- Critical issues identified
- Impact on users
- Severity levels
- Recommended priority order

#### 2. Technical Root Causes
For each issue:
- **Root Cause:** Specific technical issue
- **Contributing Factors:** Secondary causes
- **Affected Code Paths:** Files and functions involved
- **Reproduction Steps:** Exact steps to reproduce

#### 3. Architecture Insights
- Current design patterns
- Architectural flaws contributing to issues
- Design decisions that work vs. those that don't
- Scalability concerns

#### 4. Risk Assessment
- Severity: Critical / High / Medium / Low
- Frequency: Always / Often / Sometimes / Rare
- User Impact: Complete outage / Feature broken / Degraded / Minor UX
- Data Loss Risk: Yes / No

---

## PHASE 4: FIXES & RECOMMENDATIONS

### Fix Strategy for Issue #1: Connection Instability

**Root Solution - Connection Resilience Pattern:**

1. **Implement Session Auto-Refresh**
```
- Listen to auth state changes
- On idle (2 min timeout), call supabase.auth.refreshSession()
- Update real-time auth token: supabase.realtime.setAuth(token)
- Prevent token expiration during active usage
```

2. **Real-Time Channel Error Handling**
```
- Add CHANNEL_ERROR and CLOSED listeners
- Auto-reconnect with exponential backoff
- Validate auth token before reconnecting
- Handle visibility changes (document.visibilitychange)
```

3. **React Query Configuration**
```
- Set staleTime: 5 minutes
- Set cacheTime: 10 minutes
- Implement proper error retry logic
- Add onError callback for debugging
```

4. **Middleware Session Validation**
```
- Refresh session on each request
- Don't rely solely on cookie
- Implement grace period for expired tokens
```

### Fix Strategy for Issue #2: Invite Flow

**Root Solution - Invite Flow Redesign:**

1. **Email Template Fix**
```
- Update email templates to point to correct production URL
- Use environment-aware redirect URLs
- Verify all email templates (confirmation, invite, reset)
```

2. **Callback Route Improvements**
```
- Add proper error handling
- Wait for session fully established before redirect
- Add state validation before redirect
- Log all steps for debugging
```

3. **Invite User Middleware Exception**
```
- Detect if user is invited user (has incomplete setup)
- Skip some auth checks for setup flow
- Allow access to password-setup page without full auth
```

4. **Database Trigger/RPC**
```
- Create RPC to handle invite acceptance
- Ensure atomic operations (profile created + role assigned)
- Prevent race conditions in setup flow
```

---

## PHASE 5: IMPLEMENTATION CHECKLIST

**Before Starting Fixes:**
- [ ] Create feature branch: `fix/connection-stability` and `fix/invite-flow`
- [ ] Write unit tests for each fix
- [ ] Create reproduction tests
- [ ] Set up monitoring/logging
- [ ] Prepare rollback plan

**Connection Stability Fix:**
- [ ] Implement session auto-refresh hook
- [ ] Add real-time reconnection logic
- [ ] Update React Query config
- [ ] Test: 10-minute idle test
- [ ] Monitor: Check console for errors
- [ ] Document: All timeout values and intervals

**Invite Flow Fix:**
- [ ] Update email templates
- [ ] Fix callback route
- [ ] Add invite state validation
- [ ] Create password-setup guard
- [ ] Test: Full invite flow from admin to user
- [ ] Monitor: Track redirect counts per session

---

## PHASE 6: VERIFICATION & MONITORING

**After Fixes:**

1. **Test Coverage**
   - Create reproducible test cases
   - Test with various idle durations
   - Test with network interruptions
   - Test on multiple devices/browsers
   - Test invite flow end-to-end

2. **Monitoring Setup**
   - Log all auth state changes
   - Log session refresh attempts
   - Log redirect triggers
   - Set up error alerting
   - Create performance metrics

3. **User Testing**
   - Test with real user scenarios
   - Measure time to complete flows
   - Gather feedback on UX improvements
   - Document any remaining issues

4. **Production Rollout**
   - Deploy to staging first
   - Monitor for 24 hours
   - Gradually roll out to production
   - Have rollback plan ready

---

## SUPPLEMENTARY ANALYSIS TOOLS

### When Analyzing Issues, Use These Commands:

**Git History:**
```bash
git log --oneline -- "src/lib/supabase\|src/middleware"
git diff HEAD~10 -- "src/pages/auth"
git log -p --grep="auth" | head -200
```

**Code Search:**
```bash
grep -r "onAuthStateChange" src/
grep -r "supabase.auth" src/ | grep -v node_modules
grep -r "createClient" src/lib src/utils
grep -r "removeChannel\|unsubscribe" src/
```

**Configuration Audit:**
```
Review .env files
Check supabase/config.toml (if self-hosted)
Verify next.config.js for middleware config
```

---

## DELIVERABLES CHECKLIST

### Phase 1: Reverse Engineering Report ✓
- [ ] Architecture overview document
- [ ] Data flow diagrams
- [ ] Auth flow documentation
- [ ] Real-time flow documentation
- [ ] File structure map
- [ ] Configuration audit

### Phase 2: Root Cause Analysis ✓
- [ ] Issue #1 root cause identified
- [ ] Issue #2 root cause identified
- [ ] Contributing factors documented
- [ ] Reproduction steps verified

### Phase 3: Findings & Insights ✓
- [ ] Executive summary
- [ ] Technical root causes
- [ ] Architecture insights
- [ ] Risk assessment matrix
- [ ] Code smell detection

### Phase 4: Fix Implementation ✓
- [ ] Fix code for Issue #1
- [ ] Fix code for Issue #2
- [ ] Tests for each fix
- [ ] Documentation for changes
- [ ] Rollback plan

### Phase 5: Monitoring & Verification ✓
- [ ] Performance metrics
- [ ] Error tracking setup
- [ ] User acceptance criteria
- [ ] Production rollout plan

---

## SUCCESS CRITERIA

✅ **Issue #1 Fixed:** Users can remain idle 30+ minutes, return, and see data without refresh
✅ **Issue #2 Fixed:** Invitation flow completes without loops, redirects to dashboard after setup
✅ **Code Quality:** No console errors, proper error handling, clean logs
✅ **Performance:** Initial load < 3s, data display < 1s after login
✅ **Monitoring:** All critical actions logged and traceable
✅ **Documentation:** All fixes documented for future maintenance

---

## NOTES FOR AI ENGINEER

- **Be Thorough:** Don't assume—verify with code inspection
- **Use Sequential Tools:** Search git history THEN code THEN config
- **Document Findings:** Create clear audit trails for every conclusion
- **Test Theories:** Create minimal reproducers before implementing fixes
- **Think Holistically:** Issues may span frontend, middleware, backend
- **Consider User Experience:** Fixes should improve experience, not just resolve errors
- **Plan for Scale:** Solutions should work as user base grows