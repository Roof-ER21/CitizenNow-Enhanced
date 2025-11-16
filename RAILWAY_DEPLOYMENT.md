# Railway Deployment Guide - CitizenNow Enhanced

Complete guide for deploying the CitizenNow Enhanced Expo web application to Railway.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Overview](#project-overview)
- [Quick Start Deployment](#quick-start-deployment)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Environment Variables Configuration](#environment-variables-configuration)
- [Custom Domain Setup](#custom-domain-setup)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)
- [Cost Optimization](#cost-optimization)
- [CI/CD and Auto-Deployment](#cicd-and-auto-deployment)

---

## Prerequisites

### Required Accounts
1. **Railway Account** - Sign up at https://railway.app
   - Free tier: $5 credit/month
   - Pro tier: $20/month for production apps

2. **Firebase Project** - https://console.firebase.google.com
   - Enable Authentication
   - Enable Firestore Database
   - Get web app configuration

3. **API Keys**
   - **OpenAI API Key** - https://platform.openai.com/api-keys
   - **Google Gemini API Key** - https://makersuite.google.com/app/apikey
   - **ElevenLabs API Key** (Optional) - https://elevenlabs.io

### Required Tools
```bash
# Node.js 20 or higher
node --version  # Should be v20.x or higher

# Git
git --version

# Railway CLI (optional but recommended)
npm install -g @railway/cli
railway --version
```

---

## Project Overview

### Technology Stack
- **Framework**: Expo SDK 54 with web support
- **UI**: React 19.1.0 + React Native Web
- **Backend**: Firebase (Auth + Firestore)
- **AI Services**: OpenAI GPT, Google Gemini
- **Build System**: Expo Web Export
- **Deployment**: Railway with Nixpacks

### Build Process
1. **Install**: `npm ci` - Clean install dependencies
2. **Build**: `expo export --platform web` - Generate static web bundle
3. **Output**: `dist/` directory containing static files
4. **Serve**: `npx serve dist -s -p $PORT` - Static file server

### Architecture
- **Type**: Static web application (SPA)
- **Entry Point**: `index.ts`
- **Build Output**: `dist/` directory
- **Server**: Serve (static file server)
- **Port**: Dynamically assigned by Railway (`$PORT`)

---

## Quick Start Deployment

### Method 1: Railway Dashboard (Recommended for First Deployment)

1. **Login to Railway**
   - Go to https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select the `CitizenNow-Enhanced` repository

3. **Configure Environment Variables**
   - Railway will detect the project automatically
   - Go to "Variables" tab
   - Add all variables from `.env.railway.example` (see section below)

4. **Deploy**
   - Railway auto-detects Nixpacks configuration
   - Click "Deploy" or push to your main branch
   - Build takes ~5-7 minutes

5. **Access Your App**
   - Railway provides a URL: `https://your-app.up.railway.app`
   - Test all features

### Method 2: Railway CLI (Recommended for Experienced Users)

```bash
# 1. Navigate to project directory
cd /Users/a21/CitizenNow-Enhanced

# 2. Login to Railway
railway login

# 3. Initialize Railway project (first time only)
railway init

# 4. Link to existing project (if already created)
railway link

# 5. Set environment variables (all at once)
railway variables set EXPO_PUBLIC_FIREBASE_API_KEY="your_key_here"
railway variables set EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
railway variables set EXPO_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
railway variables set EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
railway variables set EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
railway variables set EXPO_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abcdef"
railway variables set EXPO_PUBLIC_OPENAI_API_KEY="sk-your-key"
railway variables set EXPO_PUBLIC_GEMINI_API_KEY="your-key"
railway variables set EXPO_PUBLIC_ENV="production"

# 6. Deploy
railway up

# 7. Open in browser
railway open
```

---

## Detailed Setup Instructions

### Step 1: Prepare Firebase Configuration

1. **Go to Firebase Console**
   ```
   https://console.firebase.google.com
   ```

2. **Select Your Project** or create a new one

3. **Get Web App Config**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click "Web app" or add one if not exists
   - Copy the configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

4. **Enable Required Services**
   - **Authentication**: Enable Email/Password provider
   - **Firestore**: Create database in production mode
   - **Storage**: Enable if using file uploads

### Step 2: Get API Keys

#### OpenAI API Key
```bash
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "CitizenNow Production"
4. Copy the key (starts with sk-)
5. Store securely - you can't view it again
```

#### Google Gemini API Key
```bash
1. Go to https://makersuite.google.com/app/apikey
2. Click "Get API key"
3. Create in new or existing Google Cloud project
4. Copy the API key
5. Store securely
```

#### ElevenLabs API Key (Optional)
```bash
1. Go to https://elevenlabs.io
2. Sign up or login
3. Go to Settings > API Keys
4. Create new key
5. Copy and store
```

### Step 3: Configure Railway Project

#### Create Railway Project

**Option A: Via Dashboard**
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Authorize Railway to access your GitHub
4. Select `CitizenNow-Enhanced` repository
5. Railway automatically detects configuration

**Option B: Via CLI**
```bash
cd /Users/a21/CitizenNow-Enhanced
railway login
railway init
# Follow prompts to create project
```

#### Verify Configuration Files
Railway uses these files for deployment:

1. **`railway.json`** - Deployment configuration
2. **`nixpacks.toml`** - Build system configuration
3. **`package.json`** - Scripts: `build:web`, `railway:start`
4. **`.railwayignore`** - Files to exclude from build

---

## Environment Variables Configuration

### Required Variables

Add these in Railway Dashboard > Variables tab:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# AI Services
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-openai-key-here
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key-here

# Environment
EXPO_PUBLIC_ENV=production
```

### Optional Variables

```bash
# ElevenLabs TTS (optional)
EXPO_PUBLIC_ELEVENLABS_API_KEY=your-elevenlabs-key

# Build optimizations
NODE_ENV=production
NPM_CONFIG_PRODUCTION=false
EXPO_NO_TELEMETRY=1
```

### Adding Variables via CLI

```bash
# Single variable
railway variables set EXPO_PUBLIC_FIREBASE_API_KEY="your_key"

# From file (create .env.production locally - DON'T COMMIT)
railway variables set $(cat .env.production)

# View all variables
railway variables

# Delete a variable
railway variables delete VARIABLE_NAME
```

### Security Best Practices

1. **Never commit API keys to git**
   ```bash
   # .gitignore should include:
   .env
   .env.local
   .env.production
   .env.staging
   ```

2. **Use separate API keys for development/production**
   - Development: Local `.env` file
   - Production: Railway environment variables

3. **Rotate keys regularly**
   - OpenAI: Every 90 days
   - Firebase: Monitor usage, rotate if compromised

4. **Restrict API key permissions**
   - Firebase: Set up Security Rules
   - OpenAI: Set usage limits
   - Gemini: Enable API restrictions

---

## Custom Domain Setup

### Add Custom Domain

**Via Railway Dashboard:**
1. Go to your project in Railway
2. Click "Settings" tab
3. Scroll to "Domains" section
4. Click "Generate Domain" for free Railway subdomain
   - Format: `your-app.up.railway.app`
5. Or click "Custom Domain" to add your own

**Via CLI:**
```bash
# Generate Railway subdomain
railway domain

# Add custom domain
railway domain add yourdomain.com
```

### Configure DNS (Custom Domain)

If using your own domain (e.g., `app.citizennow.com`):

1. **Get Railway DNS Target**
   - Railway provides target after adding custom domain
   - Example: `your-app.up.railway.app`

2. **Add DNS Records** (in your domain registrar)

   **Option A: CNAME Record (Recommended for subdomains)**
   ```
   Type: CNAME
   Name: app (or your subdomain)
   Value: your-app.up.railway.app
   TTL: 3600
   ```

   **Option B: A Record (For root domains)**
   ```
   Type: A
   Name: @ (root domain)
   Value: [Railway IP - provided in dashboard]
   TTL: 3600
   ```

3. **Enable SSL/TLS**
   - Railway automatically provisions SSL certificates
   - Wait 5-10 minutes for DNS propagation
   - Certificate auto-renews

4. **Verify Domain**
   ```bash
   # Check DNS propagation
   nslookup app.citizennow.com

   # Test HTTPS
   curl -I https://app.citizennow.com
   ```

### Domain Providers Configuration

**Cloudflare:**
```
1. Add site to Cloudflare
2. Set DNS record (CNAME or A)
3. Disable Cloudflare proxy (gray cloud) initially
4. After SSL works, can enable proxy (orange cloud)
```

**Namecheap/GoDaddy:**
```
1. Go to DNS management
2. Add CNAME record
3. Point to Railway domain
4. Save and wait for propagation (up to 24 hours)
```

---

## Monitoring and Logs

### View Deployment Logs

**Dashboard:**
1. Go to Railway project
2. Click "Deployments" tab
3. Select active deployment
4. View build and runtime logs in real-time

**CLI:**
```bash
# Stream logs
railway logs

# View recent logs
railway logs --recent

# Follow logs (tail)
railway logs -f
```

### Health Checks

Railway automatically monitors your app:

**Health Check Configuration** (in `railway.json`):
```json
{
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 300
  }
}
```

**Manual Health Check:**
```bash
# Check app status
curl https://your-app.up.railway.app

# Check with headers
curl -I https://your-app.up.railway.app
```

### Performance Monitoring

**Railway Metrics:**
- CPU usage
- Memory usage
- Network traffic
- Request count

**Access Metrics:**
1. Railway Dashboard > Your Project
2. Click "Metrics" tab
3. View real-time graphs

**External Monitoring** (Recommended):
- **Uptime Robot**: Free uptime monitoring
- **Better Uptime**: Advanced monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Build Fails with "expo: command not found"

**Cause**: Expo CLI not installed or wrong Node version

**Solution**:
```bash
# Update package.json to include expo in dependencies
# Or update nixpacks.toml:
[phases.install]
cmds = [
  'npm ci --legacy-peer-deps',
  'npm install -g expo-cli'
]
```

#### 2. App Builds but Shows Blank Page

**Cause**: Environment variables not set or Firebase misconfigured

**Solutions**:
```bash
# Check if variables are set
railway variables

# Verify Firebase config in Railway matches your Firebase project
# Check browser console for errors:
# - Open app in browser
# - Press F12
# - Look for errors in Console tab

# Common errors:
# - "Firebase App not initialized" = Missing Firebase env vars
# - "Invalid API key" = Wrong Firebase API key
# - Network errors = CORS or API key restrictions
```

#### 3. Port Binding Error

**Cause**: App not using Railway's `$PORT` variable

**Solution**:
Ensure `package.json` has:
```json
"scripts": {
  "railway:start": "npx serve dist -s -p $PORT"
}
```

#### 4. Out of Memory During Build

**Cause**: Large dependencies or build process

**Solutions**:
```bash
# 1. Upgrade Railway plan (gives more memory)
# 2. Optimize build in nixpacks.toml:
[variables]
NODE_OPTIONS = "--max-old-space-size=4096"

# 3. Clear cache and rebuild
railway up --detach
```

#### 5. Deployment Succeeds but Features Don't Work

**Cause**: Missing or incorrect API keys

**Debug Steps**:
```bash
# 1. Check browser console for API errors
# 2. Verify all API keys in Railway dashboard
# 3. Test API keys locally first:

# Test OpenAI:
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $EXPO_PUBLIC_OPENAI_API_KEY"

# Test Gemini:
curl "https://generativelanguage.googleapis.com/v1/models?key=$EXPO_PUBLIC_GEMINI_API_KEY"

# 4. Check Firebase Console > Usage for errors
```

#### 6. Static Assets Not Loading

**Cause**: Incorrect asset paths after build

**Solution**:
```bash
# Check expo web configuration in app.config.js or app.json
# Ensure assets are in public/ or assets/ directory
# Verify build output includes all assets:

# Rebuild and check dist/:
npm run build:web
ls -la dist/assets/
```

#### 7. Slow Build Times

**Optimize**:
```bash
# 1. Use npm ci instead of npm install (already configured)
# 2. Add .railwayignore to exclude unnecessary files
# 3. Cache dependencies in nixpacks.toml:
[phases.install]
cacheDirectories = ['node_modules']
```

### Debugging Checklist

When deployment fails, check these in order:

1. **Build Logs** - Look for error messages
   ```bash
   railway logs | grep -i error
   ```

2. **Environment Variables** - Verify all required vars are set
   ```bash
   railway variables | grep EXPO_PUBLIC
   ```

3. **Railway Configuration** - Check `railway.json` and `nixpacks.toml`
   ```bash
   cat railway.json
   cat nixpacks.toml
   ```

4. **Package Scripts** - Ensure correct scripts in `package.json`
   ```bash
   cat package.json | grep -A 5 scripts
   ```

5. **Node Version** - Confirm using Node 20
   ```toml
   # In nixpacks.toml
   nixPkgs = ['nodejs_20']
   ```

6. **Dependencies** - Check for version conflicts
   ```bash
   npm ls
   ```

### Getting Help

**Railway Support:**
- Discord: https://discord.gg/railway
- Help Docs: https://docs.railway.app
- GitHub Issues: https://github.com/railwayapp/railway

**Expo Support:**
- Forums: https://forums.expo.dev
- Discord: https://discord.gg/expo
- Docs: https://docs.expo.dev

---

## Cost Optimization

### Railway Pricing

**Free Tier:**
- $5 usage credit/month
- Good for testing and small projects
- Sleeps after inactivity

**Pro Tier ($20/month):**
- $20 included usage credit
- Pay-as-you-go after credit
- No sleeping
- Priority support

### Estimated Costs

**Small App (100-1000 users/month):**
- Free tier: $0 (within $5 credit)
- Pro tier: $20/month (base)

**Medium App (1000-10000 users/month):**
- Estimated: $20-50/month
- Depends on traffic and compute time

**Cost Breakdown:**
```
CPU: ~$0.000463/minute
Memory: ~$0.000231/GB/minute
Network: Free (egress included)
```

### Optimization Tips

1. **Use Static Hosting for Web Apps**
   - Current setup (Serve) is optimal for Expo web
   - Minimal compute usage

2. **Enable Auto-Sleep** (Free Tier)
   ```bash
   # In Railway Dashboard > Settings
   # Enable "Sleep after 1 hour of inactivity"
   ```

3. **Optimize Build Process**
   - Use `npm ci` instead of `npm install`
   - Cache node_modules
   - Minimize build steps

4. **Monitor Usage**
   ```bash
   # Check current usage
   railway status

   # View metrics in dashboard
   # Track CPU/memory over time
   ```

5. **Consider Alternatives for Static Sites**
   - **Vercel**: Free tier for static sites
   - **Netlify**: Free tier with good limits
   - **GitHub Pages**: Free but no environment variables

   **Recommendation**: Railway is best if you need environment variables and good DX

---

## CI/CD and Auto-Deployment

### GitHub Integration (Automatic Deployments)

**Setup Auto-Deploy:**
1. Railway Dashboard > Settings
2. Scroll to "Deployments"
3. Enable "Automatic Deployments"
4. Select branch (usually `main`)
5. Save

**How It Works:**
```
1. Push to GitHub main branch
   ↓
2. Railway detects commit
   ↓
3. Triggers new build
   ↓
4. Runs build process
   ↓
5. Deploys if successful
   ↓
6. Updates live URL
```

**Workflow Example:**
```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin main

# Railway automatically:
# - Detects push
# - Builds app
# - Deploys to production
# - Updates URL
```

### Deploy Previews (PR Deployments)

**Enable PR Deployments:**
1. Railway Dashboard > Settings
2. Enable "PR Deploys"
3. Each PR gets temporary preview URL
4. Auto-deleted when PR is merged/closed

**Benefits:**
- Test changes before merging
- Share preview with team
- Isolated environment per PR

### Manual Deployment

**Via Dashboard:**
1. Go to Railway project
2. Click "Deploy" button
3. Select branch/commit
4. Confirm deployment

**Via CLI:**
```bash
# Deploy current code
railway up

# Deploy specific branch
railway up --branch feature-branch

# Deploy and watch logs
railway up && railway logs -f
```

### Rollback Deployment

**Via Dashboard:**
1. Go to "Deployments" tab
2. Find previous successful deployment
3. Click "..." menu
4. Select "Redeploy"

**Via CLI:**
```bash
# List deployments
railway deployments

# Rollback to specific deployment
railway deployments rollback <deployment-id>
```

### Environment-Specific Deployments

**Setup Staging Environment:**
```bash
# Create new Railway service
railway service create citizennow-staging

# Link to staging branch
railway link --service citizennow-staging

# Set staging environment variables
railway variables set EXPO_PUBLIC_ENV="staging"

# Deploy
railway up --service citizennow-staging
```

**Multi-Environment Strategy:**
```
├── main branch → Production (citizennow-prod)
├── staging branch → Staging (citizennow-staging)
└── develop branch → Development (local only)
```

---

## Post-Deployment Checklist

### Immediately After Deployment

- [ ] App loads successfully at Railway URL
- [ ] Firebase authentication works (test login/signup)
- [ ] Firestore data reads/writes correctly
- [ ] AI features respond (OpenAI, Gemini)
- [ ] All navigation routes work
- [ ] Static assets (images, icons) load
- [ ] No console errors in browser

### Performance Testing

- [ ] Page load time < 3 seconds
- [ ] API responses < 1 second
- [ ] No memory leaks (check Railway metrics)
- [ ] Mobile responsiveness works
- [ ] Works in all major browsers

### Security Verification

- [ ] HTTPS enabled (green lock icon)
- [ ] Firebase Security Rules configured
- [ ] API keys not exposed in client code
- [ ] CORS configured correctly
- [ ] CSP headers set (if needed)

### Monitoring Setup

- [ ] Railway health checks passing
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up usage alerts in Railway
- [ ] Monitor API key usage (OpenAI, Gemini)

### Documentation

- [ ] Update README with live URL
- [ ] Document environment variables
- [ ] Create runbook for common issues
- [ ] Share access with team members
- [ ] Set up status page (optional)

---

## Additional Resources

### Official Documentation
- **Railway**: https://docs.railway.app
- **Expo**: https://docs.expo.dev
- **Firebase**: https://firebase.google.com/docs
- **React Native Web**: https://necolas.github.io/react-native-web/

### Community Resources
- **Railway Discord**: https://discord.gg/railway
- **Expo Forums**: https://forums.expo.dev
- **Stack Overflow**: Tag `railway` or `expo`

### Useful Tools
- **Railway CLI**: https://docs.railway.app/develop/cli
- **Expo CLI**: https://docs.expo.dev/more/expo-cli/
- **Firebase CLI**: https://firebase.google.com/docs/cli

---

## Support

### Need Help?

**Railway Issues:**
- Check Railway status: https://status.railway.app
- Discord support: https://discord.gg/railway
- Email: team@railway.app

**App Issues:**
- Check browser console for errors
- Review Railway deployment logs
- Verify environment variables
- Test API keys independently

**For Urgent Production Issues:**
1. Check Railway status page
2. Review recent deployments
3. Rollback if necessary
4. Contact Railway support if platform issue

---

## Summary

You've successfully deployed CitizenNow Enhanced to Railway!

**Key Takeaways:**
- Railway uses Nixpacks for automatic builds
- Environment variables are set in Railway dashboard
- Automatic deployments trigger on git push
- Static web app served via `serve` package
- Free tier includes $5/month credit
- SSL/HTTPS enabled automatically

**Next Steps:**
1. Set up custom domain (optional)
2. Configure monitoring
3. Enable auto-deployments from GitHub
4. Share Railway URL with users
5. Monitor usage and costs

**Quick Commands Reference:**
```bash
# View logs
railway logs

# Add variable
railway variables set KEY="value"

# Deploy
railway up

# Open app
railway open

# Check status
railway status
```

---

**Happy Deploying! 🚀**

*Last Updated: November 16, 2025*
