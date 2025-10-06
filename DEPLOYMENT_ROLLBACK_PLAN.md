# 🔄 Deployment & Rollback Plan - Smoke Detectors Feature

**Date:** October 6, 2025  
**Feature:** Smoke Detectors v1.0  
**Risk Level:** LOW (Non-breaking, additive feature)

---

## 📋 Quick Reference

### Rollback Commands (Emergency)
```bash
# EMERGENCY ROLLBACK (one command)
git checkout backup/pre-smoke-detectors-$(date +%Y%m%d)

# Or if tag exists
git checkout v5.0.0  # Previous stable version
```

### Deployment Status
- **Pre-Deployment:** Testing in progress
- **Deployed:** Not yet
- **Rollback Required:** No

---

## 🚀 Safe Deployment Workflow

### Phase 1: Create Safety Net (BEFORE deployment)

```bash
# 1. Ensure you're on main branch with clean state
git checkout main
git status  # Should show "working tree clean"

# 2. Create backup tag of current STABLE version
git tag -a v5.0.0 -m "Stable: Pre-Smoke Detectors deployment"
git push origin v5.0.0

# 3. Create backup branch (local safety net)
git checkout -b backup/pre-smoke-detectors-$(date +%Y%m%d)
git checkout main

# 4. Create feature branch for smoke detectors
git checkout -b feature/smoke-detectors-v1.0
```

---

### Phase 2: Commit Changes

```bash
# 1. Stage all modified files
git add src/js/core/data-manager.js
git add src/js/core/ui/ui-planning.js
git add src/css/dashboard-style.css
git add docs/features/SMOKE_DETECTORS_PHASE1_COMPLETE.md
git add docs/features/SMOKE_DETECTORS_PHASE2_COMPLETE.md
git add SMOKE_DETECTORS_README.md
git add SMOKE_DETECTORS_TESTING_GUIDE.md
git add test-smoke-detectors.html
git add PRE_DEPLOYMENT_CHECKLIST.md
git add DEPLOYMENT_ROLLBACK_PLAN.md

# 2. Review what will be committed
git diff --staged

# 3. Commit with descriptive message
git commit -m "feat: Add Smoke Detectors feature (Phase 1 + 2)

- Add calculateSmokeDetectors() function with 4 detector rules
- Add 32 comprehensive unit tests (100% pass rate)
- Integrate Smoke Detectors table in Planning & Action tab
- Add clickable badges with detailed drill-down modal
- Add 458 lines of CSS styling (responsive + accessible)
- Add comprehensive documentation and testing guides

Testing:
- All unit tests passing (32/32)
- Visual testing complete
- No breaking changes
- Zero linter errors

Closes: SMOKE-DETECTORS-001"

# 4. Review commit
git show HEAD
```

---

### Phase 3: Deploy to Production

#### Option A: Direct to Main (Small Team)
```bash
# 1. Switch to main
git checkout main

# 2. Merge feature branch
git merge feature/smoke-detectors-v1.0 --no-ff

# 3. Tag new version
git tag -a v5.1.0 -m "Release: Smoke Detectors v1.0

Features:
- Smoke Detectors early warning system
- 4 detector rules for product health
- Planning & Action tab integration
- Drill-down modal with recommendations

Testing: All tests passing
Status: Production ready"

# 4. Push to remote
git push origin main
git push origin v5.1.0

# 5. Verify on production
# Open production URL and test
```

#### Option B: Staging First (Recommended)
```bash
# 1. Deploy to staging branch
git checkout staging
git merge feature/smoke-detectors-v1.0 --no-ff
git push origin staging

# 2. Test in staging environment
# URL: https://staging.your-domain.com

# 3. If staging tests pass, deploy to production
git checkout main
git merge staging --no-ff
git tag -a v5.1.0 -m "Release: Smoke Detectors v1.0"
git push origin main
git push origin v5.1.0
```

---

## 🔙 Rollback Procedures

### Scenario 1: Rollback IMMEDIATELY After Deployment (< 5 minutes)

**If you just pushed and need to undo:**

```bash
# 1. Revert the merge commit
git revert -m 1 HEAD

# 2. Push revert
git push origin main

# 3. Notify team
echo "⚠️ Rolled back Smoke Detectors deployment due to critical issue"
```

**Result:** Production returns to pre-deployment state immediately

---

### Scenario 2: Rollback After Some Time (> 5 minutes)

**If deployment happened earlier and issues discovered:**

