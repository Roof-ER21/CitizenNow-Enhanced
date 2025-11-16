# CitizenNow Enhanced - Master Deployment Guide

Complete production deployment guide for iOS, Android, and Web platforms.

---

## Quick Start

```bash
# 1. Validate environment
node env-validator.js production

# 2. Build for your platform
./build-ios.sh production          # iOS build
./build-android.sh production aab  # Android build (Play Store)
./deploy-web.sh production netlify # Web deployment

# 3. Monitor deployment in respective dashboards
```

---

## Table of Contents

1. [Pre-Deployment Overview](#pre-deployment-overview)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Platform-Specific Deployment](#platform-specific-deployment)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance & Updates](#maintenance--updates)

---

## Pre-Deployment Overview

### What You'll Need

#### Accounts & Services
- [ ] **Expo Account** (free) - https://expo.dev
- [ ] **Firebase Project** (free tier available) - https://firebase.google.com
- [ ] **OpenAI API Key** ($) - https://platform.openai.com
- [ ] **Apple Developer Account** ($99/year) - For iOS
- [ ] **Google Play Developer** ($25 one-time) - For Android
- [ ] **Hosting Account** (free options available) - For web

#### Development Tools
- [ ] **Node.js** (v18 or higher)
- [ ] **npm** (comes with Node.js)
- [ ] **Git** (version control)
- [ ] **EAS CLI** (will be installed by scripts)
- [ ] **macOS** (required for iOS builds)

#### Assets Required
- [ ] App icon (1024x1024 PNG)
- [ ] Splash screen image
- [ ] App screenshots (various sizes)
- [ ] Privacy policy (hosted publicly)
- [ ] Terms of service (hosted publicly)

### Estimated Timeline

| Task | Duration |
|------|----------|
| Firebase setup | 1-2 hours |
| Environment configuration | 30 minutes |
| iOS build & submission | 2-4 hours |
| Android build & submission | 2-4 hours |
| Web deployment | 1 hour |
| App Store review | 24-48 hours |
| Play Store review | 1-3 days |
| **Total** | **3-5 days** |

---

## Environment Setup

### Step 1: Clone & Install

```bash
cd /Users/a21/CitizenNow-Enhanced
npm install
```

### Step 2: Create Environment Files

Create production environment file:

```bash
cp .env.example .env.production
```

Edit `.env.production` and fill in all required values:

```bash
# Use your preferred editor
nano .env.production
# or
code .env.production
```

**Required variables:**
- All `EXPO_PUBLIC_FIREBASE_*` values (from Firebase Console)
- `EXPO_PUBLIC_OPENAI_API_KEY` or `EXPO_PUBLIC_GEMINI_API_KEY`
- `EXPO_PUBLIC_SUPPORT_EMAIL`

**Optional but recommended:**
- `EXPO_PUBLIC_ELEVENLABS_API_KEY` (for voice features)
- Analytics keys

### Step 3: Validate Environment

```bash
node env-validator.js production
```

Expected output:
```
✅ Valid variables: 12
❌ Errors: 0
⚠️  Warnings: 0

✅ VALIDATION PASSED - Environment is ready!
```

If you see errors, fix them before proceeding.

### Step 4: Update App Configuration

Edit `app.config.js`:

```javascript
// Update these values
bundleIdentifier: 'com.citizennow.app',        // Your iOS bundle ID
package: 'com.citizennow.app',                 // Your Android package
owner: 'your-expo-username',                   // Your Expo username
```

---

## Firebase Configuration

**Full guide:** See [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)

### Quick Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Click "Add project"
   - Name: `CitizenNow-Production`
   - Enable Google Analytics (recommended)

2. **Register Apps**
   - Add Web app
   - Add iOS app (bundle: `com.citizennow.app`)
   - Add Android app (package: `com.citizennow.app`)

3. **Enable Services**
   - **Authentication** → Email/Password
   - **Firestore Database** → Create (production mode)
   - **Storage** → Enable

4. **Deploy Security Rules**

   Copy rules from `FIREBASE_SETUP_GUIDE.md` sections:
   - Firestore Rules (Section 5.1)
   - Storage Rules (Section 5.2)

5. **Get Configuration**

   From Firebase Console → Project Settings → Your apps:
   - Copy all config values to `.env.production`

6. **Verify Setup**
   ```bash
   node env-validator.js production
   ```

---

## Platform-Specific Deployment

### iOS Deployment

**Full guide:** See [APP_STORE_PREPARATION.md](./APP_STORE_PREPARATION.md#apple-app-store)

#### Prerequisites

1. **Apple Developer Account**
   - Enroll at https://developer.apple.com/programs/
   - Cost: $99/year
   - Approval time: 24-48 hours

2. **App Store Connect Setup**
   - Create app listing
   - Prepare screenshots (6.7", 6.5", 5.5" displays)
   - Write app description
   - Create privacy policy

3. **Expo Account**
   ```bash
   npm install -g eas-cli
   eas login
   eas init
   ```

#### Build & Deploy

```bash
# 1. Validate environment
node env-validator.js production

# 2. Run iOS build
./build-ios.sh production

# Build will take 15-30 minutes
# Download from: https://expo.dev/accounts/[account]/projects/citizennow-enhanced/builds
```

#### Submit to App Store

Option 1: **Automatic** (during build)
```bash
./build-ios.sh production true
```

Option 2: **Manual** (after build)
```bash
eas submit --platform ios --latest
```

#### Monitoring

- App Store Connect: https://appstoreconnect.apple.com
- Review typically takes 24-48 hours
- Check status in "App Store" tab

---

### Android Deployment

**Full guide:** See [APP_STORE_PREPARATION.md](./APP_STORE_PREPARATION.md#google-play-store)

#### Prerequisites

1. **Google Play Developer Account**
   - Sign up at https://play.google.com/console/signup
   - Cost: $25 one-time fee
   - Approval: Usually instant, can take 48 hours

2. **Play Console Setup**
   - Create app listing
   - Prepare screenshots (phone, tablet)
   - Prepare feature graphic (1024x500)
   - Complete data safety questionnaire
   - Complete content rating

3. **Service Account** (for automated submission)
   - Create in Google Cloud Console
   - Download JSON key
   - Save as `google-play-service-account.json`
   - **Important:** Don't commit to git!

#### Build & Deploy

```bash
# 1. Validate environment
node env-validator.js production

# 2. Build AAB (for Play Store)
./build-android.sh production aab

# 3. Or build APK (for testing/direct install)
./build-android.sh production apk

# Build will take 15-30 minutes
```

#### Submit to Play Store

Option 1: **Automatic** (with service account)
```bash
./build-android.sh production aab true
```

Option 2: **Manual**
```bash
# After build completes
eas submit --platform android --latest
```

Option 3: **Via Console**
- Download AAB from Expo dashboard
- Upload to Play Console manually

#### Release Strategy

**Recommended:** Staged rollout
1. Internal testing (your team)
2. Closed testing (beta users) - 10-20%
3. Open testing - 50%
4. Production - 100%

#### Monitoring

- Play Console: https://play.google.com/console
- Review typically takes 1-3 days
- Monitor crash rate (should be <1%)

---

### Web Deployment

**Recommended platforms:** Netlify, Vercel, or Firebase Hosting

#### Option 1: Netlify (Recommended)

```bash
# 1. Validate environment
node env-validator.js production

# 2. Deploy to Netlify
./deploy-web.sh production netlify

# First time: Will prompt for login
# Subsequent: Auto-deploys

# 3. Configure custom domain (optional)
# Do this in Netlify dashboard
```

**Features:**
- Automatic HTTPS
- Global CDN
- Continuous deployment
- Free tier: 100GB bandwidth/month

#### Option 2: Vercel

```bash
./deploy-web.sh production vercel
```

**Features:**
- Excellent performance
- Edge network
- Free tier: 100GB bandwidth/month

#### Option 3: Firebase Hosting

```bash
./deploy-web.sh production firebase
```

**Features:**
- Integrated with Firebase
- Free tier: 10GB storage, 360MB/day bandwidth
- Automatic SSL

#### Custom Domain Setup

All platforms support custom domains:

1. **Purchase domain** (Namecheap, GoDaddy, Google Domains)
2. **Add to hosting platform** (Netlify/Vercel/Firebase dashboard)
3. **Update DNS records** (provided by platform)
4. **Wait for SSL** (auto-provisioned, 24-48 hours)

#### Verify Deployment

```bash
# Check these:
✅ Site loads at provided URL
✅ HTTPS enabled (green padlock)
✅ All features work
✅ No console errors
✅ Mobile responsive
✅ Firebase connected
```

---

## Post-Deployment

### Immediate Checks (First 24 Hours)

#### All Platforms

- [ ] **Functionality Testing**
  - User registration works
  - User login works
  - AI tutor responds
  - Progress saves correctly
  - All screens accessible

- [ ] **Performance**
  - App launches quickly (<3 seconds)
  - Navigation smooth
  - No crashes or freezes
  - API responses fast

- [ ] **Security**
  - HTTPS enabled (web)
  - No exposed API keys (check browser console)
  - Firebase rules working (test unauthorized access)

#### iOS Specific

- [ ] TestFlight invite sent to testers
- [ ] No critical crashes in TestFlight
- [ ] Push notifications working (if enabled)
- [ ] App submitted for review
- [ ] Demo account working for reviewers

#### Android Specific

- [ ] Internal testing track populated
- [ ] No crashes in pre-launch report
- [ ] All device sizes tested
- [ ] App submitted for review

#### Web Specific

- [ ] Custom domain working (if applicable)
- [ ] All browsers tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile web responsive
- [ ] Analytics tracking verified
- [ ] Lighthouse score >90

### Monitoring Setup

#### Firebase Console

Monitor these daily:
- **Authentication** → User signups
- **Firestore** → Read/write operations
- **Analytics** → Active users
- **Crashlytics** → Crash-free rate

#### App Store Connect (iOS)

- **App Analytics** → Downloads, sessions
- **Crashes** → Crash rate (should be <1%)
- **Ratings & Reviews** → User feedback

#### Google Play Console (Android)

- **Statistics** → Installations, uninstalls
- **Android vitals** → Crashes, ANRs
- **Ratings & Reviews** → User feedback

#### Web Analytics

If using Google Analytics:
- Active users
- Session duration
- Bounce rate
- Popular pages

### Weekly Tasks

- [ ] Review crash reports
- [ ] Read user reviews (respond to negative ones)
- [ ] Check performance metrics
- [ ] Review Firebase costs
- [ ] Update documentation

### Monthly Tasks

- [ ] Run full performance audit
- [ ] Review and optimize Firebase costs
- [ ] Update dependencies
- [ ] Security audit
- [ ] Backup critical data
- [ ] Review analytics for insights

---

## Troubleshooting

### Build Failures

#### "Environment validation failed"

**Solution:**
```bash
# Check which variables are missing
node env-validator.js production

# Fix any ❌ errors shown
# Re-run validation until all pass
```

#### "EAS Build failed: iOS"

**Common causes:**
1. Invalid bundle identifier
2. Missing Apple Developer account
3. Certificate issues

**Solution:**
```bash
# Clear EAS credentials
eas credentials

# Re-run build
./build-ios.sh production
```

#### "EAS Build failed: Android"

**Common causes:**
1. Invalid package name
2. Keystore issues

**Solution:**
```bash
# EAS handles keystores automatically
# Just retry the build
./build-android.sh production aab
```

### Deployment Issues

#### Web: "Firebase not connecting"

**Check:**
1. Environment variables loaded correctly
2. Firebase config matches project
3. Firebase project has web app registered

**Solution:**
```bash
# Verify env
node env-validator.js production

# Check browser console for specific error
# Verify Firebase config in Firebase Console
```

#### iOS: "App rejected by Apple"

**Common reasons:**
1. Incomplete app information
2. Privacy policy issues
3. Crashes during review
4. Misleading screenshots

**Solution:**
- Read rejection reason carefully
- Fix specific issue mentioned
- Resubmit with notes explaining fix

#### Android: "App suspended"

**Common reasons:**
1. Policy violations
2. Misleading content
3. Privacy issues

**Solution:**
- Check policy compliance
- Update app listing
- Contact Play Store support if needed

### Runtime Issues

#### "AI Tutor not responding"

**Check:**
1. OpenAI API key valid
2. API key has credits
3. Internet connection
4. No API rate limits hit

#### "Firebase permission denied"

**Check:**
1. User authenticated
2. Security rules correct
3. User ID matches document owner

#### "App crashes on startup"

**Check:**
1. All required environment variables present
2. Firebase config correct
3. No syntax errors in config files
4. Check Crashlytics for stack trace

---

## Maintenance & Updates

### Releasing Updates

#### 1. Make Changes

```bash
# Make code changes
# Test thoroughly locally
# Update version in app.config.js
```

#### 2. Update Version Numbers

```javascript
// app.config.js
version: '1.0.1',           // Increment
buildNumber: '2',           // Increment (iOS)
versionCode: 2,             // Increment (Android)
```

#### 3. Build & Deploy

```bash
# iOS
./build-ios.sh production

# Android
./build-android.sh production aab

# Web (instant)
./deploy-web.sh production netlify
```

#### 4. Release Notes

**iOS (App Store Connect):**
```
Version 1.0.1
- Fixed bug in progress tracking
- Improved AI tutor responses
- Performance optimizations
- Minor UI improvements
```

**Android (Play Console):**
```
What's new in version 1.0.1:
• Bug fixes for progress tracking
• Enhanced AI tutor accuracy
• Faster load times
• UI polish
```

### OTA Updates (Over-The-Air)

For minor JavaScript-only changes, use EAS Update:

```bash
# Install EAS Update
npx expo install expo-updates

# Configure in app.config.js (already done)

# Publish update
eas update --branch production --message "Fix typo in study screen"

# Users get update on next app launch (no App Store review needed!)
```

**Limitations:**
- JavaScript/React code only
- No native code changes
- No new permissions
- No dependency changes

### Monitoring Update Adoption

Track in dashboards:
- **iOS:** App Analytics → App Usage → by Version
- **Android:** Statistics → Install statistics → by Version
- **Web:** Instant (all users on latest)

### Deprecating Old Versions

After new version is stable:

```bash
# Force update for security/critical fixes
# Add version check in app:

if (currentVersion < minimumVersion) {
  // Show "Update Required" screen
  // Disable app functionality
}
```

---

## Cost Breakdown

### Required Costs

| Service | Cost | Frequency |
|---------|------|-----------|
| Apple Developer | $99 | Annual |
| Google Play | $25 | One-time |
| OpenAI API | ~$10-50 | Monthly (usage-based) |
| **Minimum Total** | **~$134** | **Year 1** |

### Optional Costs

| Service | Free Tier | Paid Plan |
|---------|-----------|-----------|
| Firebase | Generous free | ~$25/month (Blaze) |
| Netlify | 100GB/month | $19/month (Pro) |
| ElevenLabs (TTS) | 10k chars/month | $5-99/month |
| Domain | - | $10-15/year |

### Estimated Monthly Costs (Production)

**Low traffic** (100-500 users):
- Firebase: Free
- OpenAI: $20-50
- Hosting: Free
- **Total: ~$20-50/month**

**Medium traffic** (500-5000 users):
- Firebase: $25-50
- OpenAI: $100-200
- Hosting: Free or $19
- **Total: ~$125-270/month**

**High traffic** (5000+ users):
- Firebase: $100+
- OpenAI: $500+
- Hosting: $19-99
- **Total: $619+/month**

### Cost Optimization Tips

1. **Implement caching** - Reduce Firebase reads
2. **Optimize AI prompts** - Reduce OpenAI token usage
3. **Use pagination** - Don't load all data at once
4. **Compress images** - Reduce storage/bandwidth
5. **Monitor usage** - Set budget alerts

---

## Support & Resources

### Documentation Files

Located in `/Users/a21/CitizenNow-Enhanced/`:

- **DEPLOYMENT_GUIDE.md** (this file) - Master guide
- **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist
- **FIREBASE_SETUP_GUIDE.md** - Complete Firebase setup
- **APP_STORE_PREPARATION.md** - App Store & Play Store prep
- **.env.production** - Production environment template
- **.env.staging** - Staging environment template

### Build Scripts

- **build-ios.sh** - iOS build automation
- **build-android.sh** - Android build automation
- **deploy-web.sh** - Web deployment automation
- **env-validator.js** - Environment validation

### External Resources

- **Expo Docs:** https://docs.expo.dev
- **Firebase Docs:** https://firebase.google.com/docs
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Play Store Policies:** https://play.google.com/about/developer-content-policy/

### Getting Help

- **Expo Discord:** https://discord.gg/expo
- **Stack Overflow:** Tag `expo`, `firebase`, `react-native`
- **Firebase Support:** https://firebase.google.com/support
- **Apple Developer Forums:** https://developer.apple.com/forums/

---

## Success Metrics

### Week 1 Targets

- [ ] Zero critical crashes
- [ ] 50+ user signups
- [ ] Average rating >4.0
- [ ] All platforms live

### Month 1 Targets

- [ ] 500+ downloads
- [ ] 40% user retention
- [ ] 5+ minute avg session
- [ ] Rating maintained >4.0

### Month 3 Targets

- [ ] 2,000+ downloads
- [ ] 50% user retention
- [ ] 100+ positive reviews
- [ ] Featured in app stores (goal)

---

## Final Checklist

Before going live, verify:

- [ ] All environment variables configured
- [ ] Environment validated (`node env-validator.js production`)
- [ ] Firebase setup complete with security rules
- [ ] Privacy policy and terms publicly accessible
- [ ] App icons and screenshots prepared
- [ ] Demo accounts created for reviewers
- [ ] All platforms tested (iOS, Android, Web)
- [ ] Analytics and monitoring configured
- [ ] Budget alerts set up
- [ ] Support email configured
- [ ] Backup strategy in place
- [ ] Team trained on deployment process
- [ ] Documentation reviewed and updated

---

## Emergency Contacts

```
Technical Lead: __________________
Email: __________________
Phone: __________________

Firebase: https://firebase.google.com/support
Expo: https://expo.dev/support
Apple: https://developer.apple.com/contact/
Google Play: https://support.google.com/googleplay/android-developer
```

---

**Good luck with your deployment! 🚀**

**Last Updated:** 2025-11-15
**Version:** 1.0.0
**Project:** CitizenNow Enhanced
**Location:** /Users/a21/CitizenNow-Enhanced/
