# AI Engineer Setup - Quick Start Guide

## 📋 What You're About to Do

You'll provide an AI engineer with a **complete reverse engineering protocol** to diagnose and fix two critical bugs in your Next.js + Supabase app.

**Time Investment:** 2-4 hours of analysis (AI-assisted) + 2-4 hours implementation
**Expected Outcome:** Production-ready fixes for both issues

---

## 📦 Deliverables Created

You now have **3 comprehensive documents**:

### 1. **AI-Engineer-Instruction.md** 
   - Complete reverse engineering protocol
   - 6-step analysis methodology
   - Root cause investigation framework
   - Deliverable checklist
   - **Use this to:** Guide the AI through systematic analysis

### 2. **fixes-reference.md**
   - Quick code patterns for common fixes
   - Production-ready code snippets
   - Session refresh implementation
   - Real-time resilience patterns
   - Callback route fixes
   - Debugging commands
   - **Use this to:** Reference while implementing solutions

### 3. **AI-Engineer-Prompt.md**
   - Ready-to-use prompt for your AI
   - System instructions for the AI
   - Detailed project context
   - Phase-by-phase breakdown
   - Success metrics
   - **Use this to:** Paste directly into Claude, ChatGPT, etc.

---

## 🚀 How to Use These Documents

### Option A: Use with Claude/ChatGPT (Recommended)

**Step 1:** Copy the content from `AI-Engineer-Prompt.md`

**Step 2:** Paste into Claude or ChatGPT as a new conversation

**Step 3:** The AI will methodically:
   - Analyze your project structure
   - Trace authentication flows
   - Identify root causes
   - Recommend fixes
   - Provide implementation steps

**Step 4:** When AI requests your code (or you paste it):
   - Paste your `/app`, `/lib`, `/utils` directories
   - Paste your `middleware.ts`
   - Paste your authentication components
   - Paste your `.env` files (keys redacted if public)

**Step 5:** Follow AI's analysis and implement recommendations

### Option B: Use with Your Dev Team

1. **Give them all 3 documents**
2. **Start with:** AI-Engineer-Instruction.md (phases 1-2)
3. **Reference:** fixes-reference.md for code patterns
4. **Use:** AI-Engineer-Prompt.md as a detailed checklist

---

## 🔍 What Each Document Contains

### AI-Engineer-Instruction.md Structure:

```
├── PHASE 1: REVERSE ENGINEERING (sequential analysis)
│   ├── Step 1: Repository exploration (Git history)
│   ├── Step 2: Project structure mapping
│   ├── Step 3: Supabase configuration audit
│   ├── Step 4: Authentication flow analysis
│   ├── Step 5: Real-time subscriptions & connections
│   ├── Step 6: Middleware & request handling
│   └── Step 7: Component-level analysis
│
├── PHASE 2: ROOT CAUSE ANALYSIS
│   ├── Issue #1: Connection stability investigation
│   └── Issue #2: Invitation flow investigation
│
├── PHASE 3: FINDINGS DOCUMENT
│   ├── Executive summary
│   ├── Technical root causes
│   ├── Architecture insights
│   └── Risk assessment
│
├── PHASE 4: FIXES & RECOMMENDATIONS
│   ├── Connection stability fix
│   └── Invitation flow fix
│
├── PHASE 5: IMPLEMENTATION CHECKLIST
│   ├── Before fixes checklist
│   ├── Connection stability tasks
│   └── Invitation flow tasks
│
└── PHASE 6: VERIFICATION & MONITORING
    ├── Test coverage
    ├── Monitoring setup
    ├── User testing
    └── Production rollout
```

### fixes-reference.md Structure:

```
├── ISSUE #1 FIXES
│   ├── Fix #1: Session Auto-Refresh Hook (useSessionRefresh)
│   ├── Fix #2: Real-time Channel Error Recovery
│   ├── Fix #3: React Query Configuration
│   └── Debugging commands
│
├── ISSUE #2 FIXES
│   ├── Fix #1: Email Template corrections
│   ├── Fix #2: Auth Callback Route improvements
│   ├── Fix #3: Invite-aware middleware
│   ├── Fix #4: Password setup page
│   └── Debugging commands
│
└── VERIFICATION CHECKLIST
    ├── Issue #1 verification steps
    └── Issue #2 verification steps
```

---

## 💡 Key Insights (Save Time with These)

### Issue #1: Connection Drops After Idle

**Most Likely Cause:** Session token expires, real-time channels close on background tabs
**Quick Fix:** Auto-refresh session every 2 minutes + handle visibility changes

**Key Code to Check:**
```
- Look for: supabase.auth.onAuthStateChange()
- Look for: .channel().subscribe()
- Look for: useEffect with real-time setup
- Missing: supabase.realtime.setAuth() after token refresh
```

### Issue #2: Invite Loop Redirect

**Most Likely Cause:** Email template points to wrong URL OR middleware redirects before password is set
**Quick Fix:** Update email templates + add invite-state detection in middleware

**Key Code to Check:**
```
- Find: Email templates in Supabase dashboard
- Find: /auth/callback route handler
- Find: middleware.ts redirect logic
- Missing: Special handling for "invited but not yet setup" users
```

---

## 📊 Recommended Analysis Order

### First (30 min):
1. Run: `git log --oneline | head -50` → See project timeline
2. Run: `git log --grep="auth\|supabase\|connection" --oneline` → Find related changes
3. Look at: `/lib` directory structure → Find Supabase client

