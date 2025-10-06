# 🧪 Smoke Detectors - Quick Testing Guide

> **Phase 2 Complete!** Use this guide to test the new Smoke Detectors feature in the Planning & Action tab.

---

## 🚀 Quick Start (30 seconds)

1. **Open the dashboard** in your browser
2. **Navigate to Planning & Action** tab (click the tab at the top)
3. **Look for "🔍 Smoke Detectors"** section (appears first, before other anomalies)
4. **Click on any badge** with 🚨 or ⚠️ icon
5. **See the magic!** ✨ Modal opens with detailed detector analysis

---

## 📋 What You'll See

### 1. The Smoke Detectors Table

```
🔍 Smoke Detectors (15)  [2 Critical] [13 Warning]

┌─────┬─────────────────────────┬────────────────┬─────────┬────────────┬──────────────────┐
│ SDs │ Product Name            │ Owner          │ Area    │ Maturity   │ Quick Actions    │
├─────┼─────────────────────────┼────────────────┼─────────┼────────────┼──────────────────┤
│ 🚨 4│ Example Product A       │ John Smith     │ HRBP    │ 2. Growth  │ 🔍 View Details │
│ 🚨 3│ Example Product B       │ Jane Doe       │ PATO    │ 4. Decline │ 🔍 View Details │
│ ⚠️ 2│ Example Product C       │ Bob Johnson    │ PJC     │ 1. Dev     │ 🔍 View Details │
│ ⚠️ 1│ Example Product D       │ Alice Williams │ HRBP    │ 3. Mature  │ 🔍 View Details │
└─────┴─────────────────────────┴────────────────┴─────────┴────────────┴──────────────────┘

Smoke Detector Rules:
• Detector 1: 📉 Downward metric trend (3+ consecutive months)
• Detector 2: 🚫 Missing UX or BI metrics
• Detector 3: ⚠️ Decline stage OR Growth/Mature with Sean Ellis Score < 40%
• Detector 4: 👥 High BAU HC allocation (> 2 people)
```

### 2. Click on a Badge → Modal Opens!

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    🔍 Smoke Detector Analysis                      [✕]   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  Example Product A                                                       ║
║  Owner: John Smith    Area: HRBP    Maturity: 2. Growth                ║
║  🚨 4 Smoke Detectors Triggered  [CRITICAL]                            ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  🚨 📉 Downward Metric Trend                           [TRIGGERED]      ║
║  UX metrics and BI metrics showing decline over 3+ consecutive months   ║
║  💡 Recommendation: Investigate root cause of declining metrics.        ║
║                                                                          ║
║  🚨 🚫 Lacking Metrics                                 [TRIGGERED]      ║
║  Missing key metrics: User Experience                                   ║
║  💡 Recommendation: Define and implement tracking for missing metrics.  ║
║                                                                          ║
║  🚨 ⚠️ Maturity Signal                                 [TRIGGERED]      ║
║  Growth stage with Sean Ellis Score below 40% (35%)                     ║
║  💡 Recommendation: Low product-market fit score indicates need for     ║
║      product improvements or repositioning.                             ║
║                                                                          ║
║  ✅ 👥 High BAU HC Allocation                                           ║
║  HC allocation check (requires full data analysis)                      ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                            [Close]  [🔍 View Full Product Details]      ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## ✅ Testing Checklist

### Basic Functionality
- [ ] Navigate to Planning & Action tab
- [ ] Smoke Detectors section appears first
- [ ] Table shows products with detectors > 0
- [ ] Badges display correctly (🚨 for critical, ⚠️ for warning)
- [ ] Severity labels appear (X Critical, Y Warning)

### Badge Interaction
- [ ] Click on a badge opens modal
- [ ] Modal animates in smoothly (fade + slide up)
- [ ] Product name and metadata display correctly
- [ ] Detector count matches badge
- [ ] Critical/Warning label appears correctly

### Detector Analysis
- [ ] All 4 detectors show status (triggered/ok)
- [ ] Triggered detectors show red border with 🚨
- [ ] OK detectors show green border with ✅
- [ ] Recommendations appear for triggered detectors
- [ ] Icons display correctly for each detector type

### Modal Actions
- [ ] Click outside modal closes it
- [ ] Click "Close" button closes modal
- [ ] Body scroll is locked when modal open
- [ ] Body scroll restored when modal closes
- [ ] Click "View Full Product Details" navigates correctly

### Drill-Down Integration
- [ ] "View Full Product Details" closes modal
- [ ] Tab switches to Insights & Analytics
- [ ] Filter pill appears for the product
- [ ] Product details display correctly
- [ ] Can clear filter and return to full view

### Visual Design
- [ ] Table has glassmorphism effect
- [ ] Badges have gradient backgrounds
- [ ] Hover effects work smoothly (badge scales, row highlights)
- [ ] Legend box displays all 4 rules
- [ ] Colors match design system (purple gradients, etc.)

### Mobile Responsiveness
- [ ] Resize browser to mobile width
- [ ] Table has horizontal scroll
- [ ] Modal adapts to mobile size
- [ ] Legend switches to single column
- [ ] Touch interactions work

### Empty State
- [ ] If no products have detectors, "All products are healthy!" message appears
- [ ] Green checkmark icon displays
- [ ] No table is rendered in empty state

### Performance
- [ ] Table loads quickly (< 200ms)
- [ ] Modal opens instantly (< 100ms)
- [ ] Animations are smooth (60fps)
- [ ] No console errors
- [ ] No memory leaks when opening/closing modal multiple times

---

