# 🔒 Local Testing Guide - Smoke Detectors Feature

**Local Server Running:** ✅ http://localhost:8000  
**Status:** Ready for testing in secure environment  
**GitHub Pages:** Will deploy AFTER local testing passes

---

## 🌐 Your Local Test URLs

### 1. Main Dashboard (Test New Feature Here)
**URL:** http://localhost:8000/index.html

**What to test:**
- Navigate to "Planning & Action" tab
- Look for "🔍 Smoke Detectors" section
- Click on badges to open drill-down modal
- Verify all functionality works

### 2. Unit Test Runner (Run Tests First)
**URL:** http://localhost:8000/test-smoke-detectors.html

**What to expect:**
- Click "▶️ Run All Tests" button
- Should see: "✅ All 32 tests passed!"
- Green success indicator
- No red errors

---

## ✅ Local Testing Workflow (Recommended Order)

### Step 1: Run Unit Tests (CRITICAL)

1. **Open:** http://localhost:8000/test-smoke-detectors.html
2. **Click:** "▶️ Run All Tests" button
3. **Verify:** All 32 tests pass
4. **Check:** No errors in output

**Expected Output:**
```
🧪 Running Smoke Detector Unit Tests...

--- Test Suite 1: Zero Detectors ---
✅ PASS: Product with perfect health (no detectors)
✅ PASS: Mature product with good Sean Ellis Score (no detectors)

[... more tests ...]

==================== TEST SUMMARY ====================
Total Tests:    32
✅ Passed:      32
❌ Failed:      0
======================================================
```

**If any test fails:** ❌ STOP - Do not proceed to deployment

---

### Step 2: Test Dashboard UI

1. **Open:** http://localhost:8000/index.html
2. **Wait for data to load**
3. **Open DevTools:** (F12 or Cmd+Option+I)
4. **Go to Console tab**

**In Console, run:**
```javascript
// Additional verification
window.runSmokeDetectorTests()
```

**Expected:** Same 32/32 passing result

---

### Step 3: Test Planning & Action Tab

1. **Click:** "Planning & Action" tab (top navigation)
2. **Look for:** "🔍 Smoke Detectors" section
3. **Verify it appears FIRST** (before Owner Overload and Data Health)

**If section appears:** ✅ PASS  
**If section missing:** ❌ FAIL - Check console for errors

---

### Step 4: Test Smoke Detector Table

**Check these elements:**

| Element | Expected | Status |
|---------|----------|--------|
| Section title | "🔍 Smoke Detectors (X)" | [ ] |
| Severity badges | "X Critical" and "Y Warning" | [ ] |
| Table headers | SDs, Product Name, Owner, Area, Maturity, Quick Actions | [ ] |
| Product rows | Shows products with detectors > 0 | [ ] |
| SDs badges | 🚨 (critical) or ⚠️ (warning) | [ ] |
| Badges clickable | Cursor changes to pointer on hover | [ ] |
| Legend box | Shows all 4 detector rules | [ ] |

---

### Step 5: Test Badge Click (CRITICAL)

1. **Click on any badge** in the SDs column
2. **Verify modal opens** with smooth animation
3. **Check modal content:**
   - [ ] Product name displayed correctly
   - [ ] Owner, Area, Maturity shown
   - [ ] Detector count matches badge
   - [ ] All 4 detectors show status (✅ or 🚨)
   - [ ] Triggered detectors have recommendations
   - [ ] "CRITICAL" or "WARNING" label appears

---

### Step 6: Test Modal Interactions

**Test these actions:**

1. **Click outside modal** (on dark overlay)
   - [ ] Modal closes smoothly
   - [ ] Page scroll restored

2. **Reopen modal, click "Close" button**
   - [ ] Modal closes
   - [ ] No errors in console

3. **Reopen modal, click "View Full Product Details"**
   - [ ] Modal closes
   - [ ] Tab switches to "Insights & Analytics"
   - [ ] Filter pill appears
   - [ ] Product details show

