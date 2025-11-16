# Railway Deployment Summary - CitizenNow Enhanced

## Deployment Approach: Nixpacks (Recommended)

**Decision**: Using Nixpacks instead of custom Dockerfile

**Reasons**:
1. Railway's Nixpacks automatically detects Expo/Node.js projects
2. Less maintenance - Railway updates build environment
3. Optimized caching and build performance
4. Simpler configuration with `nixpacks.toml`
5. No Docker knowledge required

---

## Files Created

All configuration files have been created at `/Users/a21/CitizenNow-Enhanced/`:

### 1. railway.json
**Purpose**: Railway deployment configuration
**Location**: `/Users/a21/CitizenNow-Enhanced/railway.json`
**Key Settings**:
- Builder: NIXPACKS
- Build Command: `npm ci && npm run build:web`
- Start Command: `npx serve dist -s -p $PORT`
- Health check on `/` path
- Auto-restart on failure

### 2. nixpacks.toml
**Purpose**: Build system optimization
**Location**: `/Users/a21/CitizenNow-Enhanced/nixpacks.toml`
**Key Settings**:
- Node.js 20 + npm 9
- `npm ci --legacy-peer-deps` for installation
- `npm run build:web` for building
- Static file serving with Serve
- Production environment variables

### 3. .railwayignore
**Purpose**: Exclude files from Railway build
**Location**: `/Users/a21/CitizenNow-Enhanced/.railwayignore`
**Excludes**:
- Development files (.expo/, node_modules/)
- Local environment files (.env*)
- Documentation (*.md)
- Native build directories (ios/, android/)
- Test files and IDE config

### 4. .env.railway.example
**Purpose**: Template for environment variables
**Location**: `/Users/a21/CitizenNow-Enhanced/.env.railway.example`
**Required Variables**:
- Firebase configuration (6 variables)
- OpenAI API key
- Gemini API key
- Environment identifier
- Optional: ElevenLabs API key

### 5. RAILWAY_DEPLOYMENT.md
**Purpose**: Complete deployment guide
**Location**: `/Users/a21/CitizenNow-Enhanced/RAILWAY_DEPLOYMENT.md`
**Contents** (21KB):
- Prerequisites and setup
- Quick start and detailed instructions
- Environment variables configuration
- Custom domain setup
- Monitoring and logging
- Comprehensive troubleshooting
- Cost optimization
- CI/CD setup

### 6. RAILWAY_QUICK_START.md
**Purpose**: Fast deployment reference
**Location**: `/Users/a21/CitizenNow-Enhanced/RAILWAY_QUICK_START.md`
**Contents** (5KB):
- 5-minute deployment steps
- Quick command reference
- Common issues and fixes
- CLI deployment alternative

### 7. DEPLOYMENT_CHECKLIST.txt
**Purpose**: Step-by-step deployment checklist
**Location**: `/Users/a21/CitizenNow-Enhanced/DEPLOYMENT_CHECKLIST.txt`
**Sections**:
- Pre-deployment checklist
- Deployment steps
- Post-deployment verification
- Optional configuration
- Troubleshooting

### 8. Updated package.json
**Purpose**: Railway-compatible scripts
**Location**: `/Users/a21/CitizenNow-Enhanced/package.json`
**New Scripts**:
- `build:web`: Expo web export
- `serve`: Local testing with serve
- `railway:build`: Build command for Railway
- `railway:start`: Start command for Railway

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub Repository                     │
│                  CitizenNow-Enhanced (main)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    Push/Commit
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Railway Platform                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Build Phase (Nixpacks)                      │  │
│  │                                                       │  │
│  │  1. Detect Node.js 20 + npm 9                       │  │
│  │  2. npm ci --legacy-peer-deps                        │  │
│  │  3. npm run build:web                                │  │
│  │     → expo export --platform web                     │  │
│  │     → Generates dist/ folder                         │  │
│  │  4. Install serve package                            │  │
│  │                                                       │  │
│  │  Build Time: ~5-7 minutes                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Deploy Phase                                │  │
│  │                                                       │  │
│  │  1. Start: npx serve dist -s -p $PORT                │  │
│  │  2. Health check on / every 30s                      │  │
│  │  3. Auto-restart on failure (10 retries)             │  │
│  │  4. Assign Railway URL                               │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Live Application                           │
│          https://your-app.up.railway.app                     │
│                                                              │
│  • Static web app (React/Expo)                              │
│  • Firebase backend (Auth + Firestore)                      │
│  • AI integrations (OpenAI + Gemini)                        │
│  • HTTPS/SSL enabled                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables Required

### Critical (App Won't Work Without These)

```bash
# Firebase Configuration (from Firebase Console)
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# AI Services
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...
EXPO_PUBLIC_GEMINI_API_KEY=AIza...

# Environment
EXPO_PUBLIC_ENV=production
```

