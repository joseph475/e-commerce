# Deploy Frontend as Web Service - Step by Step Guide

Since the static site deployment is having routing issues, let's redeploy your frontend as a Web Service. Your project already has the necessary `server.js` file to handle this.

## Step 1: Delete Current Static Site (Optional)

1. Go to your Render dashboard
2. Find your current static site deployment
3. Go to Settings → Delete Service (optional - you can keep it and just create a new one)

## Step 2: Create New Web Service for Frontend

1. **Go to Render Dashboard**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository** (same repo as before)

## Step 3: Configure the Web Service

### Basic Settings:
- **Name**: `pos-frontend-web` (or any name you prefer)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `packages/frontend`

### Build & Deploy Settings:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

## Step 4: Configure Environment Variables

Add these environment variables in the Render dashboard:

```
NODE_ENV=production
PORT=10000
REACT_APP_API_URL=https://your-backend-service.onrender.com
REACT_APP_WS_URL=wss://your-backend-service.onrender.com
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_CURRENCY_SYMBOL=₱
REACT_APP_CURRENCY_CODE=PHP
REACT_APP_ENABLE_DEBUG=false
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_THEME=light
```

**Replace the URLs with your actual values:**
- `your-backend-service.onrender.com` → Your actual backend URL
- `your_supabase_project_url` → Your Supabase project URL
- `your_supabase_anon_key` → Your Supabase anon key

## Step 5: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (this will take a few minutes)
3. **Note your new frontend URL** (e.g., `https://pos-frontend-web-xyz.onrender.com`)

## Step 6: Update Backend CORS

1. **Go to your backend service** in Render dashboard
2. **Update environment variables:**
   - Change `FRONTEND_URL` to your new frontend Web Service URL
3. **Trigger redeploy** of backend service

## Step 7: Test

1. **Visit your new frontend URL**
2. **Navigate to different pages** (like `/pos`)
3. **Refresh the page** - it should work without 404 errors
4. **Test the full application** to ensure everything works

## Why This Works

Your `packages/frontend/server.js` file already has the correct configuration:

```javascript
// Handle React Router (return `index.html` for all non-API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

This catch-all route (`*`) ensures that any route (like `/pos`) serves the `index.html` file, allowing your client-side router to handle the routing properly.

## Cost Consideration

- **Web Service**: $7/month minimum (no free tier for web services)
- **Static Site**: Free tier available

If cost is a concern, we can troubleshoot the static site deployment further, but Web Service deployment is more reliable for SPAs.

## Next Steps After Deployment

1. Update any bookmarks or links to use the new URL
2. Test all functionality (login, POS, inventory, etc.)
3. Monitor the service for any issues
4. Consider setting up a custom domain if needed

---

Follow these steps and your routing issues should be resolved!