```bash
# 1. Find the commit hash before deployment
git log --oneline -10

# Example output:
# abc1234 feat: Add Smoke Detectors feature  ← Current (bad)
# def5678 Previous stable commit              ← Want to return here

# 2. Create rollback branch
git checkout -b rollback/smoke-detectors-$(date +%Y%m%d)

# 3. Revert to previous stable commit
git revert --no-commit abc1234
git commit -m "Rollback: Revert Smoke Detectors deployment

Reason: [Describe issue]
Reverted commit: abc1234
Returning to stable version v5.0.0"

# 4. Merge rollback to main
git checkout main
git merge rollback/smoke-detectors-$(date +%Y%m%d)
git push origin main

# 5. Tag rollback
git tag -a v5.0.1 -m "Rollback: Removed Smoke Detectors due to [issue]"
git push origin v5.0.1
```

**Result:** Smoke Detectors feature removed, everything else intact

---

### Scenario 3: Complete Rollback to Backup Tag

**If everything needs to revert to pre-deployment state:**

```bash
# 1. Checkout backup tag
git checkout v5.0.0

# 2. Create rollback branch
git checkout -b emergency-rollback-$(date +%Y%m%d)

# 3. Force main to match backup
git checkout main
git reset --hard v5.0.0

# 4. Force push (DANGEROUS - only if necessary)
git push origin main --force-with-lease

# ⚠️ CAUTION: This rewrites history. Only use in emergencies!
```

**Result:** Complete reset to v5.0.0 state

---

### Scenario 4: Partial Rollback (Files Only)

**If only specific files need to be reverted:**

```bash
# 1. Revert specific file to previous version
git checkout v5.0.0 -- src/js/core/ui/ui-planning.js

# 2. Commit the reversion
git commit -m "Rollback: Revert ui-planning.js to v5.0.0

Reason: [Issue with UI integration]
Other files unchanged"

# 3. Push
git push origin main

# Result: Only ui-planning.js reverted, other changes remain
```

---

## 🛡️ Backup Files (Manual Safety Net)

**Before deployment, create manual backups:**

```bash
# Create backup directory
mkdir -p backups/pre-smoke-detectors-$(date +%Y%m%d)

# Backup modified files
cp src/js/core/data-manager.js backups/pre-smoke-detectors-$(date +%Y%m%d)/
cp src/js/core/ui/ui-planning.js backups/pre-smoke-detectors-$(date +%Y%m%d)/
cp src/css/dashboard-style.css backups/pre-smoke-detectors-$(date +%Y%m%d)/

# Verify backups
ls -la backups/pre-smoke-detectors-$(date +%Y%m%d)/
```

**To restore from manual backup:**

```bash
# Copy files back
cp backups/pre-smoke-detectors-YYYYMMDD/data-manager.js src/js/core/
cp backups/pre-smoke-detectors-YYYYMMDD/ui-planning.js src/js/core/ui/
cp backups/pre-smoke-detectors-YYYYMMDD/dashboard-style.css src/css/

# Commit restoration
git add -A
git commit -m "Restore: Manual rollback from backup"
git push origin main
```

---

## 🔍 Verification After Rollback

**After any rollback, verify:**

```bash
# 1. Check git status
git status
git log -1  # Verify last commit

# 2. Check which files are present
ls src/js/core/data-manager.js
ls src/js/core/ui/ui-planning.js
ls src/css/dashboard-style.css

# 3. Open dashboard in browser
open index.html

# 4. Test core functionality
# - Navigate to all tabs
# - Verify no JavaScript errors
# - Check all existing features work

# 5. Verify Smoke Detectors removed (if full rollback)
# - Navigate to Planning & Action tab
# - Smoke Detectors section should NOT appear
# - Other anomalies still work
```

---

## 📊 Rollback Decision Matrix

### When to Rollback?

| Issue | Severity | Action |
|-------|----------|--------|
| Critical JavaScript error breaking entire dashboard | **CRITICAL** | Immediate rollback (Scenario 1) |
| Smoke Detectors feature not working | **HIGH** | Rollback within 1 hour (Scenario 2) |
| UI styling issues | **MEDIUM** | Fix forward, don't rollback |
| Minor calculation bug | **LOW** | Fix forward, don't rollback |
| Performance impact | **MEDIUM** | Monitor, rollback if severe |
| Mobile display issues | **MEDIUM** | Fix forward, don't rollback |
| One detector inaccurate | **LOW** | Fix forward, don't rollback |

### Rollback Criteria (Any ONE triggers rollback)

