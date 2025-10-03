# 🔄 Rollback Instructions - Emergency Recovery

## ⚠️ If Deployment Issues Occur

This document provides step-by-step instructions to rollback the two-tab deployment if any issues arise on the live site.

---

## 🚨 Quick Rollback (Recommended)

### **Option 1: Revert to Safety Tag**

This is the **fastest and safest** method:

```bash
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"

# Revert to the pre-deployment state
git reset --hard pre-two-tab-deploy

# Force push to GitHub (this will update GitHub Pages)
git push origin main --force

# Wait 2-3 minutes for GitHub Pages to rebuild
```

**What this does:**
- Returns to the exact state before the two-tab deployment
- Previous working version (commit `f02922b`)
- All data preserved, only code reverted

---

## 🔧 Alternative Rollback Methods

### **Option 2: Revert Last 3 Commits**

```bash
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"

# Revert the 3 commits
git revert HEAD~3..HEAD --no-edit

# Push the revert commits
git push origin main

# Wait 2-3 minutes for GitHub Pages to rebuild
```

**What this does:**
- Creates new commits that undo the changes
- Preserves history
- Safer for collaborative environments

---

### **Option 3: Restore from Local Backups**

```bash
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"

# Restore original files
cp index_backup.html index.html
cp script_backup.js dashboard-script.js
cp GoogleAppsScript_backup.gs GoogleAppsScript.gs

# Commit the restoration
git add index.html dashboard-script.js GoogleAppsScript.gs
git commit -m "emergency: Restore original dashboard from backups"

# Push to GitHub
git push origin main

# Wait 2-3 minutes for GitHub Pages to rebuild
```

**What this does:**
- Uses the backup files we created
- Manual restoration
- Most control over what gets reverted

---

### **Option 4: Cherry-Pick Specific Revert**

If you want to keep some changes but revert others:

```bash
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"

# View commit history
git log --oneline

# Revert specific commit (replace COMMIT_HASH with actual hash)
git revert COMMIT_HASH

# Push to GitHub
git push origin main
```

---

## 📋 Step-by-Step Rollback Process

### **Before Rolling Back**

1. **Document the Issue**
   - What's not working?
   - Error messages in browser console?
   - Screenshot the problem

2. **Check GitHub Pages Status**
   - Visit: https://github.com/cintravitor/pc-portfolio-dashboard/deployments
   - Verify deployment completed
   - Check for build errors

3. **Try Hard Refresh First**
   - Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - This often solves caching issues
   - Test in incognito mode

### **If Still Broken - Execute Rollback**

**Step 1: Choose Rollback Method**
- For fastest recovery: Use Option 1 (Safety Tag)
- For preserving history: Use Option 2 (Revert Commits)
- For manual control: Use Option 3 (Backups)

**Step 2: Execute Rollback**
```bash
# Example: Using Safety Tag (Option 1)
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"
git reset --hard pre-two-tab-deploy
git push origin main --force
```

**Step 3: Verify Rollback**
```bash
# Check git status
git status

# Verify you're on the correct commit
git log --oneline -5

# Should show commit f02922b as HEAD
```

**Step 4: Wait for Deployment**
- Wait 2-3 minutes
- Check: https://github.com/cintravitor/pc-portfolio-dashboard/actions
- Look for green checkmark

**Step 5: Test Live Site**
- Visit: https://cintravitor.github.io/pc-portfolio-dashboard/
- Hard refresh browser
- Verify original dashboard works
- Check console for errors

---

## 🔍 Verification Commands

### **Check Current Deployment State**
```bash
# See current commit on GitHub
git ls-remote origin HEAD

# See local commit
git rev-parse HEAD

# They should match after deployment
```

### **View Deployment History**
```bash
# See recent commits
git log --oneline -10

# See what changed
git show HEAD

# Compare with previous version
git diff HEAD~1
```

---

## 📊 Rollback Decision Tree

```
Is the site completely broken?
├─ YES → Use Option 1 (Safety Tag) - FASTEST
└─ NO
   └─ Are specific features broken?
      ├─ YES → Use Option 4 (Cherry-Pick)
      └─ NO
         └─ Do you need to preserve history?
            ├─ YES → Use Option 2 (Revert)
            └─ NO → Use Option 3 (Backups)
```

---

## 🛟 Emergency Contacts

### **GitHub Pages Status**
- Deployments: https://github.com/cintravitor/pc-portfolio-dashboard/deployments
- Actions: https://github.com/cintravitor/pc-portfolio-dashboard/actions
- Settings: https://github.com/cintravitor/pc-portfolio-dashboard/settings/pages

