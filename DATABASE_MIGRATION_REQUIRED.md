# 🗄️ Database Migration Required

## Overview
The frontend enrollment form has been updated with comprehensive changes that require corresponding database updates to maintain consistency.

## ⚠️ CRITICAL: Apply This Migration

Run the following migration file to sync your database with the frontend changes:

**File:** `supabase/migrations/20241220000000_update_enrollment_form_fields.sql`

## 📋 Changes Made

### 1. **Country Field Updates**
- **Before:** 6 countries (Bangladesh, India, Pakistan, Nepal, Sri Lanka, Other)
- **After:** 70+ countries (comprehensive global list)

### 2. **Location Field Updates**
- **State field:**
  - Label: "State" → "Current State"
  - Required: false → **true**
- **City field:**
  - Label: "City" → "Current City" 
  - Required: false → **true**

### 3. **Academic Status Options**
- **Before:** ["Student", "Professional", "Researcher", "Other"]
- **After:** ["Undergraduate Student", "Graduate Student", "PhD Student", "Postdoc", "Faculty/Professor", "Industry Professional", "Research Scientist", "Other"]

### 4. **Experience Options**
- **Before:** ["Beginner", "Intermediate", "Advanced"]
- **After:** ["Beginner (0-1 years)", "Intermediate (1-3 years)", "Advanced (3-5 years)", "Expert (5+ years)"]

### 5. **Payment Method Options**
- **Before:** ["UPI", "PayPal", "Bkash", "Bank Transfer"]
- **After:** ["UPI", "PayPal", "Bkash"]

## 🔧 How to Apply

### Option 1: Using Supabase CLI
```bash
supabase db push
```

### Option 2: Manual SQL Execution
Execute the SQL commands in the migration file directly in your Supabase dashboard SQL editor.

### Option 3: Using Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration content
4. Execute the queries

## ✅ Verification Checklist

After applying the migration, verify:

- [ ] Country dropdown shows 70+ countries
- [ ] State field is labeled "Current State" and required
- [ ] City field is labeled "Current City" and required  
- [ ] Academic status has 8 detailed options
- [ ] Experience has 4 time-based options
- [ ] Payment method has 3 options (UPI, PayPal, Bkash)

## 🚨 Impact of Not Applying Migration

If you don't apply this migration:

1. **Form field mismatch:** Frontend shows 70+ countries, DB only has 6
2. **Validation errors:** Users can select countries not in DB dropdown options
3. **Data inconsistency:** State/City may not be collected as required fields
4. **Admin panel issues:** Dropdowns in admin enrollment forms management will be outdated

## 📊 Database Tables Affected

- `public.enrollment_form_fields` - Field configurations updated
- All existing course enrollment forms will inherit these changes

## 🔒 Data Safety

This migration only UPDATES existing configuration records and doesn't delete any user data. All existing enrollment submissions remain intact.

## 📞 Support

If you encounter any issues applying this migration, the frontend will still work with default fallback fields, but database consistency is recommended for optimal experience.
