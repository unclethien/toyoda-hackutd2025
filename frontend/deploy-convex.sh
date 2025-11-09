#!/bin/bash

# Deploy Convex functions to self-hosted instance
# This script reads credentials from .env.local and deploys functions

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Deploying Convex functions to self-hosted instance...${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    exit 1
fi

# Read CONVEX_SELF_HOSTED_URL and CONVEX_SELF_HOSTED_ADMIN_KEY from .env.local
CONVEX_URL=$(grep CONVEX_SELF_HOSTED_URL .env.local | cut -d '=' -f2 | tr -d "'\"")
ADMIN_KEY=$(grep CONVEX_SELF_HOSTED_ADMIN_KEY .env.local | cut -d '=' -f2 | tr -d "'\"")

if [ -z "$CONVEX_URL" ] || [ -z "$ADMIN_KEY" ]; then
    echo -e "${RED}❌ Error: CONVEX_SELF_HOSTED_URL or CONVEX_SELF_HOSTED_ADMIN_KEY not found in .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}📡 Convex URL: $CONVEX_URL${NC}"

# Deploy functions
echo -e "${YELLOW}📦 Deploying functions...${NC}"
npx convex dev --url "$CONVEX_URL" --admin-key "$ADMIN_KEY" --once

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo -e "${YELLOW}🔄 IMPORTANT: Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+F5)${NC}"
    echo -e "${YELLOW}   to clear the cached Convex connection${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