- ❌ Dashboard won't load
- ❌ JavaScript errors in console preventing tab navigation
- ❌ Data corruption or loss
- ❌ Existing features broken
- ❌ Security vulnerability discovered
- ❌ Performance degradation > 50%

### Don't Rollback For (Fix Forward Instead)

- ✅ Minor UI styling issues
- ✅ One detector calculation slightly off
- ✅ Documentation typos
- ✅ Feature requests from users
- ✅ Mobile optimization needed
- ✅ Performance could be better (but acceptable)

---

## 🚨 Emergency Contacts

**In case of deployment issues:**

- **Tech Lead:** [Name] - [Contact]
- **DevOps:** [Name] - [Contact]
- **Product Owner:** [Name] - [Contact]

**Communication Channels:**
- Slack: #emergency-deployment
- Email: tech-alerts@company.com

---

## 📝 Post-Deployment Checklist

**After successful deployment:**

- [ ] Test all critical paths in production
- [ ] Monitor error logs for 24 hours
- [ ] Check performance metrics
- [ ] Gather initial user feedback
- [ ] Document any issues found
- [ ] Update status page if applicable
- [ ] Notify stakeholders of successful deployment

**After rollback (if needed):**

- [ ] Document reason for rollback
- [ ] Create post-mortem report
- [ ] Identify root cause
- [ ] Plan fix strategy
- [ ] Communicate to stakeholders
- [ ] Schedule re-deployment

---

## 📂 File Change Summary

**Files Modified (3):**
1. `src/js/core/data-manager.js` - Added calculateSmokeDetectors() + tests
2. `src/js/core/ui/ui-planning.js` - Added Smoke Detectors table + modal
3. `src/css/dashboard-style.css` - Added styling (458 lines)

**Files Created (7):**
1. `docs/features/SMOKE_DETECTORS_PHASE1_COMPLETE.md`
2. `docs/features/SMOKE_DETECTORS_PHASE2_COMPLETE.md`
3. `SMOKE_DETECTORS_README.md`
4. `SMOKE_DETECTORS_TESTING_GUIDE.md`
5. `test-smoke-detectors.html`
6. `PRE_DEPLOYMENT_CHECKLIST.md`
7. `DEPLOYMENT_ROLLBACK_PLAN.md`

**Git Branches:**
- `backup/pre-smoke-detectors-YYYYMMDD` - Safety backup
- `feature/smoke-detectors-v1.0` - Feature branch
- `main` - Production branch

**Git Tags:**
- `v5.0.0` - Pre-deployment stable version
- `v5.1.0` - Post-deployment with Smoke Detectors

---

## 🔐 Deployment Safeguards

**Implemented Safety Measures:**

1. ✅ **Non-breaking changes** - Additive only, no modifications to existing code
2. ✅ **Feature branch** - Isolated development
3. ✅ **Backup tag** - v5.0.0 preserved
4. ✅ **Backup branch** - Local safety net
5. ✅ **Comprehensive tests** - 32 unit tests + manual testing
6. ✅ **Documentation** - Complete guides for reference
7. ✅ **Rollback plan** - Multiple rollback scenarios documented
8. ✅ **Manual backups** - Physical file copies

---

## ✅ Pre-Rollback Verification

**Before executing any rollback, verify:**

- [ ] Issue is confirmed and reproducible
- [ ] Severity warrants rollback (see decision matrix)
- [ ] Backup/tag exists and is accessible
- [ ] Team is notified
- [ ] Rollback plan is reviewed
- [ ] Downtime window communicated (if any)

---

## 📞 Rollback Execution Log

**If rollback is executed, document here:**

**Date:** _______________  
**Time:** ___:___  
**Executed By:** _______________  
**Scenario Used:** [ ] 1 / [ ] 2 / [ ] 3 / [ ] 4  
**Reason for Rollback:**


**Steps Taken:**
1. 
2. 
3. 

**Verification:**
- [ ] Dashboard loads successfully
- [ ] No JavaScript errors
- [ ] All tabs functional
- [ ] Previous features work correctly

**Post-Rollback Status:** [ ] SUCCESS / [ ] PARTIAL / [ ] FAILED

**Notes:**


---

**Remember:** Rollback is a safety mechanism, not a failure. Better to rollback and fix properly than leave broken code in production.

**Next Steps After Rollback:**
1. Root cause analysis
2. Fix the issue in feature branch
3. Re-test thoroughly
4. Re-deploy when ready