### Optional (App Works Without These)

```bash
# Text-to-Speech
EXPO_PUBLIC_ELEVENLABS_API_KEY=your-key

# Build Optimizations (Railway handles these)
NODE_ENV=production
NPM_CONFIG_PRODUCTION=false
EXPO_NO_TELEMETRY=1
```

---

## Quick Deployment Steps

### Option 1: Railway Dashboard (Recommended)

1. **Go to Railway**: https://railway.app/new
2. **Connect GitHub**: Select CitizenNow-Enhanced repo
3. **Add Variables**: Copy from `.env.railway.example`
4. **Deploy**: Railway auto-builds and deploys
5. **Wait**: ~5-7 minutes for first build
6. **Access**: Click Railway-generated URL

**Total Time**: ~10 minutes

### Option 2: Railway CLI

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd /Users/a21/CitizenNow-Enhanced
railway init

# Set environment variables
railway variables set EXPO_PUBLIC_FIREBASE_API_KEY="your_key"
railway variables set EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your_domain"
railway variables set EXPO_PUBLIC_FIREBASE_PROJECT_ID="your_id"
railway variables set EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="your_bucket"
railway variables set EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_id"
railway variables set EXPO_PUBLIC_FIREBASE_APP_ID="your_app_id"
railway variables set EXPO_PUBLIC_OPENAI_API_KEY="sk-your_key"
railway variables set EXPO_PUBLIC_GEMINI_API_KEY="your_key"
railway variables set EXPO_PUBLIC_ENV="production"

# Deploy
railway up

# View logs
railway logs -f

# Open app
railway open
```

**Total Time**: ~15 minutes

---

## Cost Estimate

### Railway Pricing

**Free Tier**:
- $5 usage credit per month
- App sleeps after inactivity
- Good for testing/low traffic

**Pro Tier**:
- $20/month (includes $20 credit)
- No sleeping
- Priority support
- Better performance

### Estimated Monthly Cost (CitizenNow)

**Low Traffic** (100-1000 users):
- Railway: $0-5 (free tier)
- Firebase: $0 (Spark plan)
- OpenAI: $5-20
- Gemini: $0 (free tier)
- **Total**: $5-25/month

**Medium Traffic** (1000-10000 users):
- Railway: $20-40
- Firebase: $25-50 (Blaze plan)
- OpenAI: $50-200
- Gemini: $0-20
- **Total**: $95-310/month

**High Traffic** (10000+ users):
- Railway: $50-100
- Firebase: $100-300
- OpenAI: $200-1000
- Gemini: $20-100
- **Total**: $370-1500/month

---

## Testing Before Deployment

### Local Testing with Railway Environment

```bash
# 1. Build for web
cd /Users/a21/CitizenNow-Enhanced
npm run build:web

# 2. Test serve locally
npm run serve
# Opens on http://localhost:8081

# 3. Test with production env vars
# Copy .env.railway.example to .env.production
# Add real values
# Test locally

# 4. Verify build output
ls -la dist/
# Should contain:
# - index.html
# - _expo/
# - assets/
# - metadata.json
```

---

## Post-Deployment Verification

### Immediate Checks (First 5 Minutes)

```bash
# 1. App loads
curl -I https://your-app.up.railway.app
# Should return 200 OK

# 2. No console errors
# Open in browser > F12 > Console tab
# Should be no red errors

# 3. Firebase connected
# Test login/signup
# Check Firebase Console > Authentication

# 4. AI features work
# Test chat or AI functionality
# Check OpenAI/Gemini usage dashboards
```

### Comprehensive Testing (First Hour)

- [ ] All navigation routes work
- [ ] User signup creates Firebase account
- [ ] Login persists across page refresh
- [ ] Firestore reads/writes work
- [ ] OpenAI API responds
- [ ] Gemini API responds
- [ ] Images and assets load
- [ ] Mobile responsive design works
- [ ] Works in Chrome, Safari, Firefox
- [ ] HTTPS enabled (green lock)

---

## Common Issues and Solutions

### 1. Build Fails: "expo: command not found"

**Solution**: Already handled in `nixpacks.toml`
```toml
[phases.install]
cmds = ['npm ci --legacy-peer-deps']
```

### 2. App Shows Blank Page

**Cause**: Missing environment variables

**Solution**:
1. Check Railway Dashboard > Variables
2. Verify all `EXPO_PUBLIC_*` variables set
3. Check browser console for errors
4. Verify Firebase config matches Firebase Console

### 3. "Failed to fetch" Errors

**Cause**: API keys incorrect or missing

**Solution**:
1. Test API keys independently:
```bash
# Test OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-your-key"

