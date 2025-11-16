#!/bin/bash

###############################################################################
# CitizenNow Enhanced - Web Deployment Script
# Builds and deploys web version to various hosting platforms
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_TYPE="${1:-production}"  # production, staging, or development
HOSTING_PLATFORM="${2:-netlify}"  # netlify, vercel, firebase, or manual

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        CitizenNow Enhanced - Web Deploy Script          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Pre-flight Checks
###############################################################################

echo -e "${YELLOW}[1/7] Running pre-flight checks...${NC}"

# Check for required tools
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ ERROR: Node.js is required${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ ERROR: npm is required${NC}"; exit 1; }

echo -e "${GREEN}✅ Environment checks passed${NC}"

###############################################################################
# Validate Environment
###############################################################################

echo -e "\n${YELLOW}[2/7] Validating environment configuration...${NC}"

# Select appropriate env file
if [ "$BUILD_TYPE" = "production" ]; then
    ENV_FILE=".env.production"
elif [ "$BUILD_TYPE" = "staging" ]; then
    ENV_FILE=".env.staging"
else
    ENV_FILE=".env"
fi

if [ ! -f "$SCRIPT_DIR/$ENV_FILE" ]; then
    echo -e "${RED}❌ ERROR: $ENV_FILE not found!${NC}"
    echo -e "${YELLOW}Please create $ENV_FILE based on .env.example${NC}"
    exit 1
fi

# Run environment validation
echo -e "${BLUE}Running environment validator...${NC}"
node "$SCRIPT_DIR/env-validator.js" "$BUILD_TYPE"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Environment validation failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment validated${NC}"

###############################################################################
# Load Environment Variables
###############################################################################

echo -e "\n${YELLOW}[3/7] Loading environment variables...${NC}"

# Copy appropriate env file to .env for build
cp "$SCRIPT_DIR/$ENV_FILE" "$SCRIPT_DIR/.env"
echo -e "${GREEN}✅ Using $ENV_FILE${NC}"

###############################################################################
# Install Dependencies
###############################################################################

echo -e "\n${YELLOW}[4/7] Installing dependencies...${NC}"

cd "$SCRIPT_DIR"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

###############################################################################
# Build Web App
###############################################################################

echo -e "\n${YELLOW}[5/7] Building web application...${NC}"
echo -e "${BLUE}This may take 2-5 minutes...${NC}"

# Export for web
npx expo export:web

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit $BUILD_EXIT_CODE
fi

echo -e "${GREEN}✅ Web build completed successfully!${NC}"

# Build output is in web-build directory
WEB_BUILD_DIR="$SCRIPT_DIR/web-build"

if [ ! -d "$WEB_BUILD_DIR" ]; then
    echo -e "${RED}❌ ERROR: web-build directory not found!${NC}"
    exit 1
fi

###############################################################################
# Deploy to Hosting Platform
###############################################################################

echo -e "\n${YELLOW}[6/7] Deploying to $HOSTING_PLATFORM...${NC}"

case $HOSTING_PLATFORM in
  netlify)
    echo -e "${BLUE}Deploying to Netlify...${NC}"

    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        echo -e "${YELLOW}Installing Netlify CLI...${NC}"
        npm install -g netlify-cli
    fi

    # Deploy
    if [ "$BUILD_TYPE" = "production" ]; then
        netlify deploy --prod --dir=web-build
    else
        netlify deploy --dir=web-build
    fi

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully deployed to Netlify${NC}"
    else
        echo -e "${RED}❌ Netlify deployment failed${NC}"
        exit 1
    fi
    ;;

  vercel)
    echo -e "${BLUE}Deploying to Vercel...${NC}"

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi

    # Deploy
    if [ "$BUILD_TYPE" = "production" ]; then
        vercel --prod web-build
    else
        vercel web-build
    fi

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully deployed to Vercel${NC}"
    else
        echo -e "${RED}❌ Vercel deployment failed${NC}"
        exit 1
    fi
    ;;

  firebase)
    echo -e "${BLUE}Deploying to Firebase Hosting...${NC}"

    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        echo -e "${YELLOW}Installing Firebase CLI...${NC}"
        npm install -g firebase-tools
    fi

    # Check for firebase.json
    if [ ! -f "$SCRIPT_DIR/firebase.json" ]; then
        echo -e "${YELLOW}Creating firebase.json...${NC}"
        cat > "$SCRIPT_DIR/firebase.json" <<EOF
{
  "hosting": {
    "public": "web-build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
EOF
    fi

    # Login check
    if ! firebase projects:list &> /dev/null; then
        echo -e "${YELLOW}Please log in to Firebase:${NC}"
        firebase login
    fi

    # Deploy
    firebase deploy --only hosting

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully deployed to Firebase Hosting${NC}"
    else
        echo -e "${RED}❌ Firebase deployment failed${NC}"
        exit 1
    fi
    ;;

  manual)
    echo -e "${BLUE}Manual deployment selected${NC}"
    echo -e "${YELLOW}Build files are ready in: $WEB_BUILD_DIR${NC}"
    echo -e "${YELLOW}Upload these files to your hosting provider${NC}"
    ;;

  *)
    echo -e "${RED}❌ Unknown hosting platform: $HOSTING_PLATFORM${NC}"
    echo -e "${YELLOW}Supported platforms: netlify, vercel, firebase, manual${NC}"
    exit 1
    ;;
