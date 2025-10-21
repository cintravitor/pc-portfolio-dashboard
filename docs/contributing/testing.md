# Testing Guide

## Testing Strategy

All changes must be tested before merging. Testing includes manual testing of features, regression testing, and performance validation.

## Manual Testing

### Pre-Commit Checklist

Before committing any changes:

- [ ] **Functionality**: Feature works as intended
- [ ] **No Errors**: Console has no errors or warnings
- [ ] **Cross-Browser**: Tested in at least 2 browsers
- [ ] **Responsive**: Works on mobile/tablet viewports
- [ ] **Data Integrity**: Data displays correctly
- [ ] **Performance**: No noticeable slowdown

### Test Environment Setup

1. **Start Local Server**:
   ```bash
   python3 -m http.server 8080
   ```

2. **Open in Browser**:
   ```
   http://localhost:8080
   ```

3. **Open DevTools**: Press F12 or Cmd+Option+J

4. **Clear Cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

## Feature Testing

### Explore Tab

**Test Case 1: Data Loading**
- Click "Refresh Data" button
- **Expected**: Loading indicator appears, then data loads
- **Verify**: Cards display, stats update, no console errors

**Test Case 2: Search**
- Type "onboarding" in search box
- **Expected**: Cards filter to matching solutions
- **Verify**: Matching cards shown, stats update

**Test Case 3: Multi-Select Filters**
- Click "P&C Area" dropdown
- Select "PATO" and "PSE"
- **Expected**: Dropdown closes, filter pill appears, cards filter
- **Verify**: Only PATO/PSE solutions shown

**Test Case 4: Detail Panel**
- Click any solution card
- **Expected**: Detail panel slides in from right
- **Verify**: All data displays, charts render

**Test Case 5: Smoke Detectors**
- Find card with red badge
- **Expected**: Badge shows count
- **Verify**: Correct number of issues

### Governance Tab

**Test Case 6: Dashboard Load**
- Click "Governance" tab
- **Expected**: Dashboard loads with all sections
- **Verify**: Action layer, metrics, charts all display

**Test Case 7: Collapsible Sections**
- Click section header
- **Expected**: Section collapses/expands
- **Verify**: Smooth animation, icon rotates

**Test Case 8: Smoke Detector Modal**
- Click smoke detector count
- **Expected**: Modal opens with solution list
- **Verify**: Shows triggered detectors and reasons

**Test Case 9: Column Charts**
- Check Journey Stage, Maturity, P&C Area charts
- **Expected**: Charts render as vertical columns
- **Verify**: Labels readable, data accurate

### Analytics Tab

**Test Case 10: Analytics Load**
- Click "Analytics" tab
- **Expected**: Dashboard loads with metrics
- **Verify**: Charts display, no errors

## Regression Testing

After any change, verify core functionality still works:

### Critical Path Test

1. **Load Data**: ✅ Data fetches successfully
2. **View Cards**: ✅ Cards display with correct info
3. **Apply Filter**: ✅ Filters work
4. **Open Detail**: ✅ Detail panel opens
5. **Switch Tabs**: ✅ All tabs load
6. **Close Detail**: ✅ Panel closes

### Quick Smoke Test (2 minutes)

```bash
# Checklist
□ Page loads without errors
□ Data loads from Google Sheets
□ Search works
□ At least one filter works
□ Detail panel opens and closes
□ All 3 tabs switch correctly
□ Charts render
□ No console errors
```

## Browser Compatibility

### Required Testing

- **Chrome** (primary)
- **Firefox** or **Safari** (secondary)

### Test Matrix

| Feature | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| Data Load | ✅ | ✅ | ✅ |
| Filters | ✅ | ✅ | ✅ |
| Charts | ✅ | ✅ | ✅ |
| Detail Panel | ✅ | ✅ | ✅ |
| Governance | ✅ | ✅ | ✅ |

### Mobile Testing

Test on mobile viewport (375px width):

1. Open DevTools
2. Toggle device toolbar (Cmd+Shift+M)
3. Select iPhone or similar device
4. Test key features work

**Mobile Checklist**:
- [ ] Cards stack vertically
- [ ] Filters accessible
- [ ] Detail panel full-screen
- [ ] Charts responsive
- [ ] Tab navigation works

## Performance Testing

### Load Time

**Target**: < 3 seconds from load to interactive

**Measure**:
1. Open DevTools Network tab
2. Hard refresh page
3. Check "Load" time in footer
4. **Expected**: Under 3 seconds

### Memory Usage

**Target**: No memory leaks

