Subject: New Feature: "Penny Storage Outbound" — AI-Powered Waitlist Follow-Up Calls

Hi Brad,

A new feature called **"Penny Storage Outbound"** has been deployed! It lets property managers trigger an AI voice call to clients who are waiting for a storage unit, so Penny can notify them the moment space becomes available.

🔗 https://pmapp.hup.net.au/login → Dashboard → **Penny Storage Outbound** (new emerald card)

---

### ✨ What's New

**1. Penny Storage Outbound — Smart Waitlist Calling**
Property managers can now select a client from the waitlist and have Penny call them with details about available storage units at their facility.
- **Before:** Managers had to manually phone waitlisted clients when units became available.
- **After:** Select a waitlist entry → the form auto-fills the client's name, phone, facility, and available unit details → click "Let Penny Call" and Penny handles the conversation.

**2. Smart Auto-Fill from Waitlist**
When you select a client from the waitlist search, the form auto-populates:
- Client name and first name (Penny uses this for a friendly greeting)
- Phone number (automatically converted to international format with country code)
- Facility name and available unit count + details (pulled live from the database)

**3. International Phone Numbers Supported**
The system now accepts phone numbers from any country — not just Australian (+61). Philippine numbers (+63), for example, are fully supported. Numbers stored without a country code are automatically converted.

**4. Dashboard Card**
A new emerald-themed card has been added to the dashboard with a "New Feature" badge, giving quick access to the calling form and a link to view call analytics.

**5. Responsive Dashboard Improvements**
The dashboard grid layout has been refined for better display on mobile and tablet screens — smaller cards stack cleanly, and the quick-action buttons wrap more naturally on narrow screens.

---

### 🧪 Testing Instructions
1. Log into the dashboard and look for the new **green "Penny Storage Outbound"** card.
2. Click into the form and try:
   - **Selecting a waitlist entry** — fields should auto-fill including the phone number with `+61` prefix.
   - **Entering a Philippine number** like `+639665971704` — it should be accepted.
   - **Selecting a facility** — the available units badge should appear showing live unit count from the database.
3. Click **"Let Penny Call"** to trigger the outbound AI call.

---

### 📊 Quality Status
| Category | Status |
|---|---|
| Build (Next.js 16) | ✅ PASS — 0 errors |
| Lint (ESLint) | ✅ PASS — 0 errors, 0 warnings |
| Security (server-only API keys) | ✅ PASS |
| Responsive design | ✅ PASS |
| International phone support | ✅ PASS |

Let me know if you have any questions or need adjustments!

Best regards,
The Engineering Team