### Second (30 min):
4. Search for: `createClient()` → How many places?
5. Search for: `onAuthStateChange` → Any listeners?
6. Search for: `.channel()` → Real-time subscriptions?

### Third (1 hour):
7. Trace: Full login flow from form to dashboard
8. Trace: Full invite flow from admin action to user access
9. Test: Reproduce both issues to confirm behaviors

### Fourth (30 min):
10. Compare: Your code vs. fixes-reference.md patterns
11. Identify: Which fixes apply to your code
12. Plan: Implementation strategy

---

## 🛠️ Implementation Strategy

### For Issue #1 (Connection Stability):

**Add these to your app:**
1. `useSessionRefresh()` hook in root layout
2. Real-time error recovery in subscription setup
3. Updated React Query configuration
4. Middleware session validation improvements

**Expected fixes time:** 1-2 hours

### For Issue #2 (Invitation Flow):

**Do these in order:**
1. Fix email templates (Supabase dashboard)
2. Improve callback route error handling
3. Add invite-state detection in middleware
4. Create password-setup page (if not exists)

**Expected fixes time:** 2-3 hours

---

## ✅ Verification Checklist

### After Issue #1 Fixed:
- [ ] User can idle 30+ minutes
- [ ] Return to tab, data loads immediately
- [ ] No cache clearing needed
- [ ] Console shows no auth errors
- [ ] Real-time updates work after idle
- [ ] Multiple tabs stay synchronized

### After Issue #2 Fixed:
- [ ] Invite email sends successfully
- [ ] Click email link → goes to password setup (not login)
- [ ] Set password → redirected to dashboard (not login)
- [ ] User fully authenticated
- [ ] No infinite redirects

---

## 🎯 Success Metrics

After both fixes, your app should have:

✅ **Zero infinite loading states** - All queries have proper timeouts
✅ **Seamless reconnection** - Drop connection, auto-reconnects silently
✅ **Working invite flow** - Users can complete signup in one flow
✅ **No cache dependencies** - Data loads without hard refresh
✅ **Production-ready** - Proper error handling and logging
✅ **Fully documented** - All changes tracked and explained

---

## 📞 Common Questions Answered

**Q: Will these fixes break anything?**
A: No. They add resilience without changing existing functionality. Fully backward-compatible.

**Q: Do I need to deploy a new version?**
A: Yes. After testing in staging for 24 hours, deploy to production.

**Q: What if the fixes don't work?**
A: The reverse engineering protocol will have identified the root cause. You'll know exactly what's failing.

**Q: Do I need to change my database?**
A: No. These are purely application-level fixes (auth flow, session management, real-time handling).

**Q: Can I do this incrementally?**
A: Yes. Fix Issue #1 first, test, then fix Issue #2. Or do both in parallel.

---

## 🔗 Resource Links

### Research Sources Used:
- [Reddit: Supabase connectivity issues](https://www.reddit.com/r/Supabase/comments/1kuc3y6/)
- [Supabase Real-time Reconnection](https://github.com/supabase/realtime-js/issues/121)
- [Next.js + Supabase Auth Guide](https://supabase.com/docs/guides/auth/server-side)
- [Supabase Connection Management](https://supabase.com/docs/guides/database/connection-management)
- [Real-time Error Recovery Patterns](https://github.com/orgs/supabase/discussions/5312)
- [Email Redirect URL Issues](https://github.com/orgs/supabase/discussions/21092)

---

## 📝 Next Steps

### Immediate (Today):
1. ✅ You've created the 3 instruction documents
2. ⬜ Choose your approach: AI-assisted or team-based
3. ⬜ Prepare your code repository
4. ⬜ Brief your team or AI on the issues

### Short Term (This Week):
1. ⬜ Run the reverse engineering analysis (Phases 1-2)
2. ⬜ Generate the findings report
3. ⬜ Review root causes identified
4. ⬜ Plan implementation

### Medium Term (Next Week):
1. ⬜ Implement fixes for both issues
2. ⬜ Write tests for each fix
3. ⬜ Test in staging environment
4. ⬜ Deploy to production with monitoring

### Ongoing:
1. ⬜ Monitor production for issues
2. ⬜ Track performance improvements
3. ⬜ Gather user feedback
4. ⬜ Document lessons learned

---

## 🎓 Learning Points

After fixing these issues, you'll understand:

✅ How Supabase session management works
✅ Real-time connection lifecycle and recovery
✅ Next.js middleware authentication patterns
✅ React Query caching strategies
✅ Email template and callback URL configuration
✅ Debugging persistent connection issues
✅ Building resilient real-time applications

---

## 📋 Final Checklist

Before starting:

- [ ] You have all 3 documents
- [ ] You understand the two issues clearly
- [ ] You've chosen AI-assisted or team-based approach
- [ ] You have access to your codebase
- [ ] You can deploy to staging
- [ ] You have monitoring/logging setup
- [ ] You've communicated timeline to stakeholders
- [ ] You've created a backup of current code

---

## 🚀 You're Ready!

You now have a **complete, systematic approach** to:
1. Understand your application architecture
2. Identify exact root causes
3. Implement production-ready fixes
4. Verify everything works
5. Deploy with confidence

**Start with the AI-Engineer-Prompt.md file and let the AI engineer guide you through the analysis.**

Good luck! 🎉