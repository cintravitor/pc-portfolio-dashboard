# Smoke Detectors Feature - Deployment Plan

**Feature:** Smoke Detectors  
**Current Phase:** Phase 1 Complete ✅  
**Next Phase:** Phase 2 - UI Integration  
**Document Version:** 1.0  
**Last Updated:** October 6, 2025

---

## 📊 Project Status

### Phase 1: Logic & Unit Tests ✅ COMPLETE
- ✅ Core function `calculateSmokeDetectors()` implemented
- ✅ 32 comprehensive unit tests written and passing
- ✅ All edge cases handled
- ✅ Zero linter errors
- ✅ Documentation complete

### Phase 2: UI Integration & Deployment 🚧 PENDING
- ⏳ UI components (cards, badges, filters)
- ⏳ Integration testing
- ⏳ Performance optimization
- ⏳ User acceptance testing
- ⏳ Production deployment

---

## 🎯 Phase 2 Implementation Checklist

### Step 1: Data Integration (Priority: HIGH)

#### 1.1 Calculate Detectors on Data Load
**File:** `src/js/core/data-manager.js`
**Location:** `fetchSheetData()` function

**Implementation:**
```javascript
// After line 138 in fetchSheetData(), add:
.map((row, index) => {
    const product = {
        id: index,
        area: (row[columnMapping.area] || '').toString().trim(),
        // ... existing fields ...
        rawRow: row
    };
    
    // Calculate smoke detectors
    product.smokeDetectorCount = calculateSmokeDetectors(product);
    
    return product;
});
```

**Test:**
```javascript
// Verify detector count is calculated
const products = window.DataManager.getPortfolioData();
console.log(products[0].smokeDetectorCount); // Should output 0-4
```

---

### Step 2: Product Card UI (Priority: HIGH)

#### 2.1 Add Smoke Detector Badge
**File:** `src/js/ui/card-manager.js`
**Location:** `createProductCard()` function

**Implementation:**
```javascript
// Add after status badges (around line 80-100)
function getSmokeDetectorBadge(count) {
    if (count === 0) return ''; // No badge if no detectors
    
    const severityClass = count >= 3 ? 'critical' : 'warning';
    const icon = count >= 3 ? '🚨' : '⚠️';
    
    return `
        <div class="smoke-detector-badge ${severityClass}" 
             title="${count} smoke detector${count > 1 ? 's' : ''} triggered">
            ${icon} ${count}
        </div>
    `;
}

// In createProductCard(), add:
const smokeDetectorBadge = getSmokeDetectorBadge(product.smokeDetectorCount || 0);
```

**CSS:** Add to `src/css/dashboard-style.css`
```css
.smoke-detector-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin-left: 8px;
}

.smoke-detector-badge.warning {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fbbf24;
}

.smoke-detector-badge.critical {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #ef4444;
}
```

---

### Step 3: Detailed Detector View (Priority: MEDIUM)

#### 3.1 Create Drill-Down Panel
**File:** New file `src/js/ui/smoke-detector-panel.js`

