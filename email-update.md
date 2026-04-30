Subject: Update: "Let Penny Make a Call" Feature Deployment & QA Audit

Hi Brad,

The new **"Let Penny Make a Call"** outbound calling feature has been successfully deployed to production! You can access it and run your tests by going to:
🔗 https://pmapp.hup.net.au/login

### What's New & Testing Instructions
This feature allows our PMs to trigger an outbound AI voice call to referees directly from the dashboard. 
When testing, please note the new **required fields validation**, particularly around phone numbers:
- The **"To number"** field enforces the inclusion of the area/country code. 
- For Australian numbers, you must start with `+61` and include exactly 9 digits afterward (e.g., `+61 412 345 678` for mobiles or `+61 2 1234 5678` for landlines). This prevents calls from failing due to missing area codes.
- Applicant Name, Property Address, Agency Name, and Referee Name are also required. 
- If "Landlord" is selected as the relationship, the Tenancy Address and Landlord Type become required fields.

---

### 🔍 AUDIT REPORT: Let Penny Make a Call
As requested, I have completed a full QA Code Audit on this newly implemented feature prior to its release. 

#### Scope
- **Feature:** Outbound AI Agent Call Initiation (Penny)
- **Risk Level:** High (Involves external AI API integration, DB mutations, and user inputs)
- **Key Files:** `penny-outbound/submit/route.ts`, `validation.ts`, `CallForm.tsx`, `PhoneNumberInput.tsx`, and associated Supabase schema.

#### ✅ PASSED
- **Data Flow Verification:** The data flow is robust. The user form securely posts to `/api/penny-outbound/submit`. 
- **Resiliency:** The backend strictly registers an "initiating" record in the DB *before* dialing out via Retell AI. Even if Retell fails or the environment is misconfigured, the exact error is caught, securely logged in the database, and the status changes to "failed" instead of leaving zombie states.
- **Edge Cases Handled:** 
  - Malformed phone numbers are rejected immediately at the client UI and the server API.
  - "Double-clicking" during submission is prevented by the UI `submitting` state which disables the button and inputs.
- **UI/UX Correctness:** Icon positioning overlaps (the phone icon colliding with the placeholder) have been patched. 

#### 🛡️ SECURITY
- **[PASS] Auth Checks:** The API route performs a rigorous `supabase.auth.getUser()` check. It strictly assigns the verified `user.id` to the database record.
- **[PASS] No Exposed Secrets:** Retell API Keys and Agent IDs are kept safely on the server side via environment variables.
- **[PASS] Input Validation:** The backend runs a rigorous sanitization step (`sanitizeFormData`) and re-validates the payload against the server, stopping bad actors from bypassing the UI. 

#### 📊 SUMMARY
| Category | Status |
|---|---|
| Functional correctness | ✅ PASS |
| Edge cases | ✅ PASS |
| Security | ✅ PASS |
| Performance | ✅ PASS |
| UI/UX | ✅ PASS |
| Code quality | ✅ PASS |

**VERDICT: APPROVED & LIVE**

Let me know if you run into any issues or need adjustments to the call flows!

Best regards,
The Engineering Team
