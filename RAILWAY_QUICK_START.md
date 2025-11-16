# Railway Quick Start - CitizenNow Enhanced

Fast deployment guide for CitizenNow Enhanced to Railway.

## Prerequisites Checklist

- [ ] Railway account (sign up at https://railway.app)
- [ ] Firebase project with web app configured
- [ ] OpenAI API key
- [ ] Google Gemini API key
- [ ] Git repository pushed to GitHub

## 5-Minute Deployment

### Step 1: Create Railway Project (2 minutes)

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `CitizenNow-Enhanced` repository
4. Railway auto-detects configuration

### Step 2: Add Environment Variables (2 minutes)

Go to Railway Dashboard > Variables tab and add:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key
EXPO_PUBLIC_GEMINI_API_KEY=your-key
EXPO_PUBLIC_ENV=production
```

### Step 3: Deploy (1 minute)

1. Railway automatically builds on first setup
2. Wait ~5-7 minutes for build to complete
3. Click the generated URL to view your app

**That's it! Your app is live.**

## Files Created for Railway

This project includes these Railway configuration files:

```
/Users/a21/CitizenNow-Enhanced/
├── railway.json              # Railway deployment config
├── nixpacks.toml             # Build system optimization
├── .railwayignore            # Files to exclude from build
├── .env.railway.example      # Environment variables template
└── RAILWAY_DEPLOYMENT.md     # Complete deployment guide
```

## Deployment Architecture

```
GitHub Push → Railway Detects Change → Build Process → Deploy
                                            ↓
                                    Nixpacks Builder
                                            ↓
                                    npm ci (install)
                                            ↓
                                    expo export --platform web
                                            ↓
                                    Generate dist/ folder
                                            ↓
                                    Serve static files on $PORT
                                            ↓
                                    Live at Railway URL
```

## Verify Deployment

After deployment completes, check:

1. **App loads**: Visit Railway URL
2. **No errors**: Open browser console (F12)
3. **Firebase works**: Test login/signup
4. **AI features**: Test chat or AI functionality

## Common Issues

### Build Fails
```bash
# Check Railway logs
railway logs

# Common fix: Verify Node version in nixpacks.toml
nixPkgs = ['nodejs_20', 'npm-9_x']
```

### Blank Page After Deploy
```bash
# Check environment variables are set
railway variables

# Verify all EXPO_PUBLIC_* variables are present
```

### Features Don't Work
```bash
# Check browser console for API errors
# Verify API keys in Railway dashboard
# Test Firebase config is correct
```

## Auto-Deployment Setup

Enable automatic deployments on every git push:

1. Railway Dashboard > Settings
2. Enable "Automatic Deployments"
3. Select `main` branch
4. Now every push to main auto-deploys

## CLI Deployment (Alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs -f

# Open app
railway open
```

## Getting Environment Variables

### Firebase Config
1. Firebase Console > Project Settings
2. Scroll to "Your apps" > Web app
3. Copy config values

### OpenAI Key
1. https://platform.openai.com/api-keys
2. Create new secret key
3. Copy (starts with `sk-`)

### Gemini Key
1. https://makersuite.google.com/app/apikey
2. Create API key
3. Copy key

## Cost Estimate

**Free Tier**: $5 credit/month
- Good for testing and low-traffic apps
- App sleeps after inactivity

**Pro Tier**: $20/month (includes $20 credit)
- No sleeping
- Better performance
- Priority support

**Estimated Monthly Cost** (for this app):
- Small traffic: $0-5 (free tier)
- Medium traffic: $20-40 (pro tier)

## Custom Domain (Optional)

1. Railway Dashboard > Settings > Domains
2. Click "Custom Domain"
3. Enter your domain
4. Add CNAME record in DNS:
   ```
   Type: CNAME
   Name: app (or subdomain)
   Value: your-app.up.railway.app
   ```

## Next Steps

- [ ] Test all app features
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure custom domain
- [ ] Enable auto-deployments
- [ ] Share URL with users

## Support

- **Full Guide**: Read `RAILWAY_DEPLOYMENT.md`
- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Expo Docs**: https://docs.expo.dev

---

**Deployment Time**: ~10 minutes total
**Build Time**: 5-7 minutes
**Cost**: Free tier ($5/month) or Pro ($20/month)

🚀 **Happy Deploying!**
