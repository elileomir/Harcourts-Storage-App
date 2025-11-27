# Enable Supabase Realtime

## Issue

The application is experiencing `CHANNEL_ERROR` on real-time subscriptions because **Supabase Realtime is not enabled** on the database tables.

## Symptoms

- Console shows: `[channel-name] System event: error`
- Console shows: `[channel-name] ❌ Subscription failed`
- Pages show infinite "Loading..." states
- Data doesn't update in real-time

## Solution

You need to enable Realtime on your Supabase tables. Follow these steps:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Database** → **Replication**
4. Find the following tables and enable Realtime for each:
   - `storage_units`
   - `bookings`
   - `call_analytics`
   - `knowledge_base`
   - `profiles`
5. Toggle the switch to **enable** Realtime for each table
6. Wait a few seconds for changes to propagate

### Option 2: Using SQL

Run this SQL in the **SQL Editor**:

```sql
-- Enable Realtime for all required tables
ALTER PUBLICATION supabase_realtime ADD TABLE storage_units;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE call_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE knowledge_base;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
```

### Verify Realtime is Enabled

After enabling, check the console logs. You should see:

```
[dashboard-realtime] ✅ Successfully subscribed
```

Instead of:

```
[dashboard-realtime] System event: error
[dashboard-realtime] ❌ Subscription failed
```

## Current Behavior (Without Realtime)

The app will still work, but:
- ✅ Data loads on page navigation
- ✅ Manual refresh works
- ❌ No automatic updates when data changes
- ❌ Changes in other tabs/browsers won't appear automatically

## After Enabling Realtime

- ✅ Data loads on page navigation
- ✅ Automatic updates when data changes
- ✅ Changes appear across all tabs/browsers in real-time
- ✅ No manual refresh needed

## Troubleshooting

If Realtime still doesn't work after enabling:

1. **Check RLS Policies**: Ensure Row Level Security policies allow SELECT access
2. **Check Browser Console**: Look for specific error messages
3. **Restart Dev Server**: `pnpm dev` (Ctrl+C then restart)
4. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)

## Reference

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Enabling Realtime on Tables](https://supabase.com/docs/guides/realtime/postgres-changes#enable-realtime-on-tables)
