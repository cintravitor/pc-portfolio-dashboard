# 📊 Google Apps Script Analytics Backend

## Overview

This folder contains the **serverless backend** for the P&C Portfolio Analytics system. It uses Google Apps Script to collect anonymous analytics data from the dashboard and store it in a Google Sheet.

---

## 📁 Files

| File | Description |
|------|-------------|
| `analytics-backend.gs` | Complete Google Apps Script code |
| `DEPLOYMENT_GUIDE.md` | Step-by-step deployment instructions |
| `README.md` | This file |

---

## 🚀 Quick Start

### 1. Deploy Backend (10 minutes)

Follow the complete guide in **`DEPLOYMENT_GUIDE.md`**

**Quick steps:**
1. Go to https://script.google.com
2. Create new project: "P&C Portfolio Analytics Backend"
3. Copy code from `analytics-backend.gs`
4. Deploy as Web App
5. Copy the Web App URL

---

### 2. Connect Frontend

Update `src/js/core/analytics.js`:

```javascript
// Around line 250, after trackEvent() function, add:

function sendToBackend(event) {
    const BACKEND_URL = 'YOUR_WEB_APP_URL_HERE'; // Replace with your URL
    
    if (!BACKEND_URL || BACKEND_URL === 'YOUR_WEB_APP_URL_HERE') return;
    if (!isEnabled) return;
    
    fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            timestamp: event.timestamp,
            sessionId: event.sessionId,
            tabId: event.tabId,
            eventType: event.eventType,
            eventDetails: event.eventDetails,
            sessionAge: event.sessionAge,
            path: event.path,
            userAgent: navigator.userAgent.substring(0, 200)
        }),
        mode: 'no-cors'
    }).catch(() => {}); // Silent fail
}

// Then in trackEvent(), add this after eventBuffer.push(event):
sendToBackend(event);
```

---

## 🎯 What It Does

### Backend Features:
- ✅ Receives POST requests with analytics data
- ✅ Validates incoming payloads
- ✅ Creates/manages Google Sheet automatically
- ✅ Appends event data as rows
- ✅ Auto-archives sheets at 50K rows
- ✅ Returns JSON responses
- ✅ Handles CORS for cross-origin requests
- ✅ Robust error handling

### Data Structure:

**Google Sheet Columns:**
| Column | Description |
|--------|-------------|
| Timestamp | ISO 8601 timestamp |
| Session ID | Anonymous session identifier |
| Tab ID | Browser tab identifier |
| Event Type | Type of event (e.g., 'tab_switched') |
| Event Details | JSON object with event data |
| Session Age | Milliseconds since session started |
| Path | URL path |
| User Agent | Browser information (truncated) |

---

## 📊 Viewing Analytics

### In Google Sheets:
1. Open the spreadsheet in Drive
2. Folder ID: `1xPrsn-H0W73FUlrzMcXNf7ea1D2Ixg4t`
3. Name: `[P&C Portfolio] Official Portfolio Analytics`

### From Script Editor:
Run these test functions:
- `testBackend()` - Test all components
- `getAnalyticsSummary()` - View statistics
- `clearAnalyticsData()` - Clear all data (careful!)

---

## 🔒 Security & Privacy

### What's Collected:
- ✅ Anonymous session IDs (random strings)
- ✅ Event types and timestamps
- ✅ UI interactions
- ✅ Browser type (truncated user agent)

### What's NOT Collected:
- ❌ Personal information
- ❌ IP addresses
- ❌ Exact location
- ❌ Email or names
- ❌ Sensitive data

### Security Features:
- ✅ Input validation
- ✅ Type checking
- ✅ Error handling
- ✅ Rate limiting (via Google quotas)
- ✅ CORS protection

---

## 🧪 Testing

### Test Backend:
```javascript
// In Apps Script editor
testBackend()
```

### Test Endpoint:
```javascript
// In browser console
fetch('YOUR_WEB_APP_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    timestamp: new Date().toISOString(),
    sessionId: 'sess_test_123',
    eventType: 'test',
    eventDetails: { test: true }
  })
})
.then(r => r.json())
.then(console.log);
```

---

## 📈 Quotas & Limits

### Google Apps Script Quotas:
- URL Fetch calls: **20,000/day** (very generous)
- Script runtime: **6 min/execution**
- Simultaneous executions: **30**

### Sheet Limits:
- Max rows: **50,000/sheet** (then auto-archives)
- Max cells: **10 million**
- Max sheets: **200/spreadsheet**

**For typical usage (100-1000 events/day), these limits are more than sufficient.**

---

## 🔄 Updating

To update the backend:

1. Edit code in Apps Script editor
2. Save (Ctrl+S)
3. Deploy > Manage deployments
4. Edit existing deployment (pencil icon)
5. Create new version
6. Deploy

**Web App URL stays the same** - no need to update frontend!

---

## 🐛 Troubleshooting

### Common Issues:

**"Authorization required"**
→ Follow authorization flow in deployment guide

**"Permission denied"**
→ Add Drive API service in Apps Script

**"403 Forbidden"**
→ Check deployment: Execute as "Me", Access "Anyone"

**No data in sheet**
→ Check Web App URL is correct in frontend
→ Check browser console for errors
→ Test with manual POST request

---

## 📚 Architecture

```
Dashboard (Frontend)
    ↓
Analytics.js (Tracks events)
    ↓
sendToBackend() (Sends POST)
    ↓
Google Apps Script Web App
    ↓
Validation & Processing
    ↓
Google Sheet (Storage)
```

---

## 🎯 Future Enhancements

Possible additions:
- [ ] Batch sending (multiple events per request)
- [ ] Event sampling (only send X%)
- [ ] Real-time dashboard view
- [ ] Automated reports via email
- [ ] BigQuery export for advanced analytics
- [ ] Data Studio integration

---

## 📞 Support

For issues or questions:
1. Check `DEPLOYMENT_GUIDE.md` troubleshooting section
2. Review Apps Script execution logs
3. Test with `testBackend()` function
4. Verify spreadsheet permissions

---

## ✅ Success Checklist

Backend is working if:
- ✅ Script deploys without errors
- ✅ `testBackend()` passes all tests
- ✅ Web App URL returns JSON response
- ✅ Test POST creates row in sheet
- ✅ Dashboard events appear in sheet
- ✅ No errors in browser console

---

**Total Setup Time:** ~10 minutes  
**Complexity:** Low (copy/paste deployment)  
**Cost:** Free (Google Apps Script is free)  

**Get started with `DEPLOYMENT_GUIDE.md`! 🚀**

