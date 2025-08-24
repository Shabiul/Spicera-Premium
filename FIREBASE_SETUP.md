# Firebase Google Authentication Setup Guide

This guide will help you set up Firebase Google Authentication for the SpiceCraft application.

## Prerequisites

- A Google account
- Access to the [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "spicecraft-auth")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project dashboard, click on "Authentication" in the left sidebar
2. Click on the "Get started" button
3. Go to the "Sign-in method" tab
4. Click on "Google" from the list of providers
5. Toggle the "Enable" switch
6. Enter your project support email
7. Click "Save"

## Step 3: Add Web App to Firebase Project

1. In your Firebase project dashboard, click on the "Project settings" gear icon
2. Scroll down to "Your apps" section
3. Click on the web icon (`</>`)
4. Enter your app nickname (e.g., "SpiceCraft Web")
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 4: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the Firebase configuration values with your actual project values:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
```

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to Authentication > Settings > Authorized domains
2. Add your development domain (e.g., `localhost`)
3. Add your production domain when deploying

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the login or register page
3. Click "Continue with Google" or "Sign in with Google"
4. You should see the Google sign-in popup
5. After successful authentication, you should be redirected to the home page

## Features Included

✅ **Google Sign-In Button**: Custom styled button with Google branding  
✅ **Authentication Context**: React context for managing auth state  
✅ **Auto Sign-In**: Automatic authentication state persistence  
✅ **Error Handling**: Proper error messages and loading states  
✅ **Responsive Design**: Works on desktop and mobile devices  
✅ **Integration**: Seamlessly integrated with existing login/register pages  

## Security Notes

- Never commit your actual Firebase configuration to version control
- Use environment variables for all sensitive configuration
- Configure proper authorized domains in production
- Consider implementing additional security rules as needed

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console

2. **"Firebase: Error (auth/api-key-not-valid)"**
   - Check that your API key is correct in the .env file

3. **"Firebase: Error (auth/project-not-found)"**
   - Verify your project ID is correct

4. **Google Sign-In popup blocked**
   - Ensure popups are allowed in your browser
   - Try disabling popup blockers

For more detailed Firebase documentation, visit: https://firebase.google.com/docs/auth/web/google-signin