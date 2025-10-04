# Testing Drill-Down Feature - Quick Guide

## Console Testing Commands

Open the browser console (F12) and run these commands to verify the drill-down logic:

### 1. Test Data Preparation
```javascript
// Get portfolio data and calculate metrics
const portfolioData = window.State.getPortfolioData();
const productMetrics = portfolioData.map(product => ({
    ...product,
    riskScore: window.DataManager.calculateRiskScore(product),
    performanceScore: window.DataManager.calculatePerformanceVsTarget(product)
}));

console.log('Total Products:', portfolioData.length);
console.log('Product Metrics:', productMetrics);
```

### 2. Test Risk Distribution
```javascript
// Count products by risk level
const highRisk = productMetrics.filter(p => p.riskScore >= 7);
const mediumRisk = productMetrics.filter(p => p.riskScore >= 4 && p.riskScore < 7);
const lowRisk = productMetrics.filter(p => p.riskScore < 4);

console.log('Risk Distribution:');
console.log('- High Risk (≥7):', highRisk.length);
console.log('- Medium Risk (4-6):', mediumRisk.length);
console.log('- Low Risk (<4):', lowRisk.length);
```

### 3. Test Performance Distribution
```javascript
// Count products by performance level
const belowTarget = productMetrics.filter(p => p.performanceScore > 0 && p.performanceScore < 50);
const atTarget = productMetrics.filter(p => p.performanceScore >= 50 && p.performanceScore < 80);
const aboveTarget = productMetrics.filter(p => p.performanceScore >= 80);

console.log('Performance Distribution:');
console.log('- Below Target (<50%):', belowTarget.length);
console.log('- At Target (50-79%):', atTarget.length);
console.log('- Above Target (≥80%):', aboveTarget.length);
```

### 4. Test Special Categories
```javascript
// Star Performers: Low Risk + High Performance
const starPerformers = productMetrics.filter(p => p.riskScore < 4 && p.performanceScore >= 80);
console.log('Star Performers:', starPerformers.length);

// Critical Products: High Risk + Low Performance
const critical = productMetrics.filter(p => p.riskScore >= 7 && p.performanceScore < 50);
console.log('Critical Products:', critical.length);
```

### 5. Test Drill-Down Functions
```javascript
// Test high-risk drill-down
window.drillDownToTacticalView('high-risk');

// Test other drill-downs (run one at a time)
// window.drillDownToTacticalView('medium-risk');
// window.drillDownToTacticalView('low-risk');
// window.drillDownToTacticalView('below-target');
// window.drillDownToTacticalView('star-performers');
// window.drillDownToTacticalView('products-at-risk');
```

## Manual Testing Checklist

### Pre-requisites
- [x] Dashboard loaded: http://localhost:8080
- [x] Data loaded successfully (click "Load Data")
- [x] Strategic View tab accessible

### Test Each KPI Card

#### 1. High Risk Products 🚨
- [ ] Click the card
- [ ] Verify automatic navigation to Portfolio Overview
- [ ] Check notification banner appears
- [ ] Confirm banner says "High Risk Products (Risk Score ≥ 7)"
- [ ] Verify product count matches the card number
- [ ] Spot check 2-3 products have red/orange risk indicators

#### 2. Medium Risk Products ⚠️
- [ ] Return to Strategic View
- [ ] Click the card
- [ ] Verify filtering works correctly
- [ ] Check products are in the 4-6 risk range

#### 3. Low Risk Products ✅
- [ ] Return to Strategic View
- [ ] Click the card
- [ ] Verify only low-risk products shown
- [ ] Check green/low-risk indicators

#### 4. Below Target 📉
- [ ] Return to Strategic View
- [ ] Click the card
- [ ] Verify products have performance < 50%
- [ ] Check for performance indicators

#### 5. Star Performers 🌟
- [ ] Return to Strategic View
- [ ] Click the card
- [ ] Verify products are both low-risk AND high-performance
- [ ] Check these are the portfolio's best products

#### 6. Critical Products ⛔
- [ ] Return to Strategic View
- [ ] Click the card
- [ ] Verify products are high-risk AND low-performance
- [ ] Check these need immediate attention

### Test Notification Banner

- [ ] Banner appears immediately after drill-down
- [ ] Banner shows correct filter description
- [ ] Banner shows correct product count
- [ ] Click "×" button dismisses banner
- [ ] After dismissal, all products are shown again
- [ ] Banner auto-dismisses after ~10 seconds

### Test UI/UX

- [ ] Cards have hover effects (lift + glow)
- [ ] Arrow moves on hover
- [ ] Cards are clearly clickable
- [ ] Tab switching is smooth
- [ ] No console errors during drill-down
- [ ] Page scrolls to top after drill-down

### Test Responsive Design

- [ ] Desktop (>1024px): Cards in 3-column grid
- [ ] Tablet (768-1024px): Cards in 2-column grid
- [ ] Mobile (<768px): Cards in single column
- [ ] All cards remain clickable on mobile
- [ ] Notification banner is readable on mobile

### Test Edge Cases

- [ ] Click same card twice (should re-filter correctly)
- [ ] Click different cards in sequence (should switch filters)
- [ ] Manually apply filters after drill-down (should combine)
- [ ] Use search after drill-down (should work on filtered set)
- [ ] Refresh page after drill-down (should reset to full portfolio)

## Expected Console Output

When testing via console, you should see logs like:

```
🎯 Drill-down initiated: high-risk
📊 Filtered products: 15 out of 127
Rendering 15 cards...
✅ Drill-down complete
```

## Troubleshooting

### Issue: Cards don't appear
- **Solution**: Verify you're on the Strategic View tab
- **Solution**: Ensure data is loaded (check Portfolio Overview first)

### Issue: Drill-down doesn't filter
- **Solution**: Check console for errors
- **Solution**: Verify `calculateRiskScore` and `calculatePerformanceVsTarget` are exported

### Issue: Wrong product count
- **Solution**: Verify risk scoring logic in data-manager.js
- **Solution**: Check filter criteria match the KPI definitions

### Issue: Notification doesn't show
- **Solution**: Check `#content-left` element exists
- **Solution**: Verify CSS is loaded correctly

### Issue: Cards not clickable
- **Solution**: Check `window.drillDownToTacticalView` is defined globally
- **Solution**: Verify onclick handlers in HTML

## Performance Metrics

Expected performance:
- **Calculation Time**: < 50ms for 100-200 products
- **Tab Switch**: < 100ms
- **Render Time**: < 200ms
- **Total Drill-Down**: < 500ms

Check in console:
```javascript
console.time('drill-down');
window.drillDownToTacticalView('high-risk');
console.timeEnd('drill-down');
```

---

**Test Status**: Ready to begin
**Priority**: High - Core executive feature
**Estimated Time**: 15 minutes for full test suite

