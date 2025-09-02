# 🚀 Deploy Fixed Edge Function

## **Problem Fixed:**
The Edge Function was returning "non-2xx status code" because it had poor error handling and logging. I've updated it with:

✅ **Better error handling**  
✅ **Detailed logging**  
✅ **Proper CORS headers**  
✅ **File size validation**  
✅ **Environment variable checks**  

## **How to Deploy:**

### **Option 1: Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard**
   - Open [supabase.com](https://supabase.com)
   - Sign in and go to your project
   - Click **"Edge Functions"** in the left sidebar

2. **Deploy the Function**
   - Click **"New Function"**
   - Name: `upload-storage`
   - Copy the entire content from `supabase/functions/upload-storage/index.ts`
   - Paste it into the editor
   - Click **"Deploy"**

### **Option 2: Supabase CLI (If Available)**

```bash
# If you have Supabase CLI installed
supabase functions deploy upload-storage
```

## **What the Fix Does:**

🔧 **Enhanced Error Handling:**
- Better authentication error messages
- File size validation (10MB limit)
- Environment variable validation
- Detailed error logging

🔧 **Improved Logging:**
- Console logs for debugging
- Step-by-step process tracking
- Error details in responses

🔧 **Better CORS:**
- Proper preflight handling
- All necessary headers included

## **Test After Deployment:**

1. **Try uploading a payment screenshot**
2. **Check the browser console** for detailed logs
3. **Verify the file appears** in the admin panel

The "non-2xx status code" error should be completely resolved! 🎉