esac

###############################################################################
# Post-Deployment Tests
###############################################################################

echo -e "\n${YELLOW}[7/7] Running post-deployment checks...${NC}"

# Check build size
BUILD_SIZE=$(du -sh "$WEB_BUILD_DIR" | cut -f1)
echo -e "${BLUE}Build size: $BUILD_SIZE${NC}"

# Count assets
TOTAL_FILES=$(find "$WEB_BUILD_DIR" -type f | wc -l | tr -d ' ')
echo -e "${BLUE}Total files: $TOTAL_FILES${NC}"

echo -e "${GREEN}✅ Post-deployment checks completed${NC}"

###############################################################################
# Success Summary
###############################################################################

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ DEPLOYMENT SUCCESSFUL                     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Build Type:${NC} $BUILD_TYPE"
echo -e "${BLUE}Platform:${NC} Web"
echo -e "${BLUE}Hosting:${NC} $HOSTING_PLATFORM"
echo -e "${BLUE}Build Size:${NC} $BUILD_SIZE"
echo -e "${BLUE}Environment File:${NC} $ENV_FILE"
echo ""

###############################################################################
# Platform-Specific Next Steps
###############################################################################

echo -e "${YELLOW}Next Steps:${NC}"

case $HOSTING_PLATFORM in
  netlify)
    echo -e "  1. Visit your Netlify dashboard to view the deployment"
    echo -e "  2. Configure custom domain if needed"
    echo -e "  3. Set up SSL certificate (auto-provisioned)"
    echo -e "  4. Monitor analytics and performance"
    ;;

  vercel)
    echo -e "  1. Visit your Vercel dashboard to view the deployment"
    echo -e "  2. Configure custom domain if needed"
    echo -e "  3. SSL is automatically configured"
    echo -e "  4. Review deployment logs and analytics"
    ;;

  firebase)
    echo -e "  1. Visit Firebase Console → Hosting to view deployment"
    echo -e "  2. Configure custom domain in Hosting settings"
    echo -e "  3. SSL certificate auto-provisioned"
    echo -e "  4. Monitor usage in Firebase Console"
    ;;

  manual)
    echo -e "  1. Upload contents of web-build/ to your hosting provider"
    echo -e "  2. Configure web server to serve index.html for all routes"
    echo -e "  3. Enable SSL/HTTPS"
    echo -e "  4. Set up CDN if available"
    ;;
esac

echo ""
echo -e "${YELLOW}Testing:${NC}"
echo -e "  1. Test on desktop browsers (Chrome, Firefox, Safari, Edge)"
echo -e "  2. Test on mobile browsers (iOS Safari, Android Chrome)"
echo -e "  3. Test offline functionality (if enabled)"
echo -e "  4. Verify all API integrations work"
echo -e "  5. Check console for errors"
echo ""

###############################################################################
# Performance Tips
###############################################################################

echo -e "${YELLOW}Performance Optimization:${NC}"
echo -e "  - Enable gzip/brotli compression on your hosting"
echo -e "  - Configure caching headers for static assets"
echo -e "  - Use CDN for faster global delivery"
echo -e "  - Monitor Core Web Vitals with Lighthouse"
echo ""

###############################################################################
# Cleanup
###############################################################################

# Optionally remove the copied .env file
# Uncomment if you want to clean up
# rm "$SCRIPT_DIR/.env"

exit 0