---

### Step 7: Test Empty State (If Applicable)

**If no products have detectors:**
- [ ] Message: "All products are healthy!"
- [ ] Green checkmark icon (✅) displays
- [ ] No table is rendered
- [ ] Section still appears with empty state message

**To force test empty state:**
```javascript
// In browser console
const originalCalc = window.DataManager.calculateSmokeDetectors;
window.DataManager.calculateSmokeDetectors = () => 0;
window.UIManager.Planning.render();
// Should show empty state

// Restore
window.DataManager.calculateSmokeDetectors = originalCalc;
window.UIManager.Planning.render();
```

---

### Step 8: Test Other Tabs (No Breaking Changes)

**Navigate through all tabs and verify they work:**

1. **Explore Tab**
   - [ ] Product cards display
   - [ ] Search works
   - [ ] Filters work
   - [ ] No console errors

2. **Insights & Analytics Tab**
   - [ ] Metrics calculate correctly
   - [ ] Charts/visualizations display
   - [ ] No console errors

3. **Executive Dashboard Tab** (if exists)
   - [ ] All sections load
   - [ ] No console errors

**If ANY tab breaks:** ❌ STOP - This is a breaking change

---

### Step 9: Test Responsive Design

**Desktop (Current size):**
- [ ] Table displays correctly
- [ ] Modal displays correctly
- [ ] All interactions work

**Tablet (Resize to ~800px width):**
- [ ] Table still readable
- [ ] Modal adapts
- [ ] Navigation works

**Mobile (Resize to ~400px width):**
- [ ] Table has horizontal scroll
- [ ] Modal fits screen
- [ ] Badges still clickable

---

### Step 10: Performance Check

**In DevTools:**
1. Open "Performance" or "Lighthouse" tab
2. Run audit on Planning & Action tab
3. Check metrics:
   - [ ] Page load < 2 seconds
   - [ ] No memory leaks
   - [ ] Smooth animations (60fps)

---

## 🔍 Console Error Check

**Critical Errors to Look For:**

❌ **These are BLOCKERS:**
- `Uncaught TypeError: Cannot read property...`
- `Uncaught ReferenceError: ... is not defined`
- `Failed to fetch` (if using Google Sheets data)
- Any red errors when clicking badges or opening modals

⚠️ **These are OK (warnings):**
- Deprecation warnings
- Font loading warnings
- Image 404s (if not critical images)

---

## 📊 Test Results Checklist

**Copy this and mark as you test:**

```
UNIT TESTS:
[ ] All 32 tests passing (http://localhost:8000/test-smoke-detectors.html)
[ ] Console tests passing (window.runSmokeDetectorTests())

VISUAL TESTS:
[ ] Smoke Detectors section appears in Planning & Action
[ ] Table displays correctly with styling
[ ] Badges show correct icons and counts
[ ] Modal opens and displays correctly
[ ] All 4 detectors show status
[ ] Recommendations appear for triggered detectors

INTERACTION TESTS:
[ ] Badge click opens modal
[ ] Modal close works (button and outside click)
[ ] View Full Product Details navigates correctly
[ ] Drill-down filter works in Insights & Analytics

INTEGRATION TESTS:
[ ] No breaking changes to other tabs
[ ] Search still works
[ ] Filters still work
[ ] Existing drill-downs still work

BROWSER TESTS:
[ ] Chrome/Edge works
[ ] Safari/Firefox works (optional but recommended)

RESPONSIVE TESTS:
[ ] Desktop works
[ ] Tablet works
[ ] Mobile works

PERFORMANCE TESTS:
[ ] Load time acceptable
[ ] No console errors
[ ] Animations smooth

OVERALL RESULT: [ ] PASS / [ ] FAIL
```

---

## ✅ If All Tests Pass (GO FOR DEPLOYMENT)

```bash
# Stop the local server first
# Press Ctrl+C in the terminal where server is running

# Run the deployment script
./TEST_NOW.sh
```

