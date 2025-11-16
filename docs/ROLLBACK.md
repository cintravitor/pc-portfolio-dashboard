# Rollback Instructions - P&C Portfolio Dashboard

## Quick Rollback (v2.0.0 → v1.x)

If you need to rollback the Horizontal Journey Navigation feature immediately:

### Method 1: Revert the Merge Commit (Recommended)

```bash
# Find the merge commit hash
git log --oneline --graph --decorate -10

# Revert the merge commit (replace <merge-commit-hash> with actual hash)
git revert -m 1 <merge-commit-hash>
git push origin main
```

### Method 2: Create Rollback Branch from Previous Production

```bash
# Checkout the previous production commit
git checkout fb425d92b6dc63cb59ac872d86e70e2bc33a203f

# Create a rollback branch
git checkout -b rollback/revert-horizontal-nav

# Push the rollback branch
git push origin rollback/revert-horizontal-nav

# Create PR to merge rollback branch to main
# After approval, merge and deploy
```

### Method 3: Cherry-Pick Revert

```bash
# Create a new branch from main
git checkout main
git pull
git checkout -b hotfix/rollback-horizontal-nav

# Revert the feature branch merge
git log --oneline --grep="horizontal" -10
git revert <commit-hash-1> <commit-hash-2> <commit-hash-3>

# Push and create PR
git push origin hotfix/rollback-horizontal-nav
```

---

## Previous Production State

### Commit Information
- **SHA**: `fb425d92b6dc63cb59ac872d86e70e2bc33a203f`
- **Date**: 2025-11-16 10:44:25 -0300
- **Message**: "docs: Update documentation for Premium Header Redesign v8.4.0"
- **Branch**: main

### Feature Set (v1.x)
- Vertical collapsible journey stage sections
- "All Stages" default view
- Larger solution cards without P&C Area badges
- Vertical metric layout
- Standard modal behavior (90% width, production-stable)

---

## Feature Branch Preservation

The feature branch is preserved for emergency rollback:

```bash
# Feature branch name
feature/horizontal-journey-navigation

# Feature branch backup tag
git tag -a v2.0.0-feature-branch-backup -m "Backup of feature branch before cleanup" feature/horizontal-journey-navigation
git push origin v2.0.0-feature-branch-backup
```

**Do NOT delete the feature branch for at least 2 weeks after deployment.**

---

## Files Changed in v2.0.0

### Modified Files
- `src/css/dashboard-style.css` - Journey navigation styles, modal fixes
- `src/js/core/ui/ui-cards.js` - Journey navigation logic
- `src/js/core/ui/ui-tabs.js` - Tab switching fixes
- `src/js/core/ui/ui-detail-panel.js` - Modal behavior fixes
- `index.html` - Journey navigation HTML structure

### New Files (Created)
- `docs/CHANGELOG.md` - Release changelog
- `docs/ROLLBACK.md` - This file
- `docs/fixes/RESTORED-PRODUCTION-MODAL-BEHAVIOR.md`
- `docs/fixes/REVERTED-TO-PRODUCTION-MODAL-DIMENSIONS.md`
- `docs/features/premium-consistency-improvements.md`
- `MODAL-FIX-COMPLETE.md` (root)

### Deleted Files
- 9 superseded modal troubleshooting documents
- Temporary debugging logs (archived)

---

## Post-Rollback Verification

After rolling back, verify:

1. **Explore Tab**
   - [ ] Vertical journey sections display
   - [ ] Sections are collapsible/expandable
   - [ ] "All Stages" shows by default
   - [ ] All solution cards visible

2. **Solution Cards**
   - [ ] Cards have previous larger size
   - [ ] No P&C Area badges visible
   - [ ] Metric badges in vertical layout
   - [ ] Card interactions work correctly

3. **Modals**
   - [ ] Solution detail modals open correctly
   - [ ] Modal sizing is correct (90%, 1200px max)
   - [ ] Modal scrolling works
   - [ ] Modal close restores page scroll

4. **Filters**
   - [ ] Explore tab filters work
   - [ ] Insights tab filters work
   - [ ] No hidden filters reappear on tab switch

5. **Performance**
   - [ ] Page loads without errors
   - [ ] No console errors
   - [ ] Smooth interactions
   - [ ] No layout shifts

---

## Emergency Contacts

If rollback issues occur:

1. **Check git log**: Verify you're reverting the correct commits
2. **Check console**: Look for JavaScript errors
3. **Clear cache**: Hard refresh (Cmd/Ctrl + Shift + R)
4. **Check network**: Ensure all assets load correctly

---

## Rollback Decision Criteria

### When to Rollback

Roll back if:
- Critical functionality is broken (cards don't load, modals don't open)
- Data is not displaying correctly
- Performance degrades significantly (> 2s load time)
- User reports of broken workflows (> 5 reports in first hour)
- Console errors prevent normal operation

### When NOT to Rollback

Don't rollback for:
- Minor visual inconsistencies (can be hotfixed)
- Individual browser quirks (unless affecting majority)
- User preference for old UI (gather feedback first)
- Performance variations < 500ms
- Edge cases affecting < 1% of users

---

## Re-Deployment After Rollback

If you roll back and want to re-deploy v2.0.0:

1. **Fix the issues** that caused the rollback
2. **Test thoroughly** in local environment
3. **Create new feature branch** from main
4. **Cherry-pick fixes** from original feature branch
5. **Add new commits** with fixes
6. **Follow standard PR process**

```bash
# Create new attempt branch
git checkout main
git pull
git checkout -b feature/horizontal-journey-navigation-v2

# Cherry-pick original commits
git cherry-pick <original-commit-1>
git cherry-pick <original-commit-2>

# Add fixes
git add .
git commit -m "fix: Address rollback issues"

# Push and create PR
git push origin feature/horizontal-journey-navigation-v2
```

---

## Monitoring Post-Deployment

Monitor for 48 hours after deployment:

- Browser console errors (should be 0)
- User feedback/reports
- Analytics: page load times, interaction rates
- Error tracking: Sentry/monitoring tools
- Performance metrics: Core Web Vitals

If no issues within 48 hours, consider deployment stable and can delete feature branch after 2 weeks.