# Test Gemini
curl "https://generativelanguage.googleapis.com/v1/models?key=your-key"
```
2. Update keys in Railway if needed
3. Redeploy

### 4. Slow Build Times

**Solution**:
- Normal first build: 5-7 minutes
- Subsequent builds: 3-5 minutes (cached)
- If slower, check Railway status page

---

## Auto-Deployment Setup

### Enable GitHub Auto-Deploy

1. Railway Dashboard > Settings
2. Enable "Automatic Deployments"
3. Select `main` branch
4. Save

**Result**: Every push to main triggers new deployment

### Workflow

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Railway automatically:
# 1. Detects commit
# 2. Starts build
# 3. Runs tests (if configured)
# 4. Deploys if successful
# 5. Updates live URL

# Monitor deployment
railway logs -f
```

---

## Custom Domain Setup

### Steps

1. **Railway Dashboard**:
   - Settings > Domains
   - Click "Custom Domain"
   - Enter domain: `app.citizennow.com`

2. **DNS Configuration** (at domain registrar):
   ```
   Type: CNAME
   Name: app
   Value: your-app.up.railway.app
   TTL: 3600
   ```

3. **Wait for SSL**:
   - Railway auto-provisions SSL
   - Takes 5-10 minutes
   - Certificate auto-renews

4. **Verify**:
   ```bash
   curl -I https://app.citizennow.com
   # Should return 200 OK with SSL
   ```

---

## Monitoring Setup

### Railway Built-in Monitoring

- Dashboard > Metrics tab
- CPU usage
- Memory usage
- Network traffic
- Request count

### External Monitoring (Recommended)

**UptimeRobot** (Free):
```
1. Go to https://uptimerobot.com
2. Add new monitor
3. Type: HTTP(S)
4. URL: https://your-app.up.railway.app
5. Interval: 5 minutes
6. Alert: Email when down
```

**Sentry** (Error Tracking):
```bash
# Install Sentry
npm install @sentry/react

# Configure in app
# Add EXPO_PUBLIC_SENTRY_DSN to Railway
```

---

## Rollback Procedure

### If Deployment Breaks Production

**Via Dashboard**:
1. Railway Dashboard > Deployments
2. Find last working deployment
3. Click "..." menu > Redeploy

**Via CLI**:
```bash
# List deployments
railway deployments

# Rollback to specific deployment
railway deployments rollback <deployment-id>
```

**Emergency Rollback**:
```bash
# Revert git commit
git revert HEAD
git push origin main

# Railway auto-deploys previous version
```

---

## Security Best Practices

### Environment Variables
- Never commit API keys to git
- Use Railway's environment variables
- Rotate keys every 90 days

### Firebase Security
- Enable Firebase Security Rules
- Restrict API keys to specific domains
- Enable App Check for production

### API Key Restrictions
- OpenAI: Set spending limits
- Gemini: Enable API restrictions
- Monitor usage dashboards daily

---

## Next Steps After Deployment

1. **Test Thoroughly**
   - Run through all user flows
   - Test on different devices/browsers
   - Verify all features work

2. **Set Up Monitoring**
   - UptimeRobot for uptime
   - Sentry for error tracking
   - Railway metrics for performance

3. **Configure Auto-Deploy**
   - Enable GitHub integration
   - Test with a small change

4. **Add Custom Domain** (Optional)
   - Purchase domain if needed
   - Configure DNS
   - Wait for SSL

5. **Document**
   - Update README with live URL
   - Share Railway access with team
   - Create runbook for incidents

---

## Support Resources

### Railway
- **Status**: https://status.railway.app
- **Docs**: https://docs.railway.app
- **Discord**: https://discord.gg/railway
- **CLI**: `railway --help`

### Expo
- **Docs**: https://docs.expo.dev
- **Forums**: https://forums.expo.dev
- **Discord**: https://discord.gg/expo

### Firebase
- **Docs**: https://firebase.google.com/docs
- **Status**: https://status.firebase.google.com
- **Console**: https://console.firebase.google.com

---

## Quick Command Reference

```bash
# View logs
railway logs
railway logs -f  # follow/tail

# Environment variables
railway variables
railway variables set KEY="value"
railway variables delete KEY

# Deployment
railway up
railway open
railway status

# Link project
railway link
railway unlink

# Help
railway --help
railway <command> --help
```

---

## Summary

CitizenNow Enhanced is now ready for Railway deployment with:

✅ Nixpacks configuration for optimized builds
✅ Railway-specific scripts in package.json
✅ Environment variable template
✅ Comprehensive deployment documentation
✅ Quick start guide for fast deployment
✅ Deployment checklist for verification
✅ Troubleshooting guide for common issues

**Estimated Deployment Time**: 10-15 minutes
**Build Time**: 5-7 minutes
**Cost**: $5-40/month depending on traffic

**Next Step**: Choose deployment method (Dashboard or CLI) and follow RAILWAY_QUICK_START.md

---

**Created**: November 16, 2025
**Project**: CitizenNow Enhanced
**Location**: /Users/a21/CitizenNow-Enhanced
**Status**: Ready for deployment
