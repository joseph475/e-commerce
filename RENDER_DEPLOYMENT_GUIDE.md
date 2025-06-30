# Render Deployment Guide for POS Project

This guide will walk you through deploying your POS (Point of Sale) project on Render. Your project consists of a Node.js backend API and a Preact frontend application that need to be deployed as separate services.

## Project Overview

- **Backend**: Node.js/Express API with Supabase database and Cloudinary integration
- **Frontend**: Preact application with Webpack build system
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Cloudinary
- **Architecture**: Monorepo with separate backend and frontend packages

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be pushed to a GitHub repository
3. **Supabase Project**: Set up your Supabase database
4. **Cloudinary Account**: Set up your Cloudinary account for image storage

## Deployment Strategy

You'll need to deploy **two separate services** on Render:
1. **Web Service** for the backend API
2. **Static Site** for the frontend application

## Step 1: Prepare Your Repository

### 1.1 Create Build Scripts for Render

Add these scripts to your root `package.json` to help with Render deployment:

```json
{
  "scripts": {
    "render:backend": "cd packages/backend && npm install && npm start",
    "render:frontend": "cd packages/frontend && npm install && npm run build",
    "render:frontend:start": "cd packages/frontend && npm start"
  }
}
```

### 1.2 Create Render-specific Configuration Files

Create a `render.yaml` file in your project root for infrastructure as code (optional but recommended):

```yaml
services:
  - type: web
    name: pos-backend
    env: node
    plan: starter
    buildCommand: cd packages/backend && npm install
    startCommand: cd packages/backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        sync: false
    
  - type: web
    name: pos-frontend
    env: static
    buildCommand: cd packages/frontend && npm install && npm run build
    staticPublishPath: packages/frontend/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

## Step 2: Deploy the Backend API

### 2.1 Create a New Web Service

1. Log into your Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `pos-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `packages/backend`

**Build & Deploy Settings:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.2 Configure Environment Variables

Add these environment variables in the Render dashboard:

**Required Variables:**
```
NODE_ENV=production
PORT=10000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRE=30d
FRONTEND_URL=https://your-frontend-app.onrender.com
```

**Cloudinary Variables:**
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Optional Backend-specific Variables:**
```
DB_POOL_SIZE=10
DB_TIMEOUT=30000
LOG_LEVEL=info
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.3 Deploy the Backend

1. Click "Create Web Service"
2. Wait for the deployment to complete
3. Note your backend URL (e.g., `https://pos-backend-xyz.onrender.com`)

## Step 3: Deploy the Frontend

### 3.1 Create a Static Site

1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure the site:

**Basic Settings:**
- **Name**: `pos-frontend` (or your preferred name)
- **Branch**: `main`
- **Root Directory**: `packages/frontend`

**Build Settings:**
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 3.2 Configure Frontend Environment Variables

Add these environment variables for the frontend build:

