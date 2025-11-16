# CitizenNow Enhanced - Quick Deploy Reference

One-page reference for deploying to production.

---

## Prerequisites Checklist

```bash
✅ Node.js installed (v18+)
✅ npm installed
✅ Git installed
✅ Expo account created
✅ Firebase project created
✅ OpenAI API key obtained
✅ Apple Developer account (for iOS)
✅ Google Play account (for Android)
✅ macOS (for iOS builds)
```

---

## 🚀 Deploy in 5 Steps

### 1. Setup Environment (10 minutes)

```bash
cd /Users/a21/CitizenNow-Enhanced

# Copy and edit production environment
cp .env.example .env.production
nano .env.production  # Fill in all values

# Validate
node env-validator.js production
```

**Must fill:**
- All `EXPO_PUBLIC_FIREBASE_*` values
- `EXPO_PUBLIC_OPENAI_API_KEY`
- `EXPO_PUBLIC_SUPPORT_EMAIL`

### 2. Configure Firebase (30 minutes)

```bash
1. Go to: https://console.firebase.google.com
2. Create project: "CitizenNow-Production"
3. Add Web, iOS, Android apps
4. Enable: Authentication, Firestore, Storage
5. Deploy security rules from FIREBASE_SETUP_GUIDE.md
6. Copy config to .env.production
```

### 3. Setup EAS (5 minutes)

```bash
npm install -g eas-cli
eas login
eas init
```

### 4. Build & Deploy

#### iOS Build (2 hours including review)
```bash
./build-ios.sh production
# Or auto-submit:
./build-ios.sh production true
```

#### Android Build (2 hours including review)
```bash
./build-android.sh production aab
# Or auto-submit:
./build-android.sh production aab true
```

#### Web Deploy (5 minutes)
```bash
# Choose your platform:
./deploy-web.sh production netlify
./deploy-web.sh production vercel
./deploy-web.sh production firebase
```

### 5. Monitor & Verify

```bash
✅ Check App Store Connect (iOS)
✅ Check Play Console (Android)
✅ Check hosting dashboard (Web)
✅ Test on real devices
✅ Monitor Firebase console
✅ Check analytics
```

---

## 📱 Platform-Specific Commands

### iOS
```bash
# Development build
./build-ios.sh development

# Staging build
./build-ios.sh staging

# Production build
./build-ios.sh production

# Production + auto-submit
./build-ios.sh production true
```

### Android
```bash
# APK for testing
./build-android.sh production apk

# AAB for Play Store
./build-android.sh production aab

# AAB + auto-submit
./build-android.sh production aab true
```

### Web
```bash
# Netlify
./deploy-web.sh production netlify

# Vercel
./deploy-web.sh production vercel

# Firebase
./deploy-web.sh production firebase

# Build only (manual upload)
./deploy-web.sh production manual
```

---

## 🔧 Common Commands

### Environment Validation
```bash
# Validate production
node env-validator.js production

# Validate staging
node env-validator.js staging

# Validate development
node env-validator.js development
```

### EAS Commands
```bash
# Login
eas login

# Check who's logged in
eas whoami

# View builds
eas build:list

# Submit to stores
eas submit -p ios
eas submit -p android

# OTA update
eas update --branch production --message "Bug fix"
```

### Firebase Commands
```bash
# Login
firebase login

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Deploy hosting
firebase deploy --only hosting
```

---

## 📊 Quick Troubleshooting

### Build Failing?
```bash
# 1. Validate environment
node env-validator.js production

# 2. Clear EAS cache
eas build:clear

# 3. Re-run build
./build-ios.sh production
```

### Environment Issues?
```bash
# Check for missing variables
node env-validator.js production

# Verify Firebase config matches
cat .env.production | grep FIREBASE
```

### Web Not Deploying?
```bash
# Test build locally
npx expo export:web

# Check build output
ls -la web-build/

# Re-run deployment
./deploy-web.sh production netlify
```

---

## 📋 Post-Deploy Checklist

### Day 1
- [ ] All platforms live
- [ ] No critical crashes
- [ ] 10+ successful signups
- [ ] All features working

### Week 1
- [ ] 100+ downloads
- [ ] Crash rate <1%
- [ ] Rating >4.0
- [ ] Respond to reviews

