# 🗄️ Supabase Database Setup Guide

This guide will help you set up Supabase as your database backend for Quarterback, enabling data sync across all your devices and browsers.

## 🚀 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Fill in project details:**
   - Organization: Choose your org or create one
   - Project Name: `quarterback`
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to your location
5. **Click "Create new project"**
6. **Wait ~2 minutes** for the project to be created

## 🔑 Step 2: Get Your Credentials

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values:**
   - **Project URL** (looks like `https://xyz.supabase.co`)
   - **Anon Key** (public key, safe for frontend)
   - **Service Role Key** (secret, for admin operations - optional)

## 🗃️ Step 3: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Click "New Query"**
3. **Copy and paste** the entire contents of `supabase-schema.sql`
4. **Click "Run"** to execute the schema
5. **Verify** that all tables were created successfully

## ⚙️ Step 4: Configure Environment Variables

1. **Create a new file** called `.env.local` in your project root
2. **Copy the contents** from `supabase-env-template.txt`
3. **Replace the placeholder values** with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
```

## 🔄 Step 5: Enable Authentication (Optional)

If you want user authentication:

1. **Go to Authentication → Settings** in Supabase
2. **Enable Email authentication**
3. **Configure your site URL** (e.g., `http://localhost:3000` for development)
4. **Add redirect URLs** as needed

## 🧪 Step 6: Test the Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Go to Settings → General Settings**
3. **Look for the "Database Setup Required" section**
4. **Enter your email address** to initialize your user account
5. **Verify** that data is being saved to Supabase

## 📊 Step 7: Verify Data in Supabase

1. **Go to Table Editor** in your Supabase dashboard
2. **Check these tables:**
   - `users` - Should have your user record
   - `quarters` - Should have your quarters
   - `plan_items` - Should have your plan items
   - `team_members` - Should have your team members
   - `holidays` - Should have your holidays
   - `settings` - Should have your settings

## 🔄 Step 8: Migrate Existing Data

If you have existing data in localStorage:

1. **The app will automatically detect** localStorage data
2. **Click "Migrate to Database"** when prompted
3. **Wait for migration** to complete
4. **Verify** all data was migrated correctly

## 🚨 Troubleshooting

### Common Issues:

**"Failed to connect to Supabase"**
- Check your environment variables
- Verify your Supabase URL and key
- Make sure your project is active

**"User not found"**
- Check if the user was created in the `users` table
- Try disconnecting and reconnecting

**"Permission denied"**
- Check your Row Level Security policies
- Verify the user is authenticated

**"Schema not found"**
- Make sure you ran the SQL schema
- Check for any SQL errors in the Supabase logs

### Getting Help:

1. **Check Supabase logs** in the dashboard
2. **Check browser console** for errors
3. **Verify environment variables** are loaded
4. **Test with a simple query** in the SQL editor

## 🎉 You're Done!

Once set up, your Quarterback data will:
- ✅ **Sync across all devices** and browsers
- ✅ **Backup automatically** in the cloud
- ✅ **Work offline** with local caching
- ✅ **Scale** as your team grows
- ✅ **Stay secure** with Row Level Security

## 🔧 Advanced Configuration

### Custom Domain (Optional):
1. **Go to Settings → Custom Domains**
2. **Add your domain** (e.g., `quarterback.yourcompany.com`)
3. **Configure DNS** as instructed
4. **Update your environment variables**

### Team Collaboration:
1. **Invite team members** to your Supabase project
2. **Set up proper RLS policies** for team access
3. **Configure authentication** for team members

### Monitoring:
1. **Set up alerts** in Supabase dashboard
2. **Monitor usage** and performance
3. **Set up backups** (automatic with Supabase)

---

**Need help?** Check the [Supabase Documentation](https://supabase.com/docs) or create an issue in the project repository.

