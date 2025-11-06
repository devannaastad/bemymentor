#!/bin/bash

# BeMyMentor Production Deployment Script
# This script helps verify everything is configured before deploying

echo "🚀 BeMyMentor Production Deployment Checklist"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "📋 Pre-Deployment Checks:"
echo ""

# Check Node version
echo -n "Checking Node.js version... "
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check if .env.local exists
echo -n "Checking local environment file... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${YELLOW}⚠${NC} .env.local not found (not needed for production)"
fi

# Check if vercel is installed
echo -n "Checking Vercel CLI... "
if command_exists vercel; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${YELLOW}⚠${NC} Not installed (run: npm i -g vercel)"
fi

echo ""
echo "=============================================="
echo ""
echo "📝 Have you completed these steps?"
echo ""
echo "  [ ] Updated Vercel environment variables"
echo "  [ ] Updated Google OAuth redirect URIs"
echo "  [ ] Configured Stripe webhook endpoint"
echo "  [ ] Updated Stripe Connect redirect URIs"
echo "  [ ] Switched to Stripe LIVE keys"
echo "  [ ] Verified domain in Resend"
echo "  [ ] Updated UploadThing allowed origins"
echo "  [ ] Configured DNS records"
echo "  [ ] Added domain to Vercel"
echo ""
echo "=============================================="
echo ""
echo "🔐 Generated Secrets (save these!):"
echo ""
echo "NEXTAUTH_SECRET:"
openssl rand -base64 32
echo ""
echo "CRON_SECRET:"
openssl rand -base64 32
echo ""
echo "=============================================="
echo ""
echo "📚 Documentation:"
echo "  - Full Guide: PRODUCTION_SETUP_GUIDE.md"
echo "  - Quick Checklist: QUICK_PRODUCTION_CHECKLIST.md"
echo "  - Environment Template: .env.production.template"
echo ""
echo "🚀 Ready to deploy?"
echo ""
echo "Run: vercel --prod"
echo ""