### Month 1
- [ ] 500+ downloads
- [ ] 40% retention
- [ ] Review costs
- [ ] Plan updates

---

## 💰 Cost Estimates

### Year 1 Minimum
```
Apple Developer:     $99/year
Google Play:         $25 one-time
OpenAI:             ~$20-50/month
Firebase:            Free (generous tier)
Hosting:             Free (Netlify/Vercel)
─────────────────────────────────
Total Year 1:       ~$364-724
```

### Monthly (after setup)
```
Low traffic (100 users):    $20-50
Medium traffic (1000 users): $100-200
High traffic (5000+ users):  $500+
```

---

## 🔗 Important Links

### Dashboards
- **Expo:** https://expo.dev
- **Firebase:** https://console.firebase.google.com
- **App Store:** https://appstoreconnect.apple.com
- **Play Store:** https://play.google.com/console

### Documentation
- **Master Guide:** DEPLOYMENT_GUIDE.md
- **Checklist:** DEPLOYMENT_CHECKLIST.md
- **Firebase:** FIREBASE_SETUP_GUIDE.md
- **App Stores:** APP_STORE_PREPARATION.md

### Support
- **Expo Discord:** https://discord.gg/expo
- **Firebase Support:** https://firebase.google.com/support
- **Stack Overflow:** Tag: `expo`, `firebase`, `react-native`

---

## 🎯 Essential Files

```
/Users/a21/CitizenNow-Enhanced/
├── .env.production          ← Your production config
├── .env.staging             ← Your staging config
├── app.config.js            ← App configuration
├── eas.json                 ← EAS build profiles
├── build-ios.sh             ← iOS build script
├── build-android.sh         ← Android build script
├── deploy-web.sh            ← Web deploy script
├── env-validator.js         ← Environment validator
├── DEPLOYMENT_GUIDE.md      ← Complete guide
├── QUICK_DEPLOY.md          ← This file
└── DEPLOYMENT_CHECKLIST.md  ← Step-by-step checklist
```

---

## ⚡ One-Command Deploy (Advanced)

After initial setup, you can deploy all platforms:

```bash
# Create this script
cat > deploy-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying to all platforms..."

# Validate
node env-validator.js production || exit 1

# iOS (background)
./build-ios.sh production &

# Android (background)
./build-android.sh production aab &

# Web (foreground)
./deploy-web.sh production netlify

wait
echo "✅ All deployments initiated!"
EOF

chmod +x deploy-all.sh

# Run it
./deploy-all.sh
```

---

## 📞 Emergency Rollback

### iOS
```bash
# In App Store Connect:
# 1. Go to App Store → [Version]
# 2. Click "Remove from Sale"
# 3. Previous version automatically reinstated
```

### Android
```bash
# In Play Console:
# 1. Release → Production
# 2. Halt rollout or decrease percentage
# 3. Or release previous version
```

### Web
```bash
# Netlify/Vercel:
# 1. Go to Deployments
# 2. Find previous deployment
# 3. Click "Publish"

# Firebase:
firebase hosting:channel:deploy previous-version
```

---

## 🎓 First Time Deploying?

**Read this order:**
1. DEPLOYMENT_GUIDE.md (master guide)
2. FIREBASE_SETUP_GUIDE.md (setup Firebase)
3. APP_STORE_PREPARATION.md (prepare listings)
4. DEPLOYMENT_CHECKLIST.md (follow steps)
5. QUICK_DEPLOY.md (this file - reference)

**Have issues? Check:**
1. Environment variables all set? `node env-validator.js production`
2. Firebase configured? Check console
3. EAS logged in? `eas whoami`
4. Scripts executable? `chmod +x *.sh`

---

## 🏆 Success Indicators

### Good Signs ✅
```
✅ Build completes in <30 minutes
✅ No validation errors
✅ App appears in stores within 48 hours
✅ Zero critical crashes first day
✅ Users can sign up successfully
✅ All features functional
```

### Red Flags 🚩
```
🚩 Build fails repeatedly
🚩 Environment validation errors
🚩 Crashes on startup
🚩 Firebase permission errors
🚩 API keys not working
🚩 Store rejection
```

---

**Print this page and keep handy during deployment!**

**Last Updated:** 2025-11-15
**Version:** 1.0.0