## 🐛 Common Issues & Solutions

### Issue: Smoke Detectors section doesn't appear
**Solution:** 
1. Check console for errors
2. Verify portfolio data is loaded: `window.State.getPortfolioData()`
3. Re-render Planning tab: `window.UIManager.Planning.render()`

### Issue: All products show 0 detectors
**Solution:**
1. Check if detector calculation works: `window.DataManager.calculateSmokeDetectors(product)`
2. Verify product has necessary fields (keyMetricUX, monthlyUX, etc.)
3. Check browser console for errors

### Issue: Modal doesn't open
**Solution:**
1. Check console for JavaScript errors
2. Verify function is exported: `typeof window.openSmokeDetectorDrillDown`
3. Check if product ID is valid

### Issue: Drill-down doesn't work
**Solution:**
1. Verify drill-down infrastructure exists: `window.UIManager.DrillDown`
2. Check Insights & Analytics tab is available
3. Look for console errors

### Issue: Styling looks broken
**Solution:**
1. Clear browser cache
2. Verify CSS file loaded: check network tab
3. Check for CSS conflicts in console

---

## 📊 Expected Results

### For a Healthy Portfolio
```
🔍 Smoke Detectors (0)

✅
All products are healthy!
No smoke detectors triggered
```

### For a Portfolio with At-Risk Products
```
🔍 Smoke Detectors (23)  [5 Critical] [18 Warning]

[Table with 23 products sorted by detector count]

Showing products with:
- 5 products with 3-4 detectors (Critical)
- 18 products with 1-2 detectors (Warning)
```

---

## 🎯 Key Features to Highlight

### 1. Early Warning System
- Proactively identifies at-risk products
- 4 comprehensive detector rules
- Severity-based prioritization

### 2. Detailed Analysis
- Click badge to see which detectors are triggered
- Actionable recommendations for each issue
- Clear visual indicators (red/green cards)

### 3. Seamless Navigation
- One-click drill-down to product details
- Integrates with existing Insights & Analytics tab
- Filter pill shows active drill-down

### 4. Beautiful UI
- Glassmorphism design matching dashboard theme
- Smooth animations and transitions
- Responsive and accessible

---

## 💡 Pro Tips

### For Product Owners
- **Check your products daily** - Look for new smoke detector alerts
- **Prioritize critical products** - Focus on products with 3+ detectors first
- **Use recommendations** - Each triggered detector has actionable advice

### For Executives
- **Monitor trend** - Track if detector count is increasing/decreasing over time
- **Resource allocation** - Use detector data to guide resource decisions
- **Risk mitigation** - Address critical products before they fail

### For HRBPs
- **Identify patterns** - Look for common issues across products
- **Support owners** - Help product owners address triggered detectors
- **Track progress** - Monitor detector reduction after interventions

---

## 🔍 Advanced Testing

### Test with Different Product States

**Test Case 1: Product with all detectors**
```javascript
const criticalProduct = {
    keyMetricUX: '',              // Missing (Detector 2)
    keyMetricBI: '',              // Missing (Detector 2)
    maturity: '4. Decline',       // Decline (Detector 3)
    monthlyUX: [100, 90, 80],     // Downward (Detector 1)
    monthlyBI: [200, 190, 180],   // Downward (Detector 1)
    rawRow: new Array(65).fill(0).concat([5])  // HC > 2 (Detector 4)
};

window.DataManager.calculateSmokeDetectors(criticalProduct);
// Should return: 4
```

**Test Case 2: Product with zero detectors**
```javascript
const healthyProduct = {
    keyMetricUX: '75',
    keyMetricBI: '150',
    maturity: '1. Development',
    monthlyUX: [100, 105, 110, 115],
    monthlyBI: [200, 210, 220, 230],
    rawRow: new Array(65).fill(0).concat([1.5])
};

window.DataManager.calculateSmokeDetectors(healthyProduct);
// Should return: 0
```

---

## 📞 Need Help?

### Documentation
- **Phase 1 Docs:** `docs/features/SMOKE_DETECTORS_PHASE1_COMPLETE.md`
- **Phase 2 Docs:** `docs/features/SMOKE_DETECTORS_PHASE2_COMPLETE.md`
- **Quick Reference:** `SMOKE_DETECTORS_README.md`

### Testing
- **Unit Tests:** Run `window.runSmokeDetectorTests()` in console
- **Visual Test:** Open `test-smoke-detectors.html` in browser

### Debugging
```javascript
// Check if feature is loaded
console.log('DataManager:', !!window.DataManager);
console.log('calculateSmokeDetectors:', typeof window.DataManager?.calculateSmokeDetectors);
console.log('Planning module:', !!window.UIManager?.Planning);

// Test calculation
const products = window.State.getPortfolioData();
products.forEach(p => {
    const count = window.DataManager.calculateSmokeDetectors(p);
    if (count > 0) {
        console.log(`${p.name}: ${count} detector(s)`);
    }
});
```

---

## 🎉 Success Criteria

The feature is working correctly if:
- ✅ Table displays at-risk products sorted by severity
- ✅ Badges are clickable and open modal
- ✅ Modal shows detailed detector breakdown
- ✅ Recommendations are actionable and clear
- ✅ Drill-down navigation works seamlessly
- ✅ UI is responsive and accessible
- ✅ No console errors
- ✅ Performance is smooth (< 200ms render)

---

**Happy Testing!** 🚀

If you encounter any issues, check the documentation or run the unit tests to verify the core logic is working.

*Last Updated: October 6, 2025*  
*Version: Phase 2 Complete*

