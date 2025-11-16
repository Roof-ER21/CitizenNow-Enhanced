#!/bin/bash

###############################################################################
# CitizenNow Enhanced - Android Production Build Script
# Builds and submits Android app to Google Play Store
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
BUILD_FORMAT="${2:-aab}"  # aab (for Play Store) or apk (for direct install)
SUBMIT_TO_STORE="${3:-false}"  # Set to 'true' to auto-submit

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       CitizenNow Enhanced - Android Build Script        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Pre-flight Checks
###############################################################################

echo -e "${YELLOW}[1/8] Running pre-flight checks...${NC}"

# Check for required tools
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ ERROR: Node.js is required${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ ERROR: npm is required${NC}"; exit 1; }

echo -e "${GREEN}✅ Environment checks passed${NC}"

###############################################################################
# Install/Update EAS CLI
###############################################################################

echo -e "\n${YELLOW}[2/8] Checking EAS CLI...${NC}"

if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚠️  EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli
else
    echo -e "${GREEN}✅ EAS CLI installed${NC}"
fi

###############################################################################
# Validate Environment
###############################################################################

echo -e "\n${YELLOW}[3/8] Validating environment configuration...${NC}"

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

echo -e "\n${YELLOW}[4/8] Loading environment variables...${NC}"

# Copy appropriate env file to .env for build
cp "$SCRIPT_DIR/$ENV_FILE" "$SCRIPT_DIR/.env"
echo -e "${GREEN}✅ Using $ENV_FILE${NC}"

###############################################################################
# Install Dependencies
###############################################################################

echo -e "\n${YELLOW}[5/8] Installing dependencies...${NC}"

cd "$SCRIPT_DIR"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

###############################################################################
# EAS Login Check
###############################################################################

echo -e "\n${YELLOW}[6/8] Checking EAS authentication...${NC}"

if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to EAS. Please log in:${NC}"
    eas login
fi

echo -e "${GREEN}✅ Authenticated with EAS${NC}"

###############################################################################
# Build Android App
###############################################################################

echo -e "\n${YELLOW}[7/8] Building Android app...${NC}"
echo -e "${BLUE}Build Type: $BUILD_TYPE${NC}"
echo -e "${BLUE}Build Format: $BUILD_FORMAT${NC}"
echo -e "${BLUE}This may take 10-30 minutes...${NC}"
echo ""

# Determine build profile
BUILD_PROFILE="production"
if [ "$BUILD_TYPE" = "staging" ]; then
    BUILD_PROFILE="staging"
elif [ "$BUILD_TYPE" = "development" ]; then
    BUILD_PROFILE="development"
elif [ "$BUILD_FORMAT" = "apk" ]; then
    BUILD_PROFILE="production-apk"
fi

# Build command
eas build --platform android --profile "$BUILD_PROFILE" --non-interactive

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit $BUILD_EXIT_CODE
fi

echo -e "${GREEN}✅ Android build completed successfully!${NC}"

###############################################################################
# Submit to Google Play Store (Optional)
###############################################################################

if [ "$SUBMIT_TO_STORE" = "true" ] && [ "$BUILD_TYPE" = "production" ] && [ "$BUILD_FORMAT" = "aab" ]; then
    echo -e "\n${YELLOW}[8/8] Submitting to Google Play Store...${NC}"

    # Check for service account key
    if [ ! -f "$SCRIPT_DIR/google-play-service-account.json" ]; then
        echo -e "${RED}❌ ERROR: google-play-service-account.json not found!${NC}"
        echo -e "${YELLOW}Please create a service account and download the JSON key${NC}"
        echo -e "${YELLOW}See: https://docs.expo.dev/submit/android/${NC}"
        exit 1
    fi

    eas submit --platform android --latest --profile production

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully submitted to Google Play Store${NC}"
    else
        echo -e "${RED}❌ Submission failed${NC}"
        echo -e "${YELLOW}You can submit manually later using: eas submit -p android${NC}"
    fi
else
    echo -e "\n${YELLOW}[8/8] Skipping Google Play submission${NC}"

    if [ "$BUILD_FORMAT" = "aab" ]; then
        echo -e "${BLUE}To submit later, run: eas submit -p android --latest${NC}"
    else
        echo -e "${BLUE}APK build complete. You can install this directly on devices.${NC}"
    fi
fi

###############################################################################
# Success Summary
###############################################################################

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  ✅ BUILD SUCCESSFUL                      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Build Type:${NC} $BUILD_TYPE"
echo -e "${BLUE}Platform:${NC} Android"
echo -e "${BLUE}Format:${NC} $BUILD_FORMAT"
echo -e "${BLUE}Environment File:${NC} $ENV_FILE"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Download the build from: https://expo.dev/accounts/[your-account]/projects/citizennow-enhanced/builds"

if [ "$BUILD_FORMAT" = "apk" ]; then
    echo -e "  2. Install APK on Android devices for testing"
    echo -e "  3. Build AAB format when ready for Play Store: ${BLUE}./build-android.sh production aab${NC}"
else
    echo -e "  2. Test the AAB using Google Play's internal testing track"
fi

if [ "$SUBMIT_TO_STORE" != "true" ]; then
    echo -e "  3. Submit to Google Play when ready: ${BLUE}eas submit -p android --latest${NC}"
fi

echo ""
echo -e "${YELLOW}Google Play Console:${NC}"
echo -e "  After submission, your build will appear in Google Play Console within 1-2 hours"
echo -e "  You can then promote it through: Internal Testing → Closed Testing → Open Testing → Production"
echo ""

###############################################################################
# Build Info
###############################################################################

echo -e "${YELLOW}Build Format Info:${NC}"
if [ "$BUILD_FORMAT" = "aab" ]; then
    echo -e "  ${GREEN}AAB (Android App Bundle)${NC} - Required for Google Play Store"
    echo -e "  - Optimized downloads for users (smaller size)"
    echo -e "  - Cannot be installed directly on devices"
else
    echo -e "  ${GREEN}APK (Android Package)${NC} - For direct installation"
    echo -e "  - Can be installed on devices via USB or download"
    echo -e "  - Larger file size than AAB"
    echo -e "  - Good for testing and distribution outside Play Store"
fi
echo ""

###############################################################################
# Cleanup
###############################################################################

# Optionally remove the copied .env file
# Uncomment if you want to clean up
# rm "$SCRIPT_DIR/.env"

exit 0
