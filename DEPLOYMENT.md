# SpiceCraft Deployment Fixes

## Issues Identified

1. **Image Loading Problem**: Images are not loading because static assets are not being served correctly
2. **Authentication "Unexpected Token" Error**: Authentication tokens are not being properly handled between client and server

## Fixes Applied

### 1. Fixed Static Asset Serving

Updated `server/index.ts` to properly serve static assets from the client assets directory:

```javascript
// Serve static assets from client/src/assets
app.use('/src/assets', express.static(path.join(__dirname, '../client/src/assets')));
```

### 2. Fixed Database Schema Mismatch

Updated `database-setup.sql` and `seed-products.ts` to use `image` field instead of `image_url` to match the Drizzle schema.

### 3. Fixed Authentication Token Handling

Updated `client/src/lib/queryClient.ts` to properly include Authorization headers in all API requests:

- Added `getAuthToken()` function to retrieve token from localStorage
- Modified `apiRequest()` to include Authorization header when token exists
- Modified `getQueryFn()` to include Authorization header when token exists

### 4. Updated Environment Variables

Updated `.env` file with proper secret values:
```
SESSION_SECRET=spicera-session-secret-2023
JWT_SECRET=spicera-jwt-secret-2023
```

## Deployment Instructions

1. **Set up PostgreSQL database** (using Neon.tech or similar)
2. **Configure environment variables in Vercel**:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `SESSION_SECRET` - A random secure string
   - `JWT_SECRET` - A random secure string
   - `VITE_STACK_PROJECT_ID` - Stack Auth project ID for client-side
   - `VITE_STACK_PUBLISHABLE_CLIENT_KEY` - Stack Auth publishable client key
   - `STACK_SECRET_SERVER_KEY` - Stack Auth secret server key
   - `NEON_API_KEY` - Neon database API key
   - `NEON_PROJECT_ID` - Neon project identifier

3. **Run database setup**:
   ```bash
   node setup-database.js
   ```

4. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy

## Troubleshooting

If you still encounter issues:

1. **Check browser console** for specific error messages
2. **Verify environment variables** are correctly set in Vercel
3. **Check database connection** using the database setup script
4. **Verify static assets** are accessible by visiting `/src/assets/images/spices/biryani-masala.jpg` directly

## Testing Authentication

1. Register a new user account
2. Log in with the account
3. Check if auth token is stored in localStorage
4. Verify protected routes work correctly

## Testing Image Loading

1. Visit the store page
2. Check if product images are loading
3. Verify image paths in browser dev tools