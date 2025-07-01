# Fix 502 Bad Gateway Error - Troubleshooting Guide

The 502 error means your web service isn't starting properly. Let's diagnose and fix this step by step.

## Step 1: Check Build Logs

1. **Go to your Render dashboard**
2. **Find your frontend web service**
3. **Click on "Logs" tab**
4. **Look for build errors** - scroll through the logs to find any error messages

Common issues to look for:
- `npm install` failures
- `npm run build` failures
- Missing dependencies
- Build timeout errors

## Step 2: Check Your Build Command

Make sure your build command is correct. It should be:
```
npm install && npm run build
```

**Alternative build commands to try:**
```
npm install && npm run build:render
```
or
```
npm install && webpack --mode production
```

## Step 3: Check Start Command

Your start command should be:
```
npm start
```

## Step 4: Verify Package.json Scripts

Your `packages/frontend/package.json` should have these scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm run clean && webpack --mode production",
    "build:render": "webpack --mode production"
  }
}
```

## Step 5: Check for Missing Dependencies

The most common issue is missing dependencies. Make sure these are in your `dependencies` (not devDependencies):

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "webpack": "^5.99.7",
    "webpack-cli": "^6.0.1",
    "rimraf": "^6.0.1"
  }
}
```

## Step 6: Try Alternative Deployment Settings

If the above doesn't work, try these settings:

### Option A: Use build:render script
- **Build Command**: `npm install && npm run build:render`
- **Start Command**: `npm start`

### Option B: Skip clean step
- **Build Command**: `npm install && webpack --mode production`
- **Start Command**: `npm start`

### Option C: Install with dev dependencies
- **Build Command**: `npm install --include=dev && npm run build`
- **Start Command**: `npm start`

## Step 7: Check Environment Variables

Make sure you have these environment variables set:
```
NODE_ENV=production
PORT=10000
```

## Step 8: Manual Deploy

1. **Go to your service dashboard**
2. **Click "Manual Deploy"**
3. **Select "Deploy Latest Commit"**
4. **Watch the logs carefully** for any error messages

## Step 9: Common Error Solutions

### If you see "rimraf not found":
- Use build command: `npm install && npm run build:render`

### If you see "webpack not found":
- Make sure webpack is in dependencies, not devDependencies

### If you see "Cannot find module":
- Check that all required packages are in dependencies

### If build succeeds but start fails:
- Check that `dist` folder was created during build
- Verify `server.js` exists in the root of packages/frontend

## Step 10: Last Resort - Simplified Approach

If nothing works, try this minimal approach:

1. **Build Command**: `npm install --production=false && npm run build:render`
2. **Start Command**: `node server.js`

## What to Look For in Logs

When checking logs, look for these patterns:

**Build Phase:**
- ✅ `npm install` completed successfully
- ✅ `webpack --mode production` completed successfully
- ✅ Files written to `dist/` directory

**Start Phase:**
- ✅ `🚀 Frontend server running on port 10000`
- ❌ Any error messages about missing files or modules

## Next Steps

1. **Check the logs first** - this will tell us exactly what's failing
2. **Try the alternative build commands** based on what you see in the logs
3. **Report back with the specific error message** from the logs so I can provide targeted help

The 502 error is fixable - we just need to identify the specific issue from the build/start logs.