### **Repository Links**
- Main repo: https://github.com/cintravitor/pc-portfolio-dashboard
- Live site: https://cintravitor.github.io/pc-portfolio-dashboard/
- Commit history: https://github.com/cintravitor/pc-portfolio-dashboard/commits/main

---

## 💾 Backup File Locations

All backup files are in the project root:

```
/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio/
├── index_backup.html          (Original HTML)
├── script_backup.js           (Original JavaScript)
└── GoogleAppsScript_backup.gs (Original Apps Script)
```

These files represent the **last known working state** before the two-tab implementation.

---

## 🧪 Testing After Rollback

After rolling back, verify these features:

- [ ] Page loads without errors
- [ ] Data fetches from Google Sheets
- [ ] Product cards display
- [ ] Search and filters work
- [ ] Card clicks open detail panel
- [ ] Charts render correctly
- [ ] No console errors

**Test Command:**
```javascript
// In browser console
console.log('Dashboard version:', document.querySelector('.header-badge').textContent);
console.log('Has tabs?', document.querySelectorAll('.tab-btn').length > 0);
// Should show: Has tabs? false (if rolled back successfully)
```

---

## 📝 Post-Rollback Actions

### **If Rollback Successful**

1. **Document What Went Wrong**
   - Note the issue in a file
   - Include error messages
   - Add screenshots if available

2. **Notify Users (if applicable)**
   - Inform about temporary rollback
   - Provide timeline for fix

3. **Debug Locally**
   - Test changes in local environment
   - Fix issues before redeploying

### **When Ready to Redeploy**

```bash
# Pull latest from main (after rollback)
git pull origin main

# Cherry-pick the working commits
git cherry-pick COMMIT_HASH

# Or apply fixes and commit
git add .
git commit -m "fix: Resolve deployment issues"

# Push to GitHub
git push origin main
```

---

## 🎯 Common Issues & Solutions

### **Issue: Site shows 404 error**
**Solution:**
- Check GitHub Pages settings
- Ensure source is set to "main" branch
- Verify index.html exists in root

### **Issue: Site shows old version**
**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Test in incognito mode
- Wait 5 minutes for CDN propagation

### **Issue: JavaScript errors in console**
**Solution:**
- Check config.js has correct WEB_APP_URL
- Verify all script files are present
- Check for syntax errors

### **Issue: Tabs not appearing**
**Solution:**
- This is expected if you rolled back
- Original version doesn't have tabs
- Indicates rollback was successful

---

## 🔐 Safety Measures

### **Before Any Rollback**

1. ✅ Take a screenshot of the broken state
2. ✅ Copy console errors
3. ✅ Note what's not working
4. ✅ Check GitHub Actions status
5. ✅ Verify deployment completed

### **During Rollback**

1. ✅ Use recommended Option 1 first
2. ✅ Don't panic - all code is backed up
3. ✅ Wait for GitHub Pages rebuild
4. ✅ Test in incognito mode

### **After Rollback**

1. ✅ Verify site works
2. ✅ Document the issue
3. ✅ Debug locally before redeploying
4. ✅ Test thoroughly before next deploy

---

## 📞 Quick Reference

### **Fastest Rollback (1 command)**
```bash
git reset --hard pre-two-tab-deploy && git push origin main --force
```

### **Safest Rollback (preserves history)**
```bash
git revert HEAD~3..HEAD --no-edit && git push origin main
```

### **Manual Rollback (from backups)**
```bash
cp index_backup.html index.html && cp script_backup.js dashboard-script.js && git add . && git commit -m "rollback" && git push origin main
```

---

## ✅ Rollback Confirmation

After rollback, you should see:

- ✅ Site loads normally
- ✅ Original dashboard (no tabs)
- ✅ All cards display
- ✅ Search and filters work
- ✅ Detail panels open
- ✅ Charts render
- ✅ No console errors

If all checks pass: **Rollback successful!** ✅

---

## 🚀 Re-Deployment Checklist

When ready to try again:

- [ ] Issue identified and fixed
- [ ] Tested locally
- [ ] All features working
- [ ] Console clean
- [ ] Documentation updated
- [ ] Backup tag created
- [ ] Ready to deploy

---

**Remember:** Rollback is always available. All your code is safe in Git history and backup files. Don't hesitate to rollback if something seems wrong - it's better to have a working site while you debug issues locally.

---

**Created:** October 3, 2025  
**Safety Tag:** pre-two-tab-deploy  
**Previous Working Commit:** f02922b

