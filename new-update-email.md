**To:** Harcourts Storage Team  
**From:** Development Team  
**Date:** 6 May 2026  
**Subject:** ✅ New Feature — Waitlist Call Insights + Analytics Inbound/Outbound Filters

---

Hi Brad,

We've just deployed an update that connects two parts of the system that were previously separate — **Waitlist Management** and **Call Analytics**. Previously, when Penny made an outbound call to someone on the waitlist, the call data and the waitlist entry lived in different parts of the dashboard with no visible connection. Now they're linked together, so you can see exactly what happened on the call without leaving the waitlist page, and your Call Analytics page now clearly distinguishes between inbound calls (people calling you) and outbound calls (Penny calling people on the waitlist).

Everything below is **live now** at: 🔗 [https://pmapp.hup.net.au/login](https://pmapp.hup.net.au/login)

---

## 📊 Call Analytics — Inbound vs Outbound Filters

The Call Analytics page now lets you filter calls by direction. Previously, all calls appeared in one list with no way to tell which ones were inbound (someone calling your facilities) versus outbound (Penny calling a waitlisted client).

**What's new:**

- **Filter tabs** at the top of the page: **All Calls**, **Inbound**, and **Outbound** — each showing a count so you can see the volume at a glance
- **Type badges** on every call in the table — a blue "Inbound" or green "Outbound" label next to each entry
- **Outbound Calls stat card** — when outbound calls exist, a new summary card appears showing the total outbound count and average call duration
- **Type indicator in call details** — when you open any call, the drawer now shows whether it was inbound or outbound right in the header

**Before:** All 319 calls appeared in one undifferentiated list — no way to tell if a call was someone ringing in or Penny ringing out.

**After:** One click on the "Outbound" tab filters to just the waitlist calls. You can immediately see how those conversations went, what was discussed, and how long they lasted.

---

## 📋 Waitlist — "Penny Called" Column + View Call Details

The Waitlist page now shows whether Penny has called each person and lets you view the full call results without leaving the page.

**What's new:**

- **"Penny Called" column** — appears after the Status column in the waitlist table. When Penny has called someone, it shows the exact date and time
- **"View Call" button** — on any row where Penny has made a call, a green button appears. Clicking it opens a detail panel showing everything about that call:
  - What Penny and the person discussed (the AI-generated summary)
  - The customer satisfaction rating
  - Whether the call was brand-compliant
  - Whether a handoff to a human was needed
  - The full word-for-word transcript in a chat-bubble format
- **Waitlist context card** — when viewing a call from the waitlist, you'll see a card at the top showing who was called, which facility it was about, and when the call happened — so you always have context

**Before:** You could see "Contacted" in the status column, but had no way to know what Penny discussed, whether the person was interested, or what happened on the call — you'd have to go to a completely different page and search.

**After:** Click "View Call" on any waitlist entry → instantly see the full call details, transcript, and outcome, all in one place.

---

## 📈 Waitlist Stats — Outbound Call Metrics

A new stat card has been added to the waitlist dashboard:

| Metric | What it tells you |
|---|---|
| **Penny Outbound** | How many people on the waitlist Penny has called so far |
| **Avg Response Time** | On average, how quickly Penny contacted someone after they were added to the waitlist |

This gives you visibility into how proactively waitlisted clients are being reached and whether there are delays worth addressing.

---

## Summary

| Item | Status |
|---|---|
| Call Analytics — Inbound / Outbound filter tabs with counts | ✅ Live |
| Call Analytics — Type badges (blue Inbound / green Outbound) on every row | ✅ Live |
| Call Analytics — Outbound Calls summary card (count + avg duration) | ✅ Live |
| Call Details — Inbound/Outbound indicator in the header | ✅ Live |
| Waitlist — "Penny Called" column with date/time | ✅ Live |
| Waitlist — "View Call" button to open full call transcript + results | ✅ Live |
| Waitlist — Waitlist context card showing who was called and when | ✅ Live |
| Waitlist Stats — Penny Outbound count + average response time | ✅ Live |

**Where to test:**
- [https://pmapp.hup.net.au/login](https://pmapp.hup.net.au/login) → **Call Analytics** (sidebar) — try the Inbound/Outbound tabs
- [https://pmapp.hup.net.au/login](https://pmapp.hup.net.au/login) → **Waitlist** (sidebar) — look for the "Penny Called" column and "View Call" button

Let us know if you'd like any changes to how the call details are presented or if you want additional metrics tracked!

Cheers,  
Development Team
