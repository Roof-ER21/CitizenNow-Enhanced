#!/bin/bash

###############################################################################
# CitizenNow Enhanced - Deployment Package Verification Script
# Verifies all deployment files are present and properly configured
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    CitizenNow - Deployment Package Verification         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

function check_file() {
    local file=$1
    local required=$2
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Found: $file${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        if [ "$required" = "required" ]; then
            echo -e "${RED}❌ Missing (Required): $file${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        else
            echo -e "${YELLOW}⚠️  Missing (Optional): $file${NC}"
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
        fi
    fi
}

function check_executable() {
    local file=$1
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if [ -f "$file" ]; then
        if [ -x "$file" ]; then
            echo -e "${GREEN}✅ Executable: $file${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "${YELLOW}⚠️  Not executable: $file (run: chmod +x $file)${NC}"
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
        fi
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

function check_command() {
    local cmd=$1
    local required=$2
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if command -v $cmd &> /dev/null; then
        echo -e "${GREEN}✅ Installed: $cmd${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        if [ "$required" = "required" ]; then
            echo -e "${RED}❌ Not installed (Required): $cmd${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        else
            echo -e "${YELLOW}⚠️  Not installed (Optional): $cmd${NC}"
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
        fi
    fi
}

echo -e "${YELLOW}[1/5] Checking Configuration Files...${NC}"
echo ""
check_file "app.config.js" "required"
check_file "eas.json" "required"
check_file "package.json" "required"
check_file ".env.example" "required"
check_file ".env.production" "optional"
check_file ".env.staging" "optional"
check_file ".gitignore" "required"

echo ""
echo -e "${YELLOW}[2/5] Checking Build Scripts...${NC}"
echo ""
check_executable "build-ios.sh"
check_executable "build-android.sh"
check_executable "deploy-web.sh"
check_file "env-validator.js" "required"

echo ""
echo -e "${YELLOW}[3/5] Checking Documentation...${NC}"
echo ""
check_file "DEPLOYMENT_PACKAGE_README.md" "required"
check_file "DEPLOYMENT_GUIDE.md" "required"
check_file "QUICK_DEPLOY.md" "required"
check_file "DEPLOYMENT_CHECKLIST.md" "required"
check_file "FIREBASE_SETUP_GUIDE.md" "required"
check_file "APP_STORE_PREPARATION.md" "required"
check_file "README.md" "required"

echo ""
echo -e "${YELLOW}[4/5] Checking Required Tools...${NC}"
echo ""
check_command "node" "required"
check_command "npm" "required"
check_command "git" "required"
check_command "eas" "optional"
check_command "firebase" "optional"
check_command "netlify" "optional"
check_command "vercel" "optional"

echo ""
echo -e "${YELLOW}[5/5] Checking Node.js Version...${NC}"
echo ""
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "${GREEN}✅ Node.js version: $NODE_VERSION (>= 18 required)${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ Node.js version: $NODE_VERSION (>= 18 required)${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
else
    echo -e "${RED}❌ Node.js not installed${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    VERIFICATION RESULTS                   ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Total Checks:    $TOTAL_CHECKS"
echo -e "${GREEN}Passed:          $PASSED_CHECKS${NC}"
echo -e "${YELLOW}Warnings:        $WARNING_CHECKS${NC}"
echo -e "${RED}Failed:          $FAILED_CHECKS${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    if [ $WARNING_CHECKS -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║          ✅ PERFECT! Package is complete!                ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${GREEN}You're ready to deploy!${NC}"
        echo ""
        echo -e "Next steps:"
        echo -e "  1. Read: ${BLUE}DEPLOYMENT_GUIDE.md${NC}"
        echo -e "  2. Configure: ${BLUE}.env.production${NC}"
        echo -e "  3. Validate: ${BLUE}node env-validator.js production${NC}"
        echo -e "  4. Deploy: ${BLUE}./build-ios.sh production${NC} or ${BLUE}./build-android.sh production aab${NC}"
        echo ""
        exit 0
    else
        echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║     ⚠️  Package complete with minor warnings            ║${NC}"
        echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Warnings found but package is usable.${NC}"
        echo -e "Review warnings above and fix if needed."
        echo ""

        if [ ! -f ".env.production" ]; then
            echo -e "To create production environment:"
            echo -e "  ${BLUE}cp .env.example .env.production${NC}"
            echo -e "  ${BLUE}nano .env.production${NC}  # Fill in values"
            echo ""
        fi

        if [ ! -x "build-ios.sh" ] || [ ! -x "build-android.sh" ] || [ ! -x "deploy-web.sh" ]; then
            echo -e "To make scripts executable:"
            echo -e "  ${BLUE}chmod +x build-ios.sh build-android.sh deploy-web.sh${NC}"
            echo ""
        fi

        exit 0
    fi
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║        ❌ ERRORS FOUND - Package incomplete              ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Please fix the errors above before deploying.${NC}"
    echo ""

    if ! command -v node &> /dev/null; then
        echo -e "Install Node.js:"
        echo -e "  ${BLUE}https://nodejs.org${NC}"
        echo ""
    fi

    if ! command -v git &> /dev/null; then
        echo -e "Install Git:"
        echo -e "  ${BLUE}https://git-scm.com${NC}"
        echo ""
    fi

    exit 1
fi
