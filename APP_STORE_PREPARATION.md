# App Store Preparation Guide

Complete guide for preparing CitizenNow Enhanced for Apple App Store and Google Play Store submission.

---

## Table of Contents

### Apple App Store
1. [Apple Developer Account Setup](#apple-developer-account)
2. [App Store Connect Configuration](#app-store-connect)
3. [App Screenshots & Media](#ios-screenshots--media)
4. [App Store Listing](#app-store-listing)
5. [Privacy Policy & Legal](#privacy--legal-ios)
6. [App Review Preparation](#app-review-preparation)

### Google Play Store
7. [Google Play Developer Account](#google-play-developer-account)
8. [Play Console Configuration](#play-console-configuration)
9. [Screenshots & Media](#android-screenshots--media)
10. [Play Store Listing](#play-store-listing)
11. [Privacy & Legal](#privacy--legal-android)
12. [Release Management](#release-management)

---

# Apple App Store

## Apple Developer Account

### Requirements

- [ ] Apple ID
- [ ] $99 USD annual fee
- [ ] Valid payment method
- [ ] Two-factor authentication enabled

### Setup Steps

1. **Enroll in Apple Developer Program**
   - Go to: https://developer.apple.com/programs/
   - Click **"Enroll"**
   - Sign in with Apple ID
   - Complete enrollment form
   - Pay $99 annual fee
   - Wait for approval (24-48 hours)

2. **Create App ID**
   - Go to: https://developer.apple.com/account/resources/identifiers
   - Click **"+"** to add new identifier
   - Select **"App IDs"** → Continue
   - Select **"App"** → Continue
   - Configure:
     - **Description:** CitizenNow Enhanced
     - **Bundle ID:** `com.citizennow.app`
     - **Capabilities:** Check required capabilities
       - Push Notifications
       - Sign in with Apple (if using)
   - Click **"Register"**

3. **Create Certificates** (EAS Build handles this automatically)
   - Distribution Certificate
   - Push Notification Certificate (if using push)

---

## App Store Connect

### Initial Setup

1. **Access App Store Connect**
   - Go to: https://appstoreconnect.apple.com
   - Sign in with Apple Developer account

2. **Create New App**
   - Click **"My Apps"** → **"+"** → **"New App"**
   - Fill in details:
     - **Platform:** iOS
     - **Name:** CitizenNow
     - **Primary Language:** English (U.S.)
     - **Bundle ID:** Select `com.citizennow.app`
     - **SKU:** `citizennow-app` (unique identifier, never changes)
     - **User Access:** Full Access

---

## iOS Screenshots & Media

### Required Screenshot Sizes

You need screenshots for different iPhone sizes:

1. **6.7" Display (iPhone 14 Pro Max, 15 Pro Max)**
   - Resolution: **1290 x 2796 pixels**
   - Required: **Minimum 1, Maximum 10**

2. **6.5" Display (iPhone 11 Pro Max, XS Max)**
   - Resolution: **1242 x 2688 pixels**
   - Required if not providing 6.7"

3. **5.5" Display (iPhone 8 Plus)**
   - Resolution: **1242 x 2208 pixels**
   - Required if not providing 6.5" or 6.7"

4. **iPad Pro (12.9", 3rd gen)**
   - Resolution: **2048 x 2732 pixels**
   - Optional but recommended

### Screenshot Recommendations

Create 5-10 screenshots showing:

1. **Welcome/Onboarding Screen**
   - Show app logo and tagline
   - Highlight main value proposition

2. **Study Dashboard**
   - Display progress tracking
   - Show available study modules

3. **AI Tutor in Action**
   - Conversation with AI tutor
   - Demonstrate interactive learning

4. **Practice Test**
   - Show test interface
   - Display score or progress

5. **Study Materials**
   - Civics questions
   - Historical information
   - Visual learning aids

6. **Progress Tracking**
   - Charts/graphs showing progress
   - Achievement badges

7. **Flashcards (Optional)**
   - Interactive flashcard feature

**Design Tips:**
- Use device frames
- Add descriptive captions
- Use consistent branding colors
- Show app in use, not just static screens
- Highlight unique features

### Tools for Screenshot Creation

**Recommended Tools:**
- **Figma** - Free, professional designs
- **Canva** - Easy templates
- **Screenshot.rocks** - Add device frames
- **Previewed.app** - Professional mockups
- **Apple Design Resources** - Official templates

**Automation:**
- Fastlane Snapshot - Automated screenshot generation
- Expo Screenshot Tool - For React Native apps

### App Preview Videos (Optional but Recommended)

- **Duration:** 15-30 seconds
- **Format:** .mov, .mp4, .m4v
- **Orientation:** Portrait
- **Audio:** Optional
- **Sizes:** Same as screenshots

**Video Content Ideas:**
- Quick app walkthrough
- AI tutor interaction
- Study session demo
- Progress visualization

---

## App Store Listing

### App Information

#### App Name
```
CitizenNow
```
- **Max:** 30 characters
- Should be memorable and searchable

#### Subtitle
```
U.S. Citizenship Test Prep
```
- **Max:** 30 characters
- Appears below app name in search

#### Privacy Policy URL
```
https://citizennow.com/privacy
```
- **Required**
- Must be publicly accessible
- See template below

#### Category

**Primary Category:** Education
**Secondary Category:** Reference (optional)

### Promotional Text
```
Pass your U.S. citizenship test with confidence! Study with AI-powered tutoring, practice tests, and comprehensive study materials.
```
- **Max:** 170 characters
- Can be updated anytime without new app review
- Use for promotions, updates, limited-time offers

### Description

```
Prepare for your U.S. citizenship test with CitizenNow - the most comprehensive and
interactive study app designed specifically for citizenship exam success.

🎯 KEY FEATURES

AI-Powered Study Tutor
• Get instant answers to your questions
• Practice conversations in English
• Receive personalized study recommendations
• 24/7 available learning assistant

Complete Study Materials
• All 100 civics questions with detailed answers
• U.S. history and government information
• Reading and writing test preparation
• Civics test audio for pronunciation practice

Interactive Practice Tests
• Full-length practice exams
• Instant scoring and feedback
• Track your progress over time
• Identify areas needing improvement

Smart Progress Tracking
• Visual progress dashboard
• Study streak tracking
• Performance analytics
• Customized study plans

Study Tools
• Interactive flashcards
• Bookmarks and favorites
• Offline access to materials
• Text-to-speech support

📚 COMPREHENSIVE CONTENT

• 100 Official Civics Test Questions
• U.S. History Timeline
• Government Structure Guide
• Citizenship Interview Preparation
• English Language Practice
• Reading & Writing Test Prep

✨ WHY CITIZENNOW?

✓ Designed by education experts
✓ Based on official USCIS materials
✓ Proven study methodology
✓ User-friendly interface
✓ Regular content updates
✓ Privacy-focused (no data selling)
✓ Works offline

🌟 PERFECT FOR

• Citizenship test candidates
• Green card holders preparing for naturalization
• ESL students
• Civics education
• U.S. government and history learners

💡 STUDY METHODS

• Spaced repetition for better retention
• Interactive quizzes
• AI conversation practice
• Visual learning aids
• Audio pronunciation guides

🎓 SUCCESS RATE

Thousands of students have successfully passed their citizenship test using
CitizenNow's proven study system.

📱 FEATURES AT A GLANCE

• AI study assistant
• 100 civics questions
• Practice tests
• Progress tracking
• Flashcards
• Offline mode
• Voice support
• Clean, intuitive design

Start your journey to U.S. citizenship today with CitizenNow!

SUPPORT
Email: support@citizennow.com
Website: https://citizennow.com

PRIVACY
We take your privacy seriously. Read our privacy policy at:
https://citizennow.com/privacy
```

- **Max:** 4,000 characters
- Searchable (use relevant keywords naturally)
- First 3 lines visible before "more" button
- Use bullet points for readability
- Include emojis sparingly for visual appeal

### Keywords

```
citizenship,test,civics,uscis,naturalization,immigration,study,exam,english,tutor,practice,us,government,history,education,learning,flashcards,quiz,preparation,green card
```

- **Max:** 100 characters (including commas)
- Separate with commas, no spaces
- Don't include app name (automatically indexed)
- Research competitors' keywords
- Use App Store Connect Search Ads insights

### Support URL
```
https://citizennow.com/support
```

### Marketing URL (Optional)
```
https://citizennow.com
```

---

## Privacy & Legal (iOS)

### Privacy Policy Template

Create a file at `https://citizennow.com/privacy`:

```markdown
# Privacy Policy for CitizenNow

Last updated: [DATE]

## Introduction

CitizenNow ("we," "our," or "us") is committed to protecting your privacy.
This Privacy Policy explains how we collect, use, and safeguard your
information when you use our mobile application.

## Information We Collect

### Information You Provide
- Email address (for account creation)
- Display name (optional)
- Study progress and test scores
- Flashcards and bookmarks you create

### Automatically Collected Information
- Device information (model, OS version)
- App usage analytics
- Crash reports and error logs
- Session duration and frequency

## How We Use Your Information

We use collected information to:
- Provide and maintain our service
- Personalize your learning experience
- Track your study progress
- Improve app functionality
- Send important notifications
- Provide customer support
- Analyze app performance

## Data Storage

- Your data is securely stored using Firebase
- Data is encrypted in transit and at rest
- We retain data for as long as your account is active
- You can request data deletion at any time

## Third-Party Services

We use the following third-party services:
- Firebase (Google) - Authentication and data storage
- OpenAI - AI tutoring features
- Google Analytics - Usage analytics

## Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Request data deletion
- Export your data
- Opt-out of analytics

## Children's Privacy

Our app is not intended for children under 13. We do not knowingly
collect information from children under 13.

## Changes to This Policy

We may update this privacy policy periodically. We will notify you of
significant changes via email or app notification.

## Contact Us

Email: privacy@citizennow.com
Website: https://citizennow.com

## Compliance

This policy complies with:
- CCPA (California Consumer Privacy Act)
- GDPR (General Data Protection Regulation)
- COPPA (Children's Online Privacy Protection Act)
```

### Terms of Service Template

Create at `https://citizennow.com/terms`:

```markdown
# Terms of Service for CitizenNow

Last updated: [DATE]

## Acceptance of Terms

By accessing and using CitizenNow, you agree to be bound by these Terms
of Service.

## Description of Service

CitizenNow provides educational content and tools to help users prepare
for the U.S. citizenship test.

## User Accounts

- You must provide accurate information
- You are responsible for account security
- One account per person
- Must be 13 years or older

## Acceptable Use

You agree NOT to:
- Share your account credentials
- Upload inappropriate content
- Attempt to hack or disrupt the service
- Use the app for illegal purposes
- Resell or redistribute content

## Intellectual Property

- All content is owned by CitizenNow or licensed to us
- You may not copy or redistribute content
- You retain rights to content you create

## Disclaimers

- App is for educational purposes only
- We don't guarantee test passage
- Content is based on official USCIS materials
- We're not affiliated with USCIS

## Limitation of Liability

CitizenNow is provided "as is" without warranties. We are not liable
for any damages arising from app use.

## Termination

We reserve the right to terminate accounts that violate these terms.

## Changes to Terms

We may modify these terms at any time. Continued use constitutes
acceptance of new terms.

## Contact

Email: legal@citizennow.com
```

### App Privacy Questions

In App Store Connect, you'll answer these questions:

**Data Collection:**
- [ ] Contact Information → Email Address
- [ ] Identifiers → User ID
- [ ] Usage Data → Product Interaction
- [ ] Diagnostics → Crash Data

**Data Usage:**
- App Functionality
- Analytics
- Product Personalization

**Data Linked to User:**
- Email
- User ID
- Study Progress

**Data Not Linked to User:**
- Crash Data
- Usage Analytics

---

## App Review Preparation

### Demo Account

Create a test account for Apple reviewers:

```
Email: reviewer@citizennow.app
Password: AppleReview2025!

Note to reviewers:
This demo account has sample progress data. All features are unlocked.
AI tutor requires internet connection to function.
```

### App Review Information

**Contact Information:**
```
First Name: [Your First Name]
Last Name: [Your Last Name]
Phone: [Your Phone Number]
Email: [Your Email]
```

**Notes for Reviewers:**
```
Thank you for reviewing CitizenNow!

TESTING THE APP:
1. Sign in with the demo account provided
2. Navigate to "Study" to see civics questions
3. Try the "AI Tutor" feature by asking a question
4. Take a practice test from the "Practice" tab
5. View progress in the "Progress" tab

IMPORTANT:
- AI features require internet connection
- Uses OpenAI API for tutor functionality
- All content based on official USCIS materials
- No age restrictions (educational app)

ATTACHMENTS:
- Privacy Policy: https://citizennow.com/privacy
- Terms of Service: https://citizennow.com/terms

Please contact us if you need any clarification.
```

### Common Rejection Reasons & How to Avoid

1. **Incomplete App Information**
   - ✅ Fill all required fields
   - ✅ Provide demo account
   - ✅ Add clear notes for reviewers

2. **Privacy Policy Issues**
   - ✅ Accessible URL (not PDF)
   - ✅ Covers all data collection
   - ✅ Mentions third-party services

3. **Crashes or Bugs**
   - ✅ Test thoroughly before submission
   - ✅ Test with demo account
   - ✅ Test on multiple devices

4. **Misleading Information**
   - ✅ Screenshots match app functionality
   - ✅ Description accurate
   - ✅ Don't promise features not implemented

5. **Inappropriate Content**
   - ✅ Educational content only
   - ✅ No offensive material
   - ✅ Age-appropriate

---

# Google Play Store

## Google Play Developer Account

### Requirements

- [ ] Google account
- [ ] $25 USD one-time fee
- [ ] Valid payment method
- [ ] Phone number verification

### Setup Steps

1. **Create Developer Account**
   - Go to: https://play.google.com/console/signup
   - Sign in with Google account
   - Accept Developer Distribution Agreement
   - Pay $25 registration fee
   - Complete account details:
     - Developer name
     - Contact email
     - Phone number
     - Website (optional)

2. **Verify Identity**
   - May require ID verification
   - Usually processed within 48 hours

---

## Play Console Configuration

### Create Application

1. **Go to Play Console**
   - https://play.google.com/console

2. **Create New App**
   - Click **"Create app"**
   - Fill in details:
     - **App name:** CitizenNow
     - **Default language:** English (United States)
     - **App or game:** App
     - **Free or paid:** Free
   - Declarations:
     - Check privacy policy
     - Check export laws compliance
   - Click **"Create app"**

### Set Up App Information

Navigate through left sidebar:

#### Store Settings

**App Details:**
- **App name:** CitizenNow
- **Short description:** (80 chars)
  ```
  Master the U.S. citizenship test with AI-powered study tools and practice tests
  ```
- **Full description:** (See template below)

**App Category:**
- **Category:** Education
- **Tags:** Educational, Study Tools

**Contact Details:**
- **Email:** support@citizennow.com
- **Phone:** (optional)
- **Website:** https://citizennow.com

**External Marketing:**
- Yes/No (your choice)

---

## Android Screenshots & Media

### Required Assets

#### App Icon
- **Size:** 512 x 512 pixels
- **Format:** PNG (32-bit with alpha)
- **No transparency or rounded corners** (system adds these)
- **File size:** Max 1MB

#### Feature Graphic
- **Size:** 1024 x 500 pixels
- **Format:** PNG or JPEG
- **Required:** Yes
- **Usage:** Shown at top of Play Store listing

#### Phone Screenshots
- **Minimum:** 2 screenshots
- **Maximum:** 8 screenshots
- **Recommended sizes:**
  - 1080 x 1920 pixels (portrait)
  - 1920 x 1080 pixels (landscape)
- **Format:** PNG or JPEG
- **Max file size:** 8MB each

#### 7-inch Tablet Screenshots (Optional)
- **Size:** 1200 x 1920 pixels
- **Quantity:** 2-8

#### 10-inch Tablet Screenshots (Optional)
- **Size:** 1600 x 2560 pixels
- **Quantity:** 2-8

### Screenshot Content

Same principles as iOS, show:
1. Welcome screen
2. Study dashboard
3. AI tutor
4. Practice test
5. Progress tracking
6. Study materials

### Promo Video (Optional)
- **YouTube video link**
- 30 seconds - 2 minutes
- App demonstration

---

## Play Store Listing

### Store Listing

#### Full Description

```
🎓 Pass Your U.S. Citizenship Test with Confidence!

CitizenNow is the ultimate study companion for anyone preparing for the
U.S. citizenship test. Our app combines comprehensive official content with
cutting-edge AI technology to give you the best chance of success.

━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI-POWERED LEARNING
━━━━━━━━━━━━━━━━━━━━━━━━

Your Personal Study Tutor:
• Ask questions anytime, get instant answers
• Practice speaking English with AI conversation
• Receive personalized study recommendations
• Learn at your own pace with adaptive content

━━━━━━━━━━━━━━━━━━━━━━━━
📚 COMPREHENSIVE CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━

Everything You Need:
• All 100 official civics test questions
• Detailed answers and explanations
• U.S. history and government lessons
• Reading and writing test preparation
• Citizenship interview preparation
• Audio pronunciation guides

━━━━━━━━━━━━━━━━━━━━━━━━
✅ PRACTICE & ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━

Test Your Knowledge:
• Full-length practice exams
• Question-by-question review mode
• Instant scoring and feedback
• Performance analytics
• Timed and untimed modes

━━━━━━━━━━━━━━━━━━━━━━━━
📊 SMART PROGRESS TRACKING
━━━━━━━━━━━━━━━━━━━━━━━━

Stay Motivated:
• Visual progress dashboard
• Study streak tracking
• Topic mastery indicators
• Customized study plans
• Achievement system

━━━━━━━━━━━━━━━━━━━━━━━━
🎯 STUDY TOOLS
━━━━━━━━━━━━━━━━━━━━━━━━

Interactive Features:
• Flashcards with spaced repetition
• Bookmarks for important questions
• Offline study mode
• Text-to-speech support
• Dark mode for comfortable reading

━━━━━━━━━━━━━━━━━━━━━━━━
💡 WHY CITIZENNOW?
━━━━━━━━━━━━━━━━━━━━━━━━

✓ Based on official USCIS materials
✓ Developed by education experts
✓ Proven study methodology
✓ Clean, intuitive interface
✓ Regular content updates
✓ Privacy-first approach
✓ No ads or distractions
✓ Works offline

━━━━━━━━━━━━━━━━━━━━━━━━
👥 PERFECT FOR
━━━━━━━━━━━━━━━━━━━━━━━━

• U.S. citizenship test candidates
• Green card holders preparing for naturalization
• ESL/English language learners
• Civics education students
• Anyone interested in U.S. government and history

━━━━━━━━━━━━━━━━━━━━━━━━
🌟 SUCCESS STORIES
━━━━━━━━━━━━━━━━━━━━━━━━

Join thousands of successful students who have passed their citizenship
test using CitizenNow's comprehensive study system!

━━━━━━━━━━━━━━━━━━━━━━━━
📱 KEY FEATURES AT A GLANCE
━━━━━━━━━━━━━━━━━━━━━━━━

• AI study assistant - 24/7 support
• 100 civics questions - Official content
• Practice tests - Realistic exam simulation
• Progress tracking - Know where you stand
• Flashcards - Efficient memorization
• Offline mode - Study anywhere
• Voice support - Improve pronunciation
• Clean design - Distraction-free learning

━━━━━━━━━━━━━━━━━━━━━━━━
🎓 START YOUR JOURNEY TODAY
━━━━━━━━━━━━━━━━━━━━━━━━

Download CitizenNow now and take the first step toward becoming a
U.S. citizen!

━━━━━━━━━━━━━━━━━━━━━━━━
📞 SUPPORT
━━━━━━━━━━━━━━━━━━━━━━━━

Have questions? We're here to help!
Email: support@citizennow.com
Website: https://citizennow.com

Privacy Policy: https://citizennow.com/privacy
Terms of Service: https://citizennow.com/terms

━━━━━━━━━━━━━━━━━━━━━━━━

Note: CitizenNow is an independent study app and is not affiliated with
or endorsed by USCIS or any government agency. Our content is based on
publicly available official materials.

Made with ❤️ for citizenship test candidates
```

- **Max:** 4,000 characters

---

## Privacy & Legal (Android)

### Data Safety Section

Must complete "Data safety" form:

**Data Collection:**

Location: No
Personal Info: Yes (Email)
Financial Info: No
Photos & Videos: No
Audio Files: No
Files & Docs: No
Messages: No
App Activity: Yes (Study progress, test scores)
App Info: No
Device or Other IDs: Yes (User ID)

**Data Usage:**

All data used for:
- App functionality
- Personalization
- Analytics

**Data Sharing:**

Shared with third parties: Yes
- Google (Firebase) - Service provider
- OpenAI - Service provider

**Security Practices:**

Data encrypted in transit: Yes
Data encrypted at rest: Yes
Users can request deletion: Yes
Committed to Family Policy: Yes (if applicable)
Independent security review: No

### Content Rating

Complete questionnaire:
- **Category:** Education
- **Interactive elements:** Users interact, Digital purchases
- No violence, sexual content, controlled substances, etc.

Expected rating: **Everyone** or **Everyone 10+**

---

## Release Management

### Internal Testing

1. **Create Internal Testing Release**
   - Upload APK/AAB
   - Add release notes
   - Add internal testers (up to 100)

2. **Test Thoroughly**
   - Install on devices
   - Test all features
   - Verify payment (if any)
   - Check crashes

### Closed Testing (Alpha/Beta)

1. **Create Closed Testing Track**
   - Can have up to 100 tracks
   - Each track can have multiple releases

2. **Add Testers**
   - Email list
   - Google Group
   - Can have unlimited testers

### Production Release

1. **Create Production Release**
   - Upload final APK/AAB
   - Write release notes
   - Choose rollout:
     - **Staged rollout:** 10%, 25%, 50%, 100%
     - **Full rollout:** 100% immediately

2. **Submit for Review**
   - Usually 1-3 days
   - Can take up to 7 days

### Post-Launch

Monitor:
- Crash rate (should be < 1%)
- ANR rate (should be < 0.5%)
- User ratings
- User reviews
- Installation metrics

---

## Quick Reference Checklist

### iOS App Store
- [ ] Developer account ($99/year)
- [ ] App created in App Store Connect
- [ ] Bundle ID: com.citizennow.app
- [ ] Screenshots (5-10 for each size)
- [ ] App icon (1024x1024)
- [ ] Privacy policy URL
- [ ] Description & keywords
- [ ] Demo account for reviewers
- [ ] Build uploaded
- [ ] Submit for review

### Google Play Store
- [ ] Developer account ($25 one-time)
- [ ] App created in Play Console
- [ ] Package name: com.citizennow.app
- [ ] Screenshots (2-8)
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Privacy policy URL
- [ ] Description
- [ ] Data safety completed
- [ ] Content rating completed
- [ ] AAB uploaded
- [ ] Submit for review

---

**Created:** 2025-11-15
**Version:** 1.0.0
