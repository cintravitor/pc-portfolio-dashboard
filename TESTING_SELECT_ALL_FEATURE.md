# Select All Filter Feature - Manual Testing Guide

## Overview
This document provides a comprehensive testing checklist for the "Select All" multi-select filter enhancement. Complete all tests before deployment.

---

## Pre-Testing Setup

1. **Open the application** in your browser (Chrome, Firefox, or Safari)
2. **Open DevTools Console** (F12 or Cmd+Option+I on Mac)
3. Navigate to the **Explore (Portfolio Overview)** tab
4. Ensure you have test data loaded in the portfolio

---

## Test Suite 1: Core Functionality (AC 1.0/2.0)

### Test 1.1: Area Filter - Select All
- [ ] **Action:** Click on the Area filter dropdown
- [ ] **Expected:** Dropdown opens
- [ ] **Verify:** "Select All" appears as the **first option** with a visual divider below it
- [ ] **Action:** Click "Select All" checkbox (unchecked → checked)
- [ ] **Expected:**
  - All area options become checked ✓
  - All area filter pills appear below the filters
  - Card display updates to show filtered results
  - Console shows analytics log: `[ANALYTICS] filter_select_all_toggle`

### Test 1.2: Area Filter - Deselect All
- [ ] **Action:** Click "Select All" checkbox again (checked → unchecked)
- [ ] **Expected:**
  - All area options become unchecked
  - All filter pills disappear
  - Card display shows all products (no filters)
  - Console shows analytics log with action: "deselect_all"

### Test 1.3: Journey Filter - Select All
- [ ] **Action:** Click on the Journey filter dropdown
- [ ] **Action:** Click "Select All" checkbox
- [ ] **Expected:**
  - All journey options become checked
  - Journey filter pills appear
  - Card display updates accordingly
  - Console shows analytics log

### Test 1.4: Maturity Filter - Select All
- [ ] **Action:** Click on the Maturity filter dropdown
- [ ] **Action:** Click "Select All" checkbox
- [ ] **Expected:**
  - All maturity options become checked
  - Maturity filter pills appear
  - Card display updates accordingly
  - Console shows analytics log

### Test 1.5: Target User Filter - Select All
- [ ] **Action:** Click on the Target User filter dropdown
- [ ] **Action:** Click "Select All" checkbox
- [ ] **Expected:**
  - All target user options become checked
  - Target User filter pills appear
  - Card display updates accordingly
  - Console shows analytics log

### Test 1.6: Owner Filter - Select All
- [ ] **Action:** Click on the Owner filter dropdown
- [ ] **Action:** Click "Select All" checkbox
- [ ] **Expected:**
  - All owner options become checked
  - Owner filter pills appear
  - Card display updates accordingly
  - Console shows analytics log

---

## Test Suite 2: State Reflection (AC 2.0)

### Test 2.1: Partial Selection - "Select All" Remains Unchecked
- [ ] **Setup:** Clear all filters
- [ ] **Action:** Open Area filter and manually select 3 out of 5 area options
- [ ] **Expected:** "Select All" checkbox remains **unchecked**
- [ ] **Action:** Select 1 more area option (4 out of 5)
- [ ] **Expected:** "Select All" checkbox still remains **unchecked**

### Test 2.2: Complete Selection - "Select All" Becomes Checked
- [ ] **Setup:** Continue from Test 2.1 (4 out of 5 selected)
- [ ] **Action:** Select the last remaining area option
- [ ] **Expected:** "Select All" checkbox automatically becomes **checked** ✓

### Test 2.3: Deselect One - "Select All" Becomes Unchecked
- [ ] **Setup:** Continue from Test 2.2 (all selected, "Select All" checked)
- [ ] **Action:** Deselect any 1 area option
- [ ] **Expected:** "Select All" checkbox automatically becomes **unchecked**

---

## Test Suite 3: Accessibility (AC 3.0)