**Implementation:**
```javascript
/**
 * Create detailed smoke detector panel showing which detectors are triggered
 */
function createSmokeDetectorPanel(product) {
    const detectors = analyzeSmokeDetectors(product);
    
    return `
        <div class="smoke-detector-panel">
            <h3>🔍 Smoke Detector Analysis</h3>
            <div class="detector-list">
                ${detectors.map(d => `
                    <div class="detector-item ${d.triggered ? 'triggered' : 'ok'}">
                        <span class="detector-icon">${d.triggered ? '🚨' : '✅'}</span>
                        <div class="detector-info">
                            <strong>${d.name}</strong>
                            <p>${d.description}</p>
                            ${d.triggered ? `<p class="recommendation">${d.recommendation}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Analyze which specific detectors are triggered
 */
function analyzeSmokeDetectors(product) {
    // Return detailed breakdown of each detector
    // This provides context for the UI
}
```

---

### Step 4: Filtering & Sorting (Priority: MEDIUM)

#### 4.1 Add Smoke Detector Filter
**File:** `src/js/ui/filter-manager.js`

**Implementation:**
```javascript
// Add new filter option
<div class="filter-group">
    <label>
        <input type="checkbox" id="filter-smoke-detectors" />
        Show only products with smoke detectors
    </label>
</div>

// In applyFilters()
const smokeDetectorFilter = document.getElementById('filter-smoke-detectors').checked;

if (smokeDetectorFilter) {
    filteredData = filteredData.filter(p => 
        (p.smokeDetectorCount || 0) > 0
    );
}
```

#### 4.2 Add Sort by Detector Count
**File:** `src/js/core/data-manager.js`

**Implementation:**
```javascript
// In sortData() function, add new case:
case 'smoke-detectors-desc':
    return sortedData.sort((a, b) => 
        (b.smokeDetectorCount || 0) - (a.smokeDetectorCount || 0)
    );
```

---

### Step 5: Executive Dashboard Integration (Priority: HIGH)

#### 5.1 Add At-Risk Products Metric
**File:** `src/js/core/data-manager.js`

**Implementation:**
```javascript
// In calculatePortfolioMetrics(), add:

// Products with 3+ smoke detectors (critical)
const criticalProducts = productMetrics.filter(p => 
    p.smokeDetectorCount >= 3
).length;

// Add to return object:
metrics.criticalProducts = criticalProducts;
metrics.detectorBreakdown = {
    none: productMetrics.filter(p => p.smokeDetectorCount === 0).length,
    low: productMetrics.filter(p => p.smokeDetectorCount === 1).length,
    medium: productMetrics.filter(p => p.smokeDetectorCount === 2).length,
    high: productMetrics.filter(p => p.smokeDetectorCount >= 3).length
};
```

#### 5.2 Add Executive View Card
**File:** `src/js/views/executive-view.js`

**Implementation:**
```javascript
// Add new metric card
const atRiskCard = `
    <div class="metric-card critical">
        <div class="metric-icon">🚨</div>
        <div class="metric-content">
            <div class="metric-label">Critical Products</div>
            <div class="metric-value">${metrics.criticalProducts}</div>
            <div class="metric-subtitle">3+ smoke detectors</div>
        </div>
    </div>
`;
```

---

### Step 6: Performance Optimization (Priority: MEDIUM)

#### 6.1 Cache Detector Calculations
**Strategy:** Calculate once on data load, store in product object

**Benefits:**
- No repeated calculations during filtering/sorting
- Faster UI updates
- Better performance with large portfolios

#### 6.2 Lazy Load Detailed Panels
**Strategy:** Only render detailed detector breakdown when user clicks

**Implementation:**
```javascript
// Load panel on demand
card.addEventListener('click', () => {
    if (!card.dataset.panelLoaded) {
        const panel = createSmokeDetectorPanel(product);
        card.appendChild(panel);
        card.dataset.panelLoaded = 'true';
    }
});
```

---

### Step 7: Testing Strategy

#### 7.1 Unit Tests ✅ COMPLETE
- [x] 32 comprehensive tests
- [x] All edge cases covered
- [x] 100% pass rate

#### 7.2 Integration Tests 🚧 PENDING
**Test Cases:**
```
□ Detector count displays correctly on product cards
□ Badge color changes based on severity
□ Filter shows only products with detectors
□ Sort by detector count works correctly
□ Executive dashboard shows correct counts
□ Drill-down panel shows correct detector breakdown
□ Performance: Portfolio of 100+ products loads in < 2s
```

#### 7.3 User Acceptance Tests 🚧 PENDING
**Test Scenarios:**
```
□ Product owner can quickly identify at-risk products
□ Executive can see portfolio-level detector metrics
□ HRBP can filter and prioritize intervention
□ Detailed panel provides actionable recommendations
□ Mobile responsiveness works correctly
```

---

## 🚀 Deployment Steps

### Pre-Deployment Checklist

1. **Code Review**
   - [ ] All Phase 2 code reviewed by senior engineer
   - [ ] Security considerations addressed
   - [ ] Performance benchmarks met
   - [ ] Accessibility standards met (WCAG 2.1 AA)

2. **Testing**
   - [ ] All unit tests passing
   - [ ] Integration tests complete
   - [ ] UAT sign-off received
   - [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
   - [ ] Mobile testing (iOS, Android)

3. **Documentation**
   - [ ] User guide updated
   - [ ] Admin guide updated
   - [ ] Release notes prepared
   - [ ] Known issues documented

4. **Backup & Rollback**
   - [ ] Current production version tagged in git
   - [ ] Rollback plan documented
   - [ ] Backup of production data

### Deployment Process

#### Step 1: Deploy to Staging
```bash
# Create deployment branch
git checkout -b deployment/smoke-detectors-v1.0

# Merge Phase 2 changes
git merge feature/smoke-detectors-ui

# Deploy to staging
./deploy-staging.sh

# Run smoke tests
npm run test:integration

# Verify in staging environment
# URL: https://staging.portfolio.nubank.com
```

#### Step 2: Stakeholder Review
- [ ] Demo to product owners (30 min)
- [ ] Demo to executives (15 min)
- [ ] Demo to HRBPs (30 min)
- [ ] Collect feedback
- [ ] Address critical feedback

#### Step 3: Deploy to Production
```bash
# After staging approval
git checkout main
git merge deployment/smoke-detectors-v1.0

# Tag release
git tag -a v1.1.0 -m "Release: Smoke Detectors Feature"

# Deploy to production
./deploy-production.sh

# Monitor for 1 hour
# Check error logs, performance metrics, user feedback
```

#### Step 4: Post-Deployment Monitoring
- [ ] Monitor error rates (should be < 0.1%)
- [ ] Monitor page load time (should be < 2s)
- [ ] Monitor user engagement metrics
- [ ] Collect user feedback (first 48 hours)
- [ ] Address any critical issues immediately

---

## 🔍 Testing Instructions

### How to Run Unit Tests

#### Method 1: Browser Console
1. Open the dashboard in a browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run: `window.runSmokeDetectorTests()`
5. Review output (should show 32 passed tests)

#### Method 2: Test HTML Page
1. Open `test-smoke-detectors.html` in a browser
2. Click "Run All Tests" button
3. Review output in the console panel
4. Verify: "✅ All 32 tests passed!"

### How to Test Individual Products

```javascript
// Test with a real product
const products = window.DataManager.getPortfolioData();
const product = products[0];

// Calculate detectors
const count = window.DataManager.calculateSmokeDetectors(product);
console.log(`Product "${product.name}" has ${count} smoke detector(s)`);

// Test all products
products.forEach(p => {
    const count = window.DataManager.calculateSmokeDetectors(p);
    if (count > 0) {
        console.log(`${p.name}: ${count} detector(s)`);
    }
});
```

### How to Verify Data Quality

```javascript
// Check for products with missing data
const productsWithMissingData = window.DataManager.getPortfolioData()
    .filter(p => !p.rawRow || !Array.isArray(p.rawRow));

console.log(`Products with missing rawRow: ${productsWithMissingData.length}`);

// Verify HC allocation can be extracted
const productsWithHC = window.DataManager.getPortfolioData()
    .map(p => {
        const count = window.DataManager.calculateSmokeDetectors(p);
        return { name: p.name, count };
    })
    .filter(p => p.count > 0);

console.table(productsWithHC);
```

---

## 📈 Success Metrics

### Technical Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Unit Test Pass Rate | 100% | All 32 tests passing ✅ |
| Page Load Time | < 2s | Lighthouse Performance Score > 90 |
| Error Rate | < 0.1% | Zero console errors during normal use |
| Code Coverage | > 80% | Unit tests cover all detector logic |

### Business Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature Adoption | > 80% | % of active users who interact with detector feature |
| User Satisfaction | > 4.5/5 | Post-release survey rating |
| Data Quality Improvement | +20% | Reduction in missing metrics after 3 months |
| Early Intervention Rate | +30% | Increase in proactive product owner actions |

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **HC Allocation Detection**
   - **Issue:** HC allocation extracted from rawRow using heuristic approach
   - **Impact:** May not find HC value if CSV structure changes
   - **Solution:** Enhance column mapping to include HC allocation index
   - **Priority:** Medium
   - **Timeline:** Phase 2.1 (post-release enhancement)

2. **Sean Ellis Score Assumption**
   - **Issue:** Assumes Sean Ellis Score is in keyMetricUX field
   - **Impact:** May not work if score is stored elsewhere
   - **Solution:** Add explicit Sean Ellis Score field to data model
   - **Priority:** Low
   - **Timeline:** Future enhancement

3. **Real-time Updates**
   - **Issue:** Detector counts not updated in real-time when data changes
   - **Impact:** Requires page refresh to see updated counts
   - **Solution:** Implement reactive data updates
   - **Priority:** Low
   - **Timeline:** Future enhancement

### Workarounds

**For Issue #1 (HC Allocation):**
```javascript
// Manual override if HC allocation not detected correctly
product.totalHC = 3.5; // Manually set
const count = window.DataManager.calculateSmokeDetectors(product);
```

**For Issue #2 (Sean Ellis Score):**
```javascript
// If Sean Ellis Score is in different field, map it:
product.keyMetricUX = product.seanEllisScore; // Before calculation
```

---

## 📞 Support & Escalation

### Phase 2 Development Team
- **Lead Developer:** [Name]
- **QA Engineer:** [Name]
- **Product Owner:** [Name]

### Issue Escalation Path
1. **Low Priority:** Create Jira ticket → Weekly review
2. **Medium Priority:** Slack #portfolio-dev → Response in 24h
3. **High Priority:** Email team lead → Response in 4h
4. **Critical:** Call tech lead → Immediate response

### Deployment Support
- **Deployment Window:** [Date/Time]
- **On-Call Engineer:** [Name]
- **Rollback Decision Maker:** [Name]

---

## 📚 Reference Documentation

### Code Files
- **Core Logic:** `src/js/core/data-manager.js` (lines 1207-1371)
- **Unit Tests:** `src/js/core/data-manager.js` (lines 1421-1928)
- **Test Runner:** `test-smoke-detectors.html`

### Documentation Files
- **Phase 1 Complete:** `docs/features/SMOKE_DETECTORS_PHASE1_COMPLETE.md`
- **Deployment Plan:** `docs/deployment/SMOKE_DETECTORS_DEPLOYMENT_PLAN.md`
- **Data Dictionary:** `data/README.md`

### Related Features
- Risk Score Calculation: `calculateRiskScore()`
- Performance Metrics: `calculatePerformanceVsTarget()`
- Anomaly Detection: `checkAnomalies()`

---

## ✅ Sign-Off

### Phase 1 Sign-Off
- [x] **Developer:** Logic implemented and tested
- [x] **QA Engineer:** Unit tests verified
- [x] **Tech Lead:** Code review approved

### Phase 2 Sign-Off (Pending)
- [ ] **Developer:** UI components implemented
- [ ] **QA Engineer:** Integration tests passed
- [ ] **Product Owner:** UAT approved
- [ ] **Tech Lead:** Production deployment approved

---

*Document Version: 1.0*  
*Last Updated: October 6, 2025*  
*Next Review: [After Phase 2 completion]*

