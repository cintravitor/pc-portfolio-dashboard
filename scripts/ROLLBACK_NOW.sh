#!/bin/bash

# 🔄 Emergency Rollback Script
# Use this if deployment causes critical issues

set -e

echo ""
echo "🔄 =========================================="
echo "   EMERGENCY ROLLBACK SCRIPT"
echo "   =========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}⚠️  WARNING: This will revert all Smoke Detectors changes!${NC}"
echo ""
echo "This script will:"
echo "  1. Show available backup tags"
echo "  2. Reset to selected backup"
echo "  3. Restore clean state"
echo ""

# List available backup tags
echo -e "${YELLOW}Available backup tags:${NC}"
git tag -l "backup-*" | tail -5
echo ""

# Find most recent backup
LATEST_BACKUP=$(git tag -l "backup-pre-smoke-detectors-*" | tail -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}❌ No backup tags found!${NC}"
    echo ""
    echo "Cannot safely rollback without a backup tag."
    echo "You may need to:"
    echo "  1. Check git log for previous commits"
    echo "  2. Manually revert changes"
    echo ""
    exit 1
fi

echo -e "${GREEN}Most recent backup: $LATEST_BACKUP${NC}"
echo ""

# Confirm rollback
echo -e "${RED}Are you SURE you want to rollback?${NC}"
read -p "Type 'ROLLBACK' to confirm: " CONFIRMATION
echo ""

if [ "$CONFIRMATION" != "ROLLBACK" ]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Perform rollback
echo -e "${YELLOW}Rolling back to $LATEST_BACKUP...${NC}"

# Stash any uncommitted changes
if ! git diff --quiet || ! git diff --staged --quiet; then
    echo "Stashing uncommitted changes..."
    git stash save "Pre-rollback stash $(date +%Y%m%d-%H%M%S)"
fi

# Reset to backup tag
git reset --hard $LATEST_BACKUP

echo -e "${GREEN}✅ Rollback complete${NC}"
echo ""

# Summary
echo "=========================================="
echo "   ROLLBACK SUMMARY"
echo "=========================================="
echo ""
echo "  • Rolled back to: $LATEST_BACKUP"
echo "  • Current branch: $CURRENT_BRANCH"
echo "  • Smoke Detectors feature removed"
echo ""

# Verification steps
echo -e "${YELLOW}Verification Steps:${NC}"
echo ""
echo "1. Check file status:"
echo "   git status"
echo ""
echo "2. Open dashboard and verify:"
echo "   - All tabs work correctly"
echo "   - No JavaScript errors"
echo "   - Planning & Action tab has NO Smoke Detectors section"
echo ""
echo "3. If verification passes:"
echo "   git push origin $CURRENT_BRANCH --force-with-lease"
echo "   (Only if you need to update remote)"
echo ""

# Check files
echo -e "${YELLOW}Quick file check:${NC}"
echo ""

if grep -q "calculateSmokeDetectors" src/js/core/data-manager.js 2>/dev/null; then
    echo -e "${RED}⚠️  WARNING: Smoke Detectors code still present in data-manager.js${NC}"
    echo "   Rollback may not be complete"
else
    echo -e "${GREEN}✅ data-manager.js clean${NC}"
fi

if grep -q "createSmokeDetectorsSection" src/js/core/ui/ui-planning.js 2>/dev/null; then
    echo -e "${RED}⚠️  WARNING: Smoke Detectors code still present in ui-planning.js${NC}"
    echo "   Rollback may not be complete"
else
    echo -e "${GREEN}✅ ui-planning.js clean${NC}"
fi

echo ""
echo -e "${GREEN}🔙 Rollback process complete${NC}"
echo ""
echo "Next steps:"
echo "  1. Test the dashboard thoroughly"
echo "  2. Fix the issue that caused rollback"
echo "  3. Re-test before redeploying"
echo ""
