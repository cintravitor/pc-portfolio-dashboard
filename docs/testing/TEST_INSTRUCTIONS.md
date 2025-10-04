# 🧪 Anomaly Detection - Quick Test Instructions

**Status:** ✅ Ready for Testing  
**Date:** October 4, 2025

---

## 🚀 Quick Start (3 Steps)

### Step 1: Open the Dashboard
The local server is running at:
```
http://localhost:8080
```

Open this URL in your browser.

### Step 2: Wait for Data to Load
Wait until you see the product cards appear on the screen (usually 2-5 seconds).

### Step 3: Run the Test
1. Press `F12` to open the browser console
2. Type: `testAnomalyDetection()`
3. Press Enter

---

## 📊 What You'll See

The test will display a comprehensive report showing:

### ⚠️ Owner Overload
Lists any owners managing more than 3 products in Development or Growth stages:
```
  1. Jane Doe (5 products):
     - Product A
     - Product B
     - Product C
     - Product D
     - Product E
```

### 🏥 Data Health Issues
Lists products with data quality problems:
```
  1. Product X (3 issues):
     - Missing BI Target
     - Below UX Target (72 < 80)
     - Missing BI Metric
```

### 📈 Summary Statistics
```
  • Total Owner Overloads: 2
  • Total Data Health Issues: 15
  • Total Anomalies: 17
  • Generated: 2025-10-04T10:30:00.000Z
```

---

## 🔧 Advanced Testing

### Test 1: Get Raw Report
```javascript
const report = window.DataManager.checkAnomalies();
console.log(report);
```

### Test 2: Check Specific Owner
```javascript
const report = window.DataManager.checkAnomalies();
const owner = "Jane Doe";
const isOverloaded = report.ownerOverload.some(item => item.owner === owner);
console.log(`${owner} is overloaded:`, isOverloaded);
```

### Test 3: Count Issues by Type
```javascript
const report = window.DataManager.checkAnomalies();

// Count missing UX metrics
const missingUX = report.dataHealthIssues.filter(p => 
    p.issues.some(i => i === 'Missing UX Metric')
).length;

console.log('Products missing UX metrics:', missingUX);
```

### Test 4: Find Products Below Target
```javascript
const report = window.DataManager.checkAnomalies();

// Find products below UX target
const belowUX = report.dataHealthIssues.filter(p => 
    p.issues.some(i => i.includes('Below UX Target'))
);

console.log('Products below UX target:', belowUX);
```

---

## ✅ Verification Checklist

Use this checklist to verify the implementation:

- [ ] Dashboard loads successfully
- [ ] Product cards appear after data fetch
- [ ] Console opens without errors
- [ ] `testAnomalyDetection()` runs without errors
- [ ] Report shows JSON structure
- [ ] Summary statistics display correctly
- [ ] Owner overload section displays (if any)
- [ ] Data health issues section displays (if any)
- [ ] Total counts match expectations
- [ ] Timestamp shows current date/time
- [ ] Can call `window.DataManager.checkAnomalies()` directly
- [ ] Report structure matches documentation

---

## 🐛 Troubleshooting

### Issue: "No portfolio data available"
**Solution:** Wait longer for data to load, then run the test again.

### Issue: "testAnomalyDetection is not defined"
**Solution:** Refresh the page (Ctrl+R or Cmd+R)

### Issue: No anomalies found
**This is normal!** It means:
- All owners have ≤3 products in Dev/Growth
- All products have complete metrics
- All metrics are meeting targets

To verify data loaded:
```javascript
const data = window.State.getPortfolioData();
console.log('Products loaded:', data.length);
```

### Issue: Server not running
**Solution:** Restart the server:
```bash
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"
python3 -m http.server 8080
```

---

## 📚 Next Steps

1. ✅ Test the basic functionality
2. ✅ Review the anomaly report
3. ✅ Verify the business logic is correct
4. ✅ Check the report structure
5. ✅ Provide feedback

When ready for UI:
- Review `ANOMALY_DETECTION_COMPLETE.md` for Phase 2 plan
- Discuss UI design requirements
- Approve proceeding with UI integration

---

## 📞 Need Help?

- **Documentation:** See `docs/ANOMALY_DETECTION_IMPLEMENTATION.md`
- **Summary:** See `ANOMALY_DETECTION_COMPLETE.md`
- **Code:** Check `src/js/core/data-manager.js` (lines 610-784)

---

**Ready to Test!** 🚀

