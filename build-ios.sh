#!/bin/bash

###############################################################################
# CitizenNow Enhanced - iOS Production Build Script
# Builds and submits iOS app to App Store Connect
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
SUBMIT_TO_STORE="${2:-false}"  # Set to 'true' to auto-submit

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         CitizenNow Enhanced - iOS Build Script          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Pre-flight Checks
###############################################################################

echo -e "${YELLOW}[1/8] Running pre-flight checks...${NC}"

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo -e "${RED}❌ ERROR: iOS builds must be run on macOS${NC}"
  exit 1
fi

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
# Build iOS App
###############################################################################

echo -e "\n${YELLOW}[7/8] Building iOS app (Build type: $BUILD_TYPE)...${NC}"
echo -e "${BLUE}This may take 10-30 minutes...${NC}"
echo ""

# Build command based on type
if [ "$BUILD_TYPE" = "production" ]; then
    eas build --platform ios --profile production --non-interactive
elif [ "$BUILD_TYPE" = "staging" ]; then
    eas build --platform ios --profile staging --non-interactive
else
    eas build --platform ios --profile development --non-interactive
fi

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit $BUILD_EXIT_CODE
fi

echo -e "${GREEN}✅ iOS build completed successfully!${NC}"

###############################################################################
# Submit to App Store (Optional)
###############################################################################

if [ "$SUBMIT_TO_STORE" = "true" ] && [ "$BUILD_TYPE" = "production" ]; then
    echo -e "\n${YELLOW}[8/8] Submitting to App Store Connect...${NC}"

    eas submit --platform ios --latest --profile production

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully submitted to App Store Connect${NC}"
    else
        echo -e "${RED}❌ Submission failed${NC}"
        echo -e "${YELLOW}You can submit manually later using: eas submit -p ios${NC}"
    fi
else
    echo -e "\n${YELLOW}[8/8] Skipping App Store submission${NC}"
    echo -e "${BLUE}To submit later, run: eas submit -p ios --latest${NC}"
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
echo -e "${BLUE}Platform:${NC} iOS"
echo -e "${BLUE}Environment File:${NC} $ENV_FILE"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Download the build from: https://expo.dev/accounts/[your-account]/projects/citizennow-enhanced/builds"
echo -e "  2. Test the build on a physical device"

if [ "$SUBMIT_TO_STORE" != "true" ]; then
    echo -e "  3. Submit to App Store when ready: ${BLUE}eas submit -p ios --latest${NC}"
fi

echo ""
echo -e "${YELLOW}Test Flight:${NC}"
echo -e "  After submission, your build will appear in App Store Connect within 10-15 minutes"
echo -e "  You can then distribute to testers via TestFlight"
echo ""

###############################################################################
# Cleanup
###############################################################################

# Optionally remove the copied .env file
# Uncomment if you want to clean up
# rm "$SCRIPT_DIR/.env"

exit 0
