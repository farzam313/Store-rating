#!/bin/bash

# Bash Script to Inject Admin User into Database
# This script injects a user with admin role into the Store Rating database

# Color output helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔐 Injecting admin user into database...${NC}"
echo -e "${CYAN}Database: store-rating${NC}"
echo -e "${CYAN}Username: Karim${NC}"
echo -e "${CYAN}Email: k@c.com${NC}"
echo -e "${CYAN}Password: 1${NC}"
echo -e "${CYAN}Role: admin${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INJECT_SCRIPT="$SCRIPT_DIR/inject-admin-user.js"

# Check if the Node.js script exists
if [ ! -f "$INJECT_SCRIPT" ]; then
    echo -e "${RED}❌ Error: inject-admin-user.js not found at $INJECT_SCRIPT${NC}"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Change to the script directory
cd "$SCRIPT_DIR"

# Run the injection script
echo -e "${CYAN}📦 Running injection script...${NC}"
node "$INJECT_SCRIPT"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Admin user injection completed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to inject admin user. Check the error message above.${NC}"
    exit 1
fi