### Test 3.1: Keyboard Navigation - Tab Key
- [ ] **Action:** Click anywhere in the page, then press Tab repeatedly
- [ ] **Expected:** Focus moves through interactive elements
- [ ] **Action:** Tab to reach Area filter dropdown header
- [ ] **Action:** Press Enter/Space to open dropdown
- [ ] **Expected:** Dropdown opens
- [ ] **Action:** Tab to "Select All" checkbox
- [ ] **Expected:** 
  - Focus outline visible around "Select All" option
  - Outline is 2px solid blue (#3b82f6)

### Test 3.2: Keyboard Navigation - Spacebar Toggle
- [ ] **Setup:** Focus on "Select All" checkbox (from Test 3.1)
- [ ] **Action:** Press Spacebar
- [ ] **Expected:** 
  - Checkbox toggles (unchecked → checked)
  - All options become selected
  - Analytics log appears in console

### Test 3.3: Screen Reader Test (VoiceOver on Mac / NVDA on Windows)
- [ ] **Setup:** Enable screen reader (Cmd+F5 on Mac for VoiceOver)
- [ ] **Action:** Navigate to Area filter "Select All" checkbox
- [ ] **Expected:** Screen reader announces:
  - "Select All" (label text)
  - "checkbox" (role)
  - "unchecked" or "checked" (state)

---

## Test Suite 4: Performance (AC 4.0)

### Test 4.1: Performance Measurement - Owner Filter
- [ ] **Setup:** Open DevTools Console
- [ ] **Action:** Click "Select All" on **Owner** filter (largest dataset, ~15 options)
- [ ] **Expected:** Console log shows:
  ```
  ✅ [ANALYTICS] filter_select_all_toggle: { filterType: "owner", action: "select_all", optionsCount: X, durationMs: Y }
  ```
- [ ] **Verify:** `durationMs` value is **< 100ms** ✓
- [ ] **Record:** Actual duration: _________ ms

### Test 4.2: Performance Profiling (Advanced)
- [ ] **Setup:** Open DevTools → Performance tab
- [ ] **Action:** Click "Record" button
- [ ] **Action:** Click "Select All" on Owner filter
- [ ] **Action:** Stop recording after 2 seconds
- [ ] **Expected:** 
  - Total interaction time (DOM update + state + event) < 100ms
  - No significant frame drops
  - No layout thrashing

---

## Test Suite 5: Regression Testing - Critical Path

### Test 5.1: Individual Filter Selection (Without "Select All")
- [ ] **Setup:** Clear all filters
- [ ] **Action:** Select individual options WITHOUT using "Select All"
  - Select Area: "HRBP"
  - Select Journey: "Awareness"
  - Select Maturity: "Growth"
- [ ] **Expected:**
  - Filter pills appear correctly
  - Card display updates correctly
  - No JavaScript errors in console
  - **Existing functionality unchanged** ✓

### Test 5.2: Search Term + Filter Combination
- [ ] **Setup:** Clear all filters
- [ ] **Action:** Enter search term "Portal" in search box
- [ ] **Action:** Click "Select All" on Area filter
- [ ] **Expected:**
  - Results show products matching BOTH search term AND area filters
  - Filter pills show search + area filters
  - Results are correctly filtered (AND logic)

### Test 5.3: Cross-Tab Filter Persistence - Switch to Insights
- [ ] **Setup:** Apply Area "Select All" filter (all areas selected)
- [ ] **Action:** Switch to **Insights** tab
- [ ] **Expected:**
  - Insights tab content reflects area filter
  - Filter state persists

### Test 5.4: Cross-Tab Filter Persistence - Return to Explore
- [ ] **Setup:** Continue from Test 5.3
- [ ] **Action:** Switch back to **Explore** tab
- [ ] **Expected:**
  - All area options still checked
  - "Select All" checkbox still checked ✓
  - Filter state preserved correctly

### Test 5.5: Clear All Filters Button
- [ ] **Setup:** Apply "Select All" on multiple filters (Area, Journey, Owner)
- [ ] **Action:** Click **"Clear All Filters"** button (or X on filter pills)
- [ ] **Expected:**
  - All individual checkboxes become unchecked
  - **All "Select All" checkboxes become unchecked** ✓
  - All filter pills disappear
  - Card display shows all products

---

## Test Suite 6: Cross-Browser Testing

### Test 6.1: Chrome/Edge (Latest)
- [ ] **Browser:** Google Chrome (latest version)
- [ ] **Action:** Execute Tests 1.1, 2.1, 2.2, 3.1, 4.1, 5.1
- [ ] **Expected:** All tests pass
- [ ] **Record:** Chrome Version: _________
- [ ] **Result:** ☐ Pass / ☐ Fail

### Test 6.2: Firefox (Latest)
- [ ] **Browser:** Mozilla Firefox (latest version)
- [ ] **Action:** Execute Tests 1.1, 2.1, 2.2, 3.1, 4.1, 5.1
- [ ] **Expected:** All tests pass
- [ ] **Record:** Firefox Version: _________
- [ ] **Result:** ☐ Pass / ☐ Fail

### Test 6.3: Safari (Latest)
- [ ] **Browser:** Safari (latest version on macOS)
- [ ] **Action:** Execute Tests 1.1, 2.1, 2.2, 3.1, 4.1, 5.1
- [ ] **Expected:** All tests pass
- [ ] **Record:** Safari Version: _________
- [ ] **Result:** ☐ Pass / ☐ Fail

---

## Test Suite 7: Edge Cases

### Test 7.1: Rapid Clicking
- [ ] **Action:** Rapidly click "Select All" checkbox 10 times
- [ ] **Expected:**
  - No JavaScript errors
  - Final state is consistent (either all checked or all unchecked)
  - No performance degradation

### Test 7.2: Multiple Filters with "Select All"
- [ ] **Action:** Click "Select All" on all 5 filters simultaneously
- [ ] **Expected:**
  - All 5 filter types show all options selected
  - Card display shows products matching all filters (AND logic)
  - No performance issues
  - No console errors

### Test 7.3: Empty Dataset
- [ ] **Setup:** If possible, test with an empty dataset (no products)
- [ ] **Expected:**
  - "Select All" appears but has no effect
  - No JavaScript errors

---

## Summary Report

### Test Results
- **Total Tests:** 28
- **Passed:** _____
- **Failed:** _____
- **Success Rate:** _____% (Target: 100%)

### Performance Metrics
- **Average "Select All" duration:** _____ ms (Target: < 100ms)
- **Largest filter (Owner) duration:** _____ ms (Target: < 100ms)

### Issues Found
1. _____________________________________________________________________
2. _____________________________________________________________________
3. _____________________________________________________________________

### Sign-Off
- **Tested By:** _______________________
- **Date:** _______________________
- **Deployment Approved:** ☐ Yes / ☐ No (requires fixes)

---

## Post-Testing Actions

### If All Tests Pass (100%)
- [ ] Mark manual-testing todo as completed
- [ ] Proceed to create commit message and PR description
- [ ] Deploy to staging environment
- [ ] Monitor for 48 hours
- [ ] Deploy to production

### If Tests Fail
- [ ] Document failures in "Issues Found" section
- [ ] Create GitHub issues for each failure
- [ ] Fix issues
- [ ] Re-run failed tests
- [ ] Repeat until 100% pass rate achieved

---

## Quick Reference: Console Analytics Format

Expected console log format for each "Select All" interaction:

```javascript
✅ [ANALYTICS] filter_select_all_toggle: {
  filterType: "area" | "journey" | "maturity" | "targetUser" | "owner",
  action: "select_all" | "deselect_all",
  optionsCount: <number>,
  durationMs: <number>
}
```

**Example:**
```
✅ [ANALYTICS] filter_select_all_toggle: { filterType: "owner", action: "select_all", optionsCount: 15, durationMs: 42.35 }
```