This will:
1. Create backup tag
2. Create feature branch
3. Commit all changes
4. Prepare for deployment to GitHub Pages

---

## ❌ If Any Test Fails (DO NOT DEPLOY)

1. **Document the issue:**
   - What test failed?
   - What error message appeared?
   - Can you reproduce it?

2. **Check console for errors:**
   - Screenshot any red errors
   - Copy error messages

3. **Stop testing:**
   - Do not proceed to deployment
   - Fix the issue first
   - Re-test locally

4. **Rollback if needed:**
   ```bash
   ./ROLLBACK_NOW.sh
   ```

---

## 🚀 After Successful Local Testing

### Deploy to GitHub Pages

```bash
# 1. Commit changes (if not done by TEST_NOW.sh)
git add .
git commit -m "feat: Add Smoke Detectors feature"

# 2. Push to main branch (triggers GitHub Pages deployment)
git push origin main

# 3. Wait 1-2 minutes for GitHub Pages to build

# 4. Test on production URL
open https://cintravitor.github.io/pc-portfolio-dashboard/
```

### Verify Production Deployment

1. **Open:** https://cintravitor.github.io/pc-portfolio-dashboard/
2. **Navigate to Planning & Action**
3. **Verify Smoke Detectors section appears**
4. **Test a few badges to ensure everything works**
5. **Check console for errors**

---

## 🔄 Stopping the Local Server

**When done testing:**

```bash
# Find the terminal where server is running
# Press: Ctrl+C

# Or kill the process
lsof -ti:8000 | xargs kill
```

---

## 🆘 Troubleshooting Local Testing

### Issue: "Cannot connect to localhost:8000"

**Solution:**
```bash
# Check if server is running
lsof -i:8000

# If not running, start it
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"
python3 -m http.server 8000
```

### Issue: "Mixed content" errors

**Solution:**
- This is normal for local testing
- Will not occur on GitHub Pages (HTTPS)
- Can be ignored for local testing

### Issue: Data doesn't load

**Solution:**
```bash
# Check if CSV file exists
ls -la data/*.csv

# If using Google Sheets, check CONFIG.js
# Make sure WEB_APP_URL is set correctly
```

### Issue: Smoke Detectors section doesn't appear

**Solution:**
```javascript
// In browser console
window.State.getPortfolioData().length
// Should be > 0

// Re-render Planning tab
window.UIManager.Planning.render()

// Check for products with detectors
window.State.getPortfolioData()
  .filter(p => window.DataManager.calculateSmokeDetectors(p) > 0)
  .length
```

---

## 📱 Testing on Mobile Device (Optional)

**To test on your phone/tablet:**

1. **Find your local IP:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **On your phone, open:**
   ```
   http://YOUR_IP_ADDRESS:8000/index.html
   ```
   Example: http://192.168.1.100:8000/index.html

3. **Make sure phone is on same WiFi network**

---

## 🎯 Success Criteria

**All these must be TRUE to deploy:**

✅ All 32 unit tests passing  
✅ Smoke Detectors section appears in Planning & Action  
✅ Table displays correctly  
✅ Badges are clickable  
✅ Modal opens and shows correct information  
✅ No console errors  
✅ Other tabs still work (no breaking changes)  
✅ Responsive design works  
✅ Performance acceptable  

**If even ONE is FALSE:** Do not deploy

---

## 📞 Quick Reference

**Local URLs:**
- Dashboard: http://localhost:8000/index.html
- Tests: http://localhost:8000/test-smoke-detectors.html

**Production URL:**
- Live Site: https://cintravitor.github.io/pc-portfolio-dashboard/

**Server Commands:**
- Start: `python3 -m http.server 8000`
- Stop: Press `Ctrl+C`

**Test Commands:**
- Console tests: `window.runSmokeDetectorTests()`
- Re-render: `window.UIManager.Planning.render()`

---

**You're testing locally first - the SAFE way!** ✅

After all local tests pass, you can confidently deploy to GitHub Pages.
