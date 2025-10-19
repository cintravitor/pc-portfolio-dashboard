<!-- 58f99850-b676-4384-8195-70c81aeb3f6a bae15be6-1305-48bd-802e-ae7a584b70aa -->
# Repository Structure Refactor

## Overview
Clean up repository by organizing documentation, removing duplicates, and improving code structure without breaking functionality.

## Phase 1: Documentation Reorganization

### 1.1 Keep in Root (Critical Docs)
- `README.md` - Main entry point
- `START_HERE.md` - Quick start guide  
- `CONTRIBUTING.md` - Contribution guidelines
- `index.html` - Main application file

### 1.2 Move to docs/features/
Move feature-specific documentation:
- `AI_FEATURES_USER_STORIES.md`
- `AI_FEATURES_VISUAL_SUMMARY.md`
- `AI_QUICK_START_SUMMARY.md`
- `AI_RECOMMENDATIONS_IMPLEMENTATION_GUIDE.md`
- `AI_CONSOLE_TEST_GUIDE.md`
- `EXPLORER_TAB_USER_JOURNEY.md`
- `FEATURE_REMOVAL_SUMMARY.md`
- `FEATURE_REMOVAL_TEST_PLAN.md`
- `FEATURE_TESTING_GUIDE.md`
- `SMOKE_DETECTORS_README.md`
- `SMOKE_DETECTORS_TESTING_GUIDE.md`

### 1.3 Move to docs/deployment/
Move deployment-related docs:
- `DEPLOYMENT_CHECKLIST_ENHANCED_UI.md`
- `DEPLOYMENT_COMPLETE.md`
- `DEPLOYMENT_ROLLBACK_PLAN.md`
- `DEPLOYMENT_SUMMARY.txt`
- `CHECK_PRODUCTION_URL.md`
- `QUICK_START_DEPLOYMENT.md`
- `PRE_DEPLOYMENT_CHECKLIST.md`

### 1.4 Move to docs/implementation/
Create new folder for implementation summaries:
- `ANALYTICS_BACKEND_SUMMARY.md`
- `ANALYTICS_DASHBOARD_COMPLETE_DELIVERABLE.md`
- `ANALYTICS_DASHBOARD_DEPLOYMENT_PLAN.md`
- `ANALYTICS_DASHBOARD_SUMMARY.md`
- `ANALYTICS_GUIDE.md`
- `ANALYTICS_IMPLEMENTATION_SUMMARY.md`
- `BUG_ANALYSIS_MISSING_METRICS.md`
- `BUG_FIX_QA_REPORT.md`
- `BUG_FIX_SUMMARY.md`
- `CLEAN_METRICS_IMPLEMENTATION_SUMMARY.md`
- `CODE_CHANGES_BUG_FIXES.md`
- `CODE_CHANGES_REFERENCE.md`
- `CREATE_REMAINING_MODULES.md`
- `IMPLEMENTATION_SUMMARY_ENHANCED_UI.md`
- `IMPLEMENTATION_SUMMARY.md`
- `HOTFIX_TESTING_GUIDE_v6.2.4.md`
- `PHASE_2_DELIVERABLES_INDEX.md`
- `PHASE_2_EXECUTIVE_SUMMARY.md`
- `QA_ARCHITECTURAL_REVIEW_REPORT.md`
- `UI_SPLIT_STATUS.md`

### 1.5 Move to docs/guides/
- `LOCAL_TESTING_GUIDE.md`
- `REPOSITORY_GUIDE.md`

## Phase 2: Code Structure Improvements

### 2.1 Remove Duplicate Files
- Delete `src/js/core/ui/ui-cards-OPTIMIZED.js` (keep `ui-cards.js`)
- Verify no imports reference the OPTIMIZED version

### 2.2 Organize Test Files
Create `tests/` folder and move:
- `TEST_SUITE_BUG_FIXES.js` → `tests/bug-fixes.test.js`
- `TEST_SUITE_ENHANCED_UI.js` → `tests/enhanced-ui.test.js`
- `test-analytics.js` → `tests/analytics.test.js`
- `test-smoke-detectors.html` → `tests/smoke-detectors.test.html`

### 2.3 Organize Scripts
Create `scripts/` folder and move:
- `complete-ui-split.sh` → `scripts/`
- `deploy-mercury-theme.sh` → `scripts/`
- `ROLLBACK_NOW.sh` → `scripts/`
- `TEST_NOW.sh` → `scripts/`

## Phase 3: Configuration Documentation

### 3.1 Add API Key Documentation
Update `src/js/config.js` with clear comments:
```javascript
// IMPORTANT: API keys should be changed per environment
// For production, use environment-specific keys
// Never commit real production keys to version control
```

### 3.2 Create .env.example
Add template file showing expected environment variables structure

### 3.3 Update .gitignore
Ensure `.env` files are ignored (if not already)

## Phase 4: Update References

### 4.1 Update README.md
Add new documentation structure with links to organized docs

### 4.2 Update START_HERE.md  
Update any references to moved documentation files

### 4.3 Create docs/README.md
Add index of all documentation with descriptions

## Phase 5: Verification

### 5.1 Test Application
- Open localhost:8080
- Verify all features work (cards, filters, detail panel, AI recommendations)
- Check browser console for errors

### 5.2 Verify Git Status
- Ensure only intended files were moved/deleted
- Check no broken references remain

### 5.3 Commit Changes
Single comprehensive commit with clear message describing restructure

## Breaking Change Prevention

- NO changes to `index.html` script loading order
- NO changes to module exports/imports
- NO changes to CSS file paths
- NO changes to data file locations
- All moves are documentation/tooling only (except removing duplicate JS file)


### To-dos

- [ ] Move 11 feature docs from root to docs/features/
- [ ] Move 7 deployment docs from root to docs/deployment/
- [ ] Create docs/implementation/ and move 18 implementation summaries
- [ ] Move 2 guides from root to docs/guides/
- [ ] Delete ui-cards-OPTIMIZED.js and verify no imports reference it
- [ ] Create tests/ folder and move 4 test files with proper naming
- [ ] Create scripts/ folder and move 4 shell scripts
- [ ] Add API key documentation to config.js and create .env.example
- [ ] Update README.md, START_HERE.md, and create docs/README.md with new structure
- [ ] Test application functionality and verify no broken references
- [ ] Commit all restructure changes with comprehensive message