```
NODE_ENV=production
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

### 3.3 Configure Redirects for SPA

Since this is a Single Page Application, you need to configure redirects. Create a `_redirects` file in your `packages/frontend/src` directory:

```
/*    /index.html   200
```

Update your `webpack.config.js` to copy this file:

```javascript
// Add to your CopyWebpackPlugin patterns
new CopyWebpackPlugin({
  patterns: [
    // ... existing patterns
    { from: 'src/_redirects', to: '_redirects' }
  ]
})
```

### 3.4 Deploy the Frontend

1. Click "Create Static Site"
2. Wait for the build and deployment to complete
3. Note your frontend URL (e.g., `https://pos-frontend-xyz.onrender.com`)

## Step 4: Update CORS Configuration

After both services are deployed, update your backend's CORS configuration:

1. Go to your backend service in Render
2. Update the `FRONTEND_URL` environment variable with your actual frontend URL
3. Trigger a redeploy of the backend service

## Step 5: Database Setup

### 5.1 Run Database Migrations

You'll need to set up your Supabase database schema. You can do this by:

1. Using the Supabase dashboard SQL editor
2. Running your schema files from `packages/backend/database/`

Execute these files in order:
- `schema.sql` or `schema_fixed.sql`
- `schema_inventory.sql`
- `schema_qr_payments.sql`

### 5.2 Set up Demo Data (Optional)

If you want to populate your database with demo data, you can run your setup script:

1. Use the Supabase dashboard
2. Or create a one-time job in Render to run `packages/backend/scripts/setup-demo-users.js`

## Step 6: Custom Domain (Optional)

### 6.1 Backend Custom Domain

1. In your backend service settings, go to "Custom Domains"
2. Add your API domain (e.g., `api.yourdomain.com`)
3. Configure DNS records as instructed

### 6.2 Frontend Custom Domain

1. In your frontend static site settings, go to "Custom Domains"
2. Add your main domain (e.g., `yourdomain.com`)
3. Configure DNS records as instructed

## Step 7: Environment-Specific Configurations

### 7.1 Production Optimizations

For your backend service, consider these production settings:

**Environment Variables:**
```
NODE_ENV=production
LOG_LEVEL=warn
DB_POOL_SIZE=20
RATE_LIMIT_MAX_REQUESTS=1000
```

### 7.2 Monitoring and Health Checks

Render automatically monitors your services, but you can enhance this:

1. Your backend already has a health check endpoint at `/api/test/health`
2. Configure custom health check paths in Render if needed
3. Set up notification preferences in your Render account

## Step 8: SSL and Security

Render automatically provides SSL certificates for all services. Additional security considerations:

1. **Environment Variables**: Never commit secrets to your repository
2. **JWT Secret**: Use a strong, randomly generated secret
3. **CORS**: Ensure your CORS configuration only allows your frontend domain
4. **Rate Limiting**: Your backend already includes rate limiting middleware

## Troubleshooting

### Common Issues

**Build Failures:**
- Check that all dependencies are listed in `package.json`
- Verify Node.js version compatibility (your project requires Node 18+)
- Check build logs for specific error messages

**Environment Variables:**
- Ensure all required environment variables are set
- Check for typos in variable names
- Verify Supabase and Cloudinary credentials

**CORS Errors:**
- Verify `FRONTEND_URL` in backend matches your actual frontend URL
- Check that both HTTP and HTTPS protocols are handled correctly

**Database Connection:**
- Verify Supabase URL and keys are correct
- Check that your Supabase project is active
- Ensure database schema is properly set up

### Logs and Debugging

1. **Backend Logs**: Available in your web service dashboard
2. **Frontend Build Logs**: Available in your static site dashboard
3. **Real-time Logs**: Use Render's log streaming feature

## Deployment Checklist

- [ ] Backend service deployed and running
- [ ] Frontend static site deployed and accessible
- [ ] All environment variables configured
- [ ] Database schema applied
- [ ] CORS configuration updated
- [ ] Custom domains configured (if applicable)
- [ ] SSL certificates active
- [ ] Health checks passing
- [ ] Demo data loaded (if desired)

## Cost Considerations

**Render Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- 750 hours per month across all services
- Limited bandwidth and build minutes

**Paid Plans:**
- Consider upgrading to Starter ($7/month per service) for:
  - No spin-down
  - More resources
  - Priority support

## Maintenance

### Regular Updates

1. **Dependencies**: Regularly update npm packages
2. **Security**: Monitor for security vulnerabilities
3. **Monitoring**: Check service health and performance
4. **Backups**: Ensure Supabase backups are configured

### Scaling

As your application grows:
1. **Backend**: Upgrade to higher-tier plans for more resources
2. **Database**: Monitor Supabase usage and upgrade plan if needed
3. **CDN**: Consider adding a CDN for static assets
4. **Caching**: Implement Redis caching if needed

## Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Render Community**: [community.render.com](https://community.render.com)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)

---

This guide should get your POS application successfully deployed on Render. Remember to test all functionality after deployment and monitor your services for any issues.
