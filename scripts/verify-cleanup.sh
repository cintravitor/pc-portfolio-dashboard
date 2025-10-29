#!/bin/bash
# Post-Architectural Cleanup Verification Script
# Ensures all cleanup and optimizations were successful
#
# Usage: ./scripts/verify-cleanup.sh
# Exit code: 0 = all checks passed, 1 = one or more checks failed

set -e  # Exit on error (disabled for individual checks)

echo "🔍 Verifying Architectural Cleanup & Optimizations..."
echo "======================================================="

FAILED_CHECKS=0

# ==================== CHECK 1: Orphaned References ====================
echo ""
echo "1. Checking for orphaned references to deleted files..."

if grep -r "analytics-backend" --include="*.js" --include="*.html" src/ 2>/dev/null; then
    echo "   ❌ Found references to deleted analytics-backend files"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
else
    echo "   ✅ No orphaned analytics-backend references"
fi

if grep -r "ui-analytics" --include="*.js" --include="*.html" src/ index.html 2>/dev/null; then
    echo "   ❌ Found references to deleted ui-analytics module"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
else
    echo "   ✅ No orphaned ui-analytics references"
fi

# ==================== CHECK 2: Folder Deletion ====================
echo ""
echo "2. Verifying cleanup folders were deleted..."

if [ -d "archive" ]; then
    echo "   ❌ archive/ folder still exists"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
else
    echo "   ✅ archive/ folder deleted"
fi

if [ -d "backup" ]; then
    echo "   ❌ backup/ folder still exists"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
else
    echo "   ✅ backup/ folder deleted"
fi

# ==================== CHECK 3: Safety Tag Exists ====================
echo ""
echo "3. Verifying safety tag for rollback..."

if git tag | grep -q "archive-pre-cleanup-2025-10-29"; then
    echo "   ✅ Safety tag exists: archive-pre-cleanup-2025-10-29"
else
    echo "   ⚠️  Safety tag missing (may have been created with different name)"
    # Not a failure - tag might exist with different timestamp
fi

# ==================== CHECK 4: Documentation Updates ====================
echo ""
echo "4. Verifying documentation was updated..."

# Check if Analytics tab is still mentioned inappropriately
if grep -i "analytics tab" README.md START_HERE.md 2>/dev/null | grep -v "retired" | grep -v "removed" | grep -v "archive"; then
    echo "   ⚠️  README/START_HERE still mentions Analytics tab (check if intentional)"
else
    echo "   ✅ Documentation cleaned of Analytics tab references"
fi

# Check for correct tab structure
if grep -q "Two Main Views\|🔍 Explore\|💡 Insights" README.md 2>/dev/null; then
    echo "   ✅ Documentation reflects 2-tab interface"
else
    echo "   ⚠️  Documentation may need update for 2-tab interface"
fi

# ==================== CHECK 5: Module Sizes ====================
echo ""
echo "5. Checking module sizes (target: <800 lines for maintainability)..."

for file in src/js/core/ui/ui-*.js; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file" | tr -d ' ')
        filename=$(basename "$file")
        
        if [ "$lines" -gt 1000 ]; then
            echo "   ⚠️  $filename: $lines lines (consider splitting)"
        elif [ "$lines" -gt 800 ]; then
            echo "   ⚠️  $filename: $lines lines (approaching limit)"
        else
            echo "   ✅ $filename: $lines lines"
        fi
    fi
done

# ==================== CHECK 6: Performance Optimizations ====================
echo ""
echo "6. Verifying performance optimizations were applied..."

# Check for caching in ui-governance.js
if grep -q "cachedGovernanceHTML\|CACHE_TTL" src/js/core/ui/ui-governance.js 2>/dev/null; then
    echo "   ✅ Governance caching implemented"
else
    echo "   ❌ Governance caching not found"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check for Chart.js lazy loading
if grep -q "loadChartJs" src/js/core/ui/ui-tabs.js 2>/dev/null; then
    echo "   ✅ Chart.js lazy loading implemented"
else
    echo "   ❌ Chart.js lazy loading not found"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check for filter debouncing
if grep -q "FILTER_DEBOUNCE_MS\|filterDebounceTimer" src/js/core/ui/ui-filters.js 2>/dev/null; then
    echo "   ✅ Filter debouncing implemented"
else
    echo "   ❌ Filter debouncing not found"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check for performance monitoring
if [ -f "src/js/core/performance-monitor.js" ]; then
    echo "   ✅ Performance monitoring module exists"
else
    echo "   ❌ Performance monitoring module not found"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# ==================== CHECK 7: Git Commits ====================
echo ""
echo "7. Verifying git commits for optimizations..."

RECENT_COMMITS=$(git log --oneline -10)

if echo "$RECENT_COMMITS" | grep -q "cache\|caching"; then
    echo "   ✅ Caching commit found"
else
    echo "   ⚠️  No caching-related commits in recent history"
fi

if echo "$RECENT_COMMITS" | grep -q "lazy.*load\|Chart.js"; then
    echo "   ✅ Lazy loading commit found"
else
    echo "   ⚠️  No lazy loading commits in recent history"
fi

# ==================== CHECK 8: File Structure ====================
echo ""
echo "8. Verifying new file structure..."

# Check for new modular files
if [ -f "src/js/core/ui/ui-governance-core.js" ] || [ -f "src/js/core/ui/ui-governance-smoke.js" ]; then
    echo "   ✅ Modular governance files created"
else
    echo "   ⚠️  Modular governance files not found (Phase 1 may be incomplete)"
fi

if [ -f "src/js/workers/governance-worker.js" ]; then
    echo "   ✅ Web Worker file created"
else
    echo "   ⚠️  Web Worker file not found"
fi

if [ -f "src/js/core/performance-monitor.js" ]; then
    echo "   ✅ Performance monitor created"
else
    echo "   ❌ Performance monitor not found"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# ==================== CHECK 9: Index.html Updates ====================
echo ""
echo "9. Verifying index.html was updated..."

if grep -q "Chart.js.*lazy-loaded\|lazy-loaded by ui-tabs" index.html 2>/dev/null; then
    echo "   ✅ index.html updated for Chart.js lazy loading"
else
    echo "   ⚠️  Chart.js lazy loading comment not found in index.html"
fi

if grep -q "performance-monitor" index.html 2>/dev/null; then
    echo "   ✅ Performance monitor loaded in index.html"
else
    echo "   ❌ Performance monitor not loaded in index.html"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# ==================== SUMMARY ====================
echo ""
echo "======================================================="
echo "📊 VERIFICATION SUMMARY"
echo "======================================================="

if [ $FAILED_CHECKS -eq 0 ]; then
    echo "✅ All critical checks passed!"
    echo ""
    echo "🎉 Architectural cleanup and optimizations verified successfully."
    echo "Ready for deployment!"
    exit 0
else
    echo "❌ $FAILED_CHECKS critical check(s) failed"
    echo ""
    echo "⚠️  Please review the failed checks above and fix before deployment."
    exit 1
fi

