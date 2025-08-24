# SpiceCraft - Fixed Deployment Instructions

## Issues Fixed

1. **Image Loading Problem**: Images were not loading because static assets weren't being served correctly
2. **Authentication "Unexpected Token" Error**: Authentication tokens weren't being properly handled between client and server

## Summary of Fixes Applied

### 1. Static Asset Serving Fix
- Updated `server/index.ts` to serve static assets from `/src/assets` directory
- Added: `app.use('/src/assets', express.static(path.join(__dirname, '../client/src/assets')));`

### 2. Database Schema Consistency
- Fixed database schema to use `image` field instead of `image_url`
- Updated `database-setup.sql` and `seed-products.ts` to match schema

### 3. Authentication Token Handling
- Updated `client/src/lib/queryClient.ts` to properly include Authorization headers
- All API requests now include Bearer tokens when available

### 4. Environment Variables
- Updated `.env` with proper secret values for production use

## Deployment to Vercel

### Prerequisites
1. Vercel account (vercel.com)
2. PostgreSQL database (Neon.tech recommended)

### Steps

1. **Set up PostgreSQL Database**
   - Go to neon.tech and create a free PostgreSQL database
   - Copy the connection string

2. **Configure Vercel Environment Variables**
   In your Vercel project dashboard, add these environment variables:
   ```
   DATABASE_URL=your_neon_database_connection_string
   SESSION_SECRET=spicera-session-secret-2023
   JWT_SECRET=spicera-jwt-secret-2023
   ```

3. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Use these build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm ci`

4. **Set up Database Tables**
   After deployment, run the database setup:
   ```bash
   node setup-database.js
   ```

5. **Create Admin User** (Optional)
   ```bash
   node create-admin.cjs
   ```

## Testing Your Deployment

1. **Verify Images Load**
   - Visit your deployed site
   - Check that product images appear in the store

2. **Test Authentication**
   - Register a new account
   - Log in and verify you can access protected pages
   - Check that auth token is stored in localStorage

3. **Test Admin Features**
   - Log in as admin
   - Access `/admin` dashboard
   - Verify all admin functionality works

## Troubleshooting

If you encounter issues:

1. **Check Vercel Logs**
   - Use Vercel dashboard to view deployment logs
   - Check runtime logs for errors

2. **Verify Environment Variables**
   - Ensure all required env vars are set in Vercel
   - Check that DATABASE_URL is correct

3. **Check Database Connection**
   - Run `node setup-database.js` locally to test connection
   - Verify tables are created correctly

4. **Check Static Assets**
   - Visit `/src/assets/images/spices/biryani-masala.jpg` directly
   - Verify images are accessible

## Additional Notes

- The application should now work correctly with proper image loading
- Authentication should work without "unexpected token" errors
- All existing functionality should remain intact
- The fixes are backward compatible with existing data