**Measure**:
1. Open DevTools Performance tab
2. Start recording
3. Navigate through tabs, open/close panels
4. Stop recording
5. Check memory graph
6. **Expected**: Memory returns to baseline

### Chart Rendering

**Target**: < 100ms per chart

**Measure**:
1. Open DevTools Console
2. Look for chart timing logs
3. **Expected**: Each chart renders in < 100ms

## Error Testing

### Edge Cases

**Empty Search**:
- Search for gibberish "xyzabc123"
- **Expected**: "No results" message

**No Filters Applied**:
- Clear all filters
- **Expected**: All solutions shown

**Missing Data**:
- Test with solution missing metrics
- **Expected**: Graceful handling, "N/A" displayed

**Network Error**:
- Disable network in DevTools
- Click "Refresh Data"
- **Expected**: Error message, fallback to cache

### Error Recovery

**Test Recovery**:
1. Trigger error (disconnect network)
2. Re-enable network
3. Click "Retry"
4. **Expected**: Data loads successfully

## API Testing

### Backend Endpoints

**Test Raw Data Endpoint**:
```bash
curl https://script.google.com/macros/s/[ID]/exec
```

**Expected Response**:
```json
{
  "success": true,
  "data": [...],
  "rowCount": 84
}
```

**Test Governance Endpoint**:
```bash
curl "https://script.google.com/macros/s/[ID]/exec?action=getGovernanceData"
```

**Expected Response**:
```json
{
  "success": true,
  "smokeDetectors": {...},
  "bauAnomalies": {...}
}
```

## Test Data

### Test Solutions

Use these for consistent testing:

- **"M5+ Onboarding"**: Has metrics, mature
- **"Engagement Survey"**: Missing BI metric
- **"Talent Assessment"**: In decline stage

### Test Filters

- **Area**: "PATO" (largest group)
- **Maturity**: "3. Mature" (most common)
- **Owner**: Check actual owner names

## Debugging Failed Tests

### Console Errors

**Check**:
1. Error message
2. Stack trace
3. File and line number

**Common Errors**:
- `undefined is not a function`: Missing dependency
- `Cannot read property`: Null/undefined data
- `Network request failed`: API issue

### Visual Debugging

**Use DevTools**:
1. **Elements**: Inspect DOM structure
2. **Console**: Check logs and errors
3. **Network**: Verify API calls
4. **Application**: Check localStorage

### Logging

**Add debug logs**:
```javascript
console.log('Data loaded:', data.length);
console.log('Filters applied:', filters);
console.log('Rendering cards:', cards.length);
```

## Automated Testing (Future)

### Planned Test Suite

```javascript
// Unit tests
describe('Data Manager', () => {
    it('should filter data correctly', () => {
        const filtered = applyFilters(data, 'search');
        expect(filtered.length).toBe(expected);
    });
});

// Integration tests
describe('Filter Flow', () => {
    it('should update UI when filter applied', () => {
        applyFilter('PATO');
        expect(getVisibleCards()).toBe(expected);
    });
});
```

### Test Framework

Consider adding:
- **Jest**: Unit testing
- **Cypress**: E2E testing
- **Lighthouse**: Performance testing

## Test Documentation

### Bug Reports

**Template**:
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Navigate to...
2. Click on...
3. Observe...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: Chrome 118
- OS: macOS 14
- Version: v6.3.0

## Screenshots
[If applicable]

## Console Errors
[Copy/paste from console]
```

### Test Results

**Document findings**:
```markdown
## Test Results - v6.3.0

**Date**: 2025-10-21
**Tester**: Your Name
**Environment**: Chrome 118, macOS

| Test Case | Result | Notes |
|-----------|--------|-------|
| Data Load | ✅ Pass | 2.1s load time |
| Filters | ✅ Pass | All work correctly |
| Charts | ⚠️ Warn | Slow on large datasets |
| Mobile | ✅ Pass | Responsive works |
```

## Pre-Release Testing

Before merging to main:

### Complete Test Run

1. **Fresh Install**: Test in incognito/private mode
2. **Clean Cache**: Clear all cache and cookies
3. **Full Workflow**: Test every major feature
4. **Multiple Browsers**: Test in 2+ browsers
5. **Mobile**: Test on actual mobile device
6. **Performance**: Run Lighthouse audit

### Release Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Cross-browser verified
- [ ] Mobile responsive
- [ ] Documentation updated
- [ ] Changelog updated

## Related Documentation

- [Code Standards](code-standards.md)
- [Local Development Guide](../getting-started/local-development.md)
- [Deployment Guide](../getting-started/deployment.md)

