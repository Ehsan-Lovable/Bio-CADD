# 🔧 Fix Screenshot Viewing Error

## ❌ Current Error
When admin tries to view payment screenshots: **"Storage bucket not found. Please run the database migration to fix this issue."**

## ✅ Solution
Apply the complete database migration to create the missing storage bucket and update all form fields.

## 📋 Steps to Fix

### 1. **Go to Supabase Dashboard**
- Visit [supabase.com](https://supabase.com)
- Sign in and select your project
- Click **"SQL Editor"** in the left sidebar

### 2. **Apply Complete Migration**
- Click **"New Query"**
- Copy the entire content from `COMPLETE_DATABASE_MIGRATION.sql`
- Paste it into the SQL Editor
- Click **"Run"** (or press Ctrl+Enter)

### 3. **Verify Success**
After running the migration, you should see verification results at the bottom showing:
- ✅ **STORAGE BUCKET CHECK**: documents bucket exists
- ✅ **COUNTRY OPTIONS CHECK**: 71 countries available  
- ✅ **LOCATION FIELDS CHECK**: Current State & Current City (required=true)
- ✅ **ACADEMIC STATUS CHECK**: 8 options available

## 🎯 What This Migration Does

### Fixes Screenshot Error:
- ✅ Creates `documents` storage bucket for payment screenshots
- ✅ Sets up proper security policies for file access
- ✅ Allows admins to view all uploaded files
- ✅ Allows users to upload to their own folders

### Syncs Database with Frontend:
- ✅ Updates country list from 6 to 70+ countries
- ✅ Makes state/city fields mandatory
- ✅ Updates field labels to "Current State" and "Current City"
- ✅ Improves academic status and experience options
- ✅ Streamlines payment method options

## 🚨 After Migration

1. **Test screenshot viewing** - Admin should be able to view payment screenshots without errors
2. **Test form submission** - Users should see updated country list and mandatory state/city fields
3. **Check admin panel** - All new fields should display properly in submissions

## 📞 If Issues Persist

If you still get storage errors after migration:
1. Check if the migration ran completely (look for verification results)
2. Refresh the admin panel page
3. Try logging out and back in to refresh permissions

The complete migration is ready in `COMPLETE_DATABASE_MIGRATION.sql` - just copy and run it!
