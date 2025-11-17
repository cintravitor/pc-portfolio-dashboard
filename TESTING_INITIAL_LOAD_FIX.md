# Testing Guide: Initial Load Retry Logic Fix

## Quick Testing Script

Open the dashboard in your browser and follow these test scenarios:

---

## ✅ Test Scenario 1: Fresh Initial Load (No Cache)

**Objective**: Verify that a first-time user can load the dashboard successfully without errors.

**Steps**:
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Run: `localStorage.clear()`
4. Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+F5 on Windows)

**Expected Results**:
- ✅ Loading screen appears with text "Loading Portfolio Data..."
- ✅ Text "Connecting to Google Sheets" is visible
- ✅ If slow, text updates to "Apps Script warming up (this is normal for first load)"
- ✅ Data loads successfully and cards display
- ✅ NO "⚠️ Error Loading Data" message appears
- ✅ Console shows retry attempts (e.g., "🔄 Fetch attempt 1/3")

**Console Output to Look For**:
```
🔄 Fetch attempt 1/3 (timeout: 45s)
✅ Successfully fetched X rows
✅ Processed X products
```

**If Test Fails**:
- Check console for error messages
- Verify CONFIG.WEB_APP_URL is correct in config.js
- Confirm Google Apps Script endpoint is deployed and accessible

---

## ✅ Test Scenario 2: Simulated Cold Start (Network Throttling)

**Objective**: Verify retry logic works correctly under slow network conditions.

**Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Set throttling to "Slow 3G" (dropdown near top)
4. Clear localStorage: `localStorage.clear()`
5. Refresh the page

**Expected Results**:
- ✅ First attempt times out after 45 seconds
- ✅ Loading text updates: "Still Loading... Apps Script warming up"
- ✅ Second attempt starts automatically
- ✅ Console shows: "⏳ Waiting Xms before retry..."
- ✅ Eventually succeeds (may take 2-3 minutes on Slow 3G)
- ✅ Data loads and displays correctly

**Console Output to Look For**:
```
🔄 Fetch attempt 1/3 (timeout: 45s)
⚠️ Fetch attempt 1/3 failed: AbortError
⏳ Waiting 1000ms before retry...
🔄 Fetch attempt 2/3 (timeout: 60s)
✅ Fetch succeeded on attempt 2
```

**After Test**:
- Remember to disable Network throttling!

---

## ✅ Test Scenario 3: Catastrophic Failure (Invalid Endpoint)

**Objective**: Verify appropriate error message appears only for truly unrecoverable failures.

**Steps**:
1. Open `src/js/config.js`
2. Temporarily change `WEB_APP_URL` to an invalid URL:
   ```javascript
   WEB_APP_URL: 'https://invalid-url-that-does-not-exist.com/exec',
   ```
3. Save the file
4. Clear localStorage: `localStorage.clear()`
5. Refresh the page

**Expected Results**:
- ✅ Retry logic attempts all 3 tries (console shows attempts)
- ✅ After all attempts fail, displays: "Unable to Connect"
- ✅ Error message: "Could not reach Google Sheets after multiple attempts"
- ✅ "Retry" button appears (NOT "Try Again")
- ✅ NO old "⚠️ Error Loading Data" UI appears
- ✅ Console shows: "❌ All 3 fetch attempts failed"

**Console Output to Look For**:
```
🔄 Fetch attempt 1/3 (timeout: 45s)
⚠️ Fetch attempt 1/3 failed: TypeError: Failed to fetch
⏳ Waiting 1000ms before retry...
🔄 Fetch attempt 2/3 (timeout: 60s)
⚠️ Fetch attempt 2/3 failed: TypeError: Failed to fetch
⏳ Waiting 2000ms before retry...
🔄 Fetch attempt 3/3 (timeout: 90s)
⚠️ Fetch attempt 3/3 failed: TypeError: Failed to fetch
❌ All 3 fetch attempts failed
❌ CRITICAL: All data fetch attempts failed
```

**After Test**:
- ⚠️ **CRITICAL**: Restore the correct `WEB_APP_URL` in config.js!
- Save and refresh to confirm dashboard works again

---

## ✅ Test Scenario 4: Cached Data Load

**Objective**: Verify cached data loads instantly and background refresh works.

**Steps**:
1. Ensure dashboard is working (load it successfully once)
2. Verify data is cached: `localStorage.getItem('pnc_portfolio_data')`
3. Refresh the page normally (F5 or Cmd+R)

**Expected Results**:
- ✅ Data appears INSTANTLY (no loading screen flash)
- ✅ Cards render immediately from cache
- ✅ Background fetch happens silently (check console)
- ✅ If background fetch succeeds, data updates seamlessly
- ✅ If background fetch fails, cached data remains (no error shown)

**Console Output to Look For**:
```
🔄 Fetch attempt 1/3 (timeout: 45s)
✅ Successfully fetched X rows
```

**Special Case**: If background fetch fails but cache exists:
```
❌ CRITICAL: All data fetch attempts failed
✅ Loading from cache as fallback
```

---

## ✅ Test Scenario 5: Refresh Button

**Objective**: Verify manual refresh button triggers the same retry logic.

**Steps**:
1. Load dashboard successfully
2. Click the "🔄 Refresh" button in the header

**Expected Results**:
- ✅ Loading screen appears
- ✅ Retry logic activates if needed
- ✅ Data refreshes successfully
- ✅ "Last updated" timestamp updates

---

## 🎯 Success Criteria Summary

All tests PASS if:

1. ✅ **First-time users** can load dashboard without clicking "Try Again"
2. ✅ **Retry logic** works transparently (user sees progress)
3. ✅ **Catastrophic failures** show clear error (only when no cache exists)
4. ✅ **Cached loads** are instant and seamless
5. ✅ **NO old error UI** appears during normal operation
6. ✅ **Console logs** show clear retry progression

---

## 🐛 Troubleshooting

### Issue: Data never loads, even with retries

**Solution**:
- Check `config.js` for correct `WEB_APP_URL`
- Verify Google Apps Script is deployed as Web App
- Check Apps Script permissions (should be "Anyone")

### Issue: Retries don't happen

**Solution**:
- Check console for errors in retry logic
- Verify `window.Utils.publishEnhanced` exists
- Check that `data-fetching.js` loaded correctly

### Issue: Old error UI still appears

**Solution**:
- Hard refresh (Cmd+Shift+R) to clear browser cache
- Verify `index.html` error div was removed
- Check that `ui-manager-compat.js` has no showError/hideError methods

---

## 📊 Performance Benchmarks

Expected timings:

| Scenario | Expected Duration | Acceptable Max |
|----------|------------------|----------------|
| **Cached load** | < 200ms | 500ms |
| **First successful fetch** | 2-8 seconds | 45 seconds |
| **Cold start (1st attempt)** | 5-15 seconds | 45 seconds |
| **Cold start (2nd attempt)** | 3-10 seconds | 60 seconds |
| **All retries exhausted** | ~3 minutes | 195 seconds |

---

## ✅ Test Complete

After completing all scenarios successfully, the fix is ready for production deployment.

**Next Steps**:
1. ✅ All tests pass
2. ✅ Commit changes to feature branch
3. ✅ Push to repository
4. ✅ Deploy to production
5. ✅ Monitor first-time user loads for 24 hours

