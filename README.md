# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/75c20c22-35cb-443c-b722-24e72d40fde0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/75c20c22-35cb-443c-b722-24e72d40fde0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Optional: Service role key for server-side operations (keep secure)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: Never commit your `.env` file or expose service role keys in client-side code.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Database, Auth, Storage)

## Admin Setup

To set up an admin user, follow these steps:

1. **Create a user account** through the sign-up flow
2. **Update the user's role** in the database using one of these methods:

### Option A: Using Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project → Table Editor → `profiles`
3. Find your user row and edit the `role` column to `admin`

### Option B: Using SQL in Supabase SQL Editor
```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Option C: Using CLI (if using local development)
```bash
# Run this SQL command in your local database
psql -d your_database -c "UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';"
```

After updating your role to `admin`, you'll have access to the admin panel at `/admin`.

## Authentication Setup

For authentication to work properly in production, make sure to:

1. Set the correct **Site URL** in Supabase Auth settings
2. Add your domain to **Redirect URLs** in Supabase Auth settings
3. Optionally disable "Confirm email" for faster testing (not recommended for production)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/75c20c22-35cb-443c-b722-24e72d40fde0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
