# 🔍 Smoke Detectors Feature - Quick Reference

> **Status:** Phase 1 Complete ✅ | Ready for Phase 2 UI Integration

---

## 📖 What Are Smoke Detectors?

Smoke Detectors are early warning signals that identify products at risk in the P&C Portfolio. Each product can trigger 0-4 detectors based on critical health indicators.

### The Four Detectors

1. **📉 Downward Metric Trend** - 3+ consecutive months of declining UX or BI metrics
2. **🚫 Lacking Metrics** - Missing Key Metric for User Experience or Business Impact
3. **⚠️ Maturity Signal** - Decline stage OR Growth/Mature with Sean Ellis Score < 40%
4. **👥 High BAU HC Allocation** - Total Headcount > 2 people

---

## 🚀 Quick Start

### Run Unit Tests

**Option 1: Browser Console**
```javascript
window.runSmokeDetectorTests();
```

**Option 2: Test HTML Page**
```bash
# Open in browser
open test-smoke-detectors.html
```

### Use the Function

```javascript
// Get a product
const product = window.DataManager.getProductById(0);

// Calculate smoke detectors
const count = window.DataManager.calculateSmokeDetectors(product);

console.log(`Product has ${count} smoke detector(s)`);
```

### Test All Products

```javascript
const products = window.DataManager.getPortfolioData();

products.forEach(product => {
    const count = window.DataManager.calculateSmokeDetectors(product);
    if (count > 0) {
        console.log(`${product.name}: ${count} detector(s)`);
    }
});
```

---

## 📂 Project Structure

```
/src/js/core/
  └── data-manager.js         # Core logic (lines 1207-1371)
                              # Unit tests (lines 1421-1928)

/docs/features/
  └── SMOKE_DETECTORS_PHASE1_COMPLETE.md    # Full documentation

/docs/deployment/
  └── SMOKE_DETECTORS_DEPLOYMENT_PLAN.md    # Phase 2 roadmap

/test-smoke-detectors.html   # Visual test runner
```

---

## ✅ Phase 1 Achievements

- ✅ Core `calculateSmokeDetectors()` function implemented
- ✅ 32 comprehensive unit tests (100% pass rate)
- ✅ All edge cases handled
- ✅ Zero linter errors
- ✅ Production-ready code quality
- ✅ Comprehensive documentation

---

## 🎯 Next Steps (Phase 2)

1. **Add to Product Cards** - Display detector count badge
2. **Create Drill-Down Panel** - Show which detectors triggered
3. **Add Filters** - Filter products by detector count
4. **Executive Dashboard** - Show portfolio-level metrics
5. **Performance Optimization** - Cache calculations
6. **Deploy to Production** - Full testing & rollout

**Estimated Effort:** 2-3 weeks  
**Priority:** High  
**Dependencies:** None (Phase 1 complete)

---

## 📊 Test Results

### Unit Test Summary
```
Total Tests:    32
✅ Passed:      32
❌ Failed:      0
Success Rate:   100%
```

### Test Categories
- Zero Detectors: 2 tests
- Detector 1 (Downward Trend): 5 tests
- Detector 2 (Lacking Metrics): 4 tests
- Detector 3 (Maturity Signal): 7 tests
- Detector 4 (High HC Allocation): 4 tests
- Multiple Detectors: 3 tests
- Edge Cases: 7 tests

---

## 💡 Usage Examples

### Example 1: Zero Detectors
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
// Returns: 0
```

### Example 2: All Detectors Triggered
```javascript
const criticalProduct = {
    keyMetricUX: '',              // Missing metric
    keyMetricBI: '',
    maturity: '4. Decline',       // Decline stage
    monthlyUX: [100, 90, 80],     // Downward trend
    monthlyBI: [200, 190, 180],
    rawRow: new Array(65).fill(0).concat([5])  // HC > 2
};

window.DataManager.calculateSmokeDetectors(criticalProduct);
// Returns: 4
```

### Example 3: Growth with Low Sean Ellis Score
```javascript
const growthProduct = {
    keyMetricUX: '35',            // Sean Ellis Score < 40%
    keyMetricBI: '150',
    maturity: '2. Growth',
    monthlyUX: [100, 105, 110],
    monthlyBI: [200, 210, 220],
    rawRow: new Array(65).fill(0).concat([1])
};

window.DataManager.calculateSmokeDetectors(growthProduct);
// Returns: 1 (Maturity Signal)
```

---

## 🐛 Troubleshooting

### Issue: Tests Not Running
**Solution:** Ensure all modules are loaded
```javascript
// Check if function exists
typeof window.DataManager.calculateSmokeDetectors === 'function'
// Should return: true
```

### Issue: Incorrect Detector Count
**Solution:** Verify product data structure
```javascript
// Check product has required fields
console.log({
    hasUX: !!product.keyMetricUX,
    hasBI: !!product.keyMetricBI,
    hasMaturity: !!product.maturity,
    hasMonthlyUX: Array.isArray(product.monthlyUX),
    hasMonthlyBI: Array.isArray(product.monthlyBI),
    hasRawRow: Array.isArray(product.rawRow)
});
```

### Issue: HC Allocation Not Detected
**Solution:** Check rawRow data
```javascript
// Verify rawRow exists and has data
console.log('rawRow length:', product.rawRow?.length);
console.log('Last 10 values:', product.rawRow?.slice(-10));
```

---

## 📚 Documentation Links

- **Full Documentation:** `docs/features/SMOKE_DETECTORS_PHASE1_COMPLETE.md`
- **Deployment Plan:** `docs/deployment/SMOKE_DETECTORS_DEPLOYMENT_PLAN.md`
- **Code:** `src/js/core/data-manager.js`
- **Tests:** `test-smoke-detectors.html`

---

## 🤝 Contributing

### Before Phase 2 Implementation
1. Review Phase 1 documentation thoroughly
2. Run and understand all unit tests
3. Review deployment plan
4. Discuss UI/UX approach with team

### Code Standards
- Follow existing code style
- Write comprehensive tests for new features
- Update documentation
- No linter errors allowed

---

## 📞 Questions?

- **Technical Issues:** Check troubleshooting section above
- **Documentation:** Review `docs/features/` directory
- **Phase 2 Planning:** See deployment plan document

---

**Last Updated:** October 6, 2025  
**Version:** 1.0.0  
**Status:** Production-Ready (Phase 1)

