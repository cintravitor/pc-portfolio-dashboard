# 🚀 Google Apps Script Backend - Deployment Guide

## Step-by-Step Deployment Instructions

---

## 📋 Prerequisites

- ✅ Google account with access to Google Drive
- ✅ Access to the folder ID: `1xPrsn-H0W73FUlrzMcXNf7ea1D2Ixg4t`
- ✅ 5-10 minutes to complete deployment

---

## 🔧 Step 1: Create the Script

### 1.1 Open Google Apps Script

1. Go to **https://script.google.com**
2. Click **"+ New project"** (top left)
3. Rename project to: **"P&C Portfolio Backend"**
   - Click "Untitled project" at top
   - Type new name
   - It auto-saves

---

### 1.2 Copy the Code

1. **Open the file:** `google-apps-script/COMPLETE-UPDATED-CODE.gs`
2. **Select all code** (Ctrl+A or Cmd+A)
3. **Copy** (Ctrl+C or Cmd+C)
4. **Go back to Apps Script editor**
5. **Delete the default code** in `Code.gs`
6. **Paste the backend code**
7. **Save** (Ctrl+S or Cmd+S or disk icon)

---

## 🚢 Step 2: Deploy as Web App

### 2.1 Start Deployment

1. Click **"Deploy"** button (top right)
2. Select **"New deployment"**

---

### 2.2 Configure Deployment

**Type:**
- Click gear icon ⚙️ next to "Select type"
- Choose **"Web app"**

**Configuration:**
- **Description:** `Production deployment - v1`
- **Execute as:** **Me** (your-email@gmail.com)
- **Who has access:** **Anyone**

⚠️ **Important:** Must be "Anyone" for the frontend to send data!

---

### 2.3 Authorize the Script

1. Click **"Deploy"**
2. You'll see: **"Authorization required"**
3. Click **"Authorize access"**
4. **Choose your Google account**
5. Click **"Advanced"** (at bottom)
6. Click **"Go to P&C Portfolio Analytics Backend (unsafe)"**
7. Click **"Allow"**

Don't worry - this is your own script, it's safe!

---

### 2.4 Copy the Web App URL

After authorization:

1. You'll see: **"Deployment successfully created"**
2. **Copy the "Web app URL"**
   - It looks like: `https://script.google.com/macros/s/ABC123.../exec`
3. **Save this URL** - you'll need it for the frontend!

Example:
```
https://script.google.com/macros/s/AKfycbxTAPL6QypN_6v2WB1VwO6jbMwjbc/exec
```

---

## 🧪 Step 3: Test the Backend

### 3.1 Test in Script Editor

1. In the Apps Script editor
2. Select function: **`testBackend`** (dropdown at top)
3. Click **"Run"** ▶️
4. Check **"Execution log"** (bottom)

**Expected output:**
```
🧪 Testing Analytics Backend...
Test 1: Spreadsheet Access
✅ Spreadsheet access successful
Test 2: Sheet Access
✅ Sheet access successful
Test 3: Payload Validation
✅ Validation successful
Test 4: Append Data
✅ Data append successful
✅ All tests complete!
Spreadsheet ID: 1ABC123...
Spreadsheet URL: https://docs.google.com/spreadsheets/d/...
```

---

### 3.2 Test the Web App Endpoint

**Option A: Browser Test**

1. Copy your Web App URL
2. Paste in browser
3. You should see:

```json
{
  "success": true,
  "message": "Service is online",
  "status": "online",
  "service": "P&C Portfolio Analytics Backend",
  "version": "1.0.0",
  "timestamp": "2025-10-07T..."
}
```

**Option B: Console Test (Recommended)**

Open your dashboard, press F12, paste:

```javascript
fetch('YOUR_WEB_APP_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    timestamp: new Date().toISOString(),
    sessionId: 'sess_test_12345',
    tabId: 'tab_test_123',
    eventType: 'test_event',
    eventDetails: { test: true },
    sessionAge: 0,
    path: '/',
    userAgent: navigator.userAgent
  })
})
.then(r => r.json())
.then(data => console.log('✅ Backend response:', data))
.catch(err => console.error('❌ Error:', err));
```

**Expected response:**
```json
{
  "success": true,
  "message": "Event recorded successfully",
  "rowNumber": 2,
  "timestamp": "2025-10-07T..."
}
```

---

## 📊 Step 4: Verify Spreadsheet

### 4.1 Find the Spreadsheet

1. Go to **Google Drive**
2. Navigate to folder ID: `1xPrsn-H0W73FUlrzMcXNf7ea1D2Ixg4t`
3. Look for: **"[P&C Portfolio] Official Portfolio Analytics"**
4. Open it

---

### 4.2 Check the Data

You should see:

**Sheet: "Analytics Events"**

| Timestamp | Session ID | Tab ID | Event Type | Event Details | Session Age | Path | User Agent |
|-----------|------------|--------|------------|---------------|-------------|------|------------|
| 2025-10-07... | sess_test_12345 | tab_test_123 | test_event | {"test":true} | 0 | / | Mozilla... |

✅ If you see this, **the backend is working!**

---

## 🔌 Step 5: Connect Frontend

### 5.1 Update Analytics Module

Open `src/js/core/analytics.js` and find this section (around line 250):

```javascript
// ==================== EVENT TRACKING ====================

/**
 * Core event tracking function
 */
function trackEvent(eventType, eventDetails = {}) {
    // ... existing code ...
    
    // Add to buffer
    eventBuffer.push(event);
    
    // ADD THIS: Send to backend
    sendToBackend(event);
    
    // ... rest of existing code ...
}
```

---

### 5.2 Add Backend Communication

Add this code after the `trackEvent` function:

```javascript
/**
 * Send event data to Google Apps Script backend
 * @param {Object} event - The event object to send
 */
function sendToBackend(event) {
    // Backend Web App URL (replace with your URL)
    const BACKEND_URL = 'YOUR_WEB_APP_URL_HERE';
    
    // Skip if URL not configured
    if (!BACKEND_URL || BACKEND_URL === 'YOUR_WEB_APP_URL_HERE') {
        return;
    }
    
    // Skip if analytics disabled
    if (!isEnabled) return;
    
    try {
        // Send asynchronously (fire and forget)
        fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                timestamp: event.timestamp,
                sessionId: event.sessionId,
                tabId: event.tabId,
                eventType: event.eventType,
                eventDetails: event.eventDetails,
                sessionAge: event.sessionAge,
                path: event.path,
                userAgent: navigator.userAgent.substring(0, 200) // Truncate
            }),
            mode: 'no-cors' // Required for cross-origin requests
        }).catch(err => {
            // Silently fail - don't break user experience
            if (window.location.hostname === 'localhost') {
                console.warn('Analytics backend error:', err);
            }
        });
    } catch (error) {
        // Silently fail
        if (window.location.hostname === 'localhost') {
            console.warn('Analytics backend error:', error);
        }
    }
}
```

---

### 5.3 Replace the URL

1. Copy your **Web App URL** from Step 2.4
2. Replace `'YOUR_WEB_APP_URL_HERE'` with your actual URL
3. Save the file

Example:
```javascript
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

---

## ✅ Step 6: Test End-to-End

### 6.1 Test in Local Dashboard

1. **Open your dashboard** (index.html)
2. **Open console** (F12)
3. **Interact with the dashboard:**
   - Click tabs
   - Open product cards
   - Expand sections

---

### 6.2 Verify in Spreadsheet

1. **Wait ~5-10 seconds**
2. **Refresh the Google Sheet**
3. **Check for new rows**

You should see new events appearing in the spreadsheet!

---

## 🎉 Success Criteria

Your backend is working if:

- ✅ Web App URL responds with JSON
- ✅ Test POST creates a row in spreadsheet
- ✅ Spreadsheet exists in correct folder
- ✅ Headers are correct and formatted
- ✅ Dashboard interactions appear in sheet
- ✅ No errors in browser console

---

## 🔧 Troubleshooting

### Problem: "Authorization required"

**Solution:** Follow Step 2.3 exactly - you must authorize the script.

---

### Problem: "Exception: You do not have permission to call DriveApp.getFolderById"

**Solution:** 
1. Go to Apps Script editor
2. Click "+" next to "Services"
3. Add "Drive API" (v2)
4. Re-deploy

---

### Problem: Backend returns 403 error

**Solution:** Check deployment settings:
- Execute as: **Me**
- Who has access: **Anyone**

Re-deploy if needed.

---

### Problem: No data appearing in spreadsheet

**Solutions:**
1. Check the Web App URL is correct in analytics.js
2. Check browser console for errors
3. Try the console test from Step 3.2
4. Verify spreadsheet permissions

---

### Problem: "mode: 'no-cors'" prevents seeing response

**Solution:** This is normal! `no-cors` mode means you can't read the response, but the request still works. The data will still be saved.

To see responses during testing, temporarily:
1. Remove `mode: 'no-cors'` line
2. Test
3. Add it back for production

---

## 📊 Viewing Analytics Data

### In Google Sheets

**Direct access:**
1. Open spreadsheet from Drive
2. View raw data in "Analytics Events" sheet
3. Create pivot tables or charts as needed

---

### From Script Editor

Run these functions:

```javascript
// Get summary statistics
getAnalyticsSummary()

// Clear all data (careful!)
clearAnalyticsData()
```

---

## 🔄 Updating the Backend

If you need to make changes:

1. Edit code in Apps Script editor
2. Save changes
3. Deploy > **Manage deployments**
4. Click edit icon (pencil) on existing deployment
5. **Version:** New version
6. **Description:** Update description
7. Click **"Deploy"**

The Web App URL **stays the same** - no need to update frontend!

---

## 🔒 Security Notes

### What's Protected:
- ✅ Backend validates all inputs
- ✅ Only accepts specific data structure
- ✅ Prevents malformed data
- ✅ Logs all errors

### What to Know:
- 🔓 Endpoint is public (anyone can POST)
- 🔒 But validation prevents abuse
- 🔒 No sensitive data is collected
- 🔒 Google manages authentication

---

## 📈 Scaling Considerations

### Current Limits:
- **Max rows per sheet:** 50,000 (auto-archives when reached)
- **Google quotas:** 20,000 URL Fetch calls/day (generous)
- **Response time:** ~1-2 seconds per request

### If You Exceed Limits:
1. Sheets auto-archive at 50K rows
2. Consider batching events (send multiple at once)
3. Or implement sampling (only send % of events)

---

## 🎯 Next Steps

After deployment:

1. ✅ Test thoroughly
2. ✅ Monitor spreadsheet for data
3. ✅ Create visualizations in Google Sheets
4. ✅ Set up Google Data Studio dashboards (optional)
5. ✅ Share spreadsheet with stakeholders

---

## 📚 Additional Resources

- **Apps Script Docs:** https://developers.google.com/apps-script
- **Web Apps Guide:** https://developers.google.com/apps-script/guides/web
- **Sheets API:** https://developers.google.com/sheets/api

---

## 🆘 Need Help?

1. Check execution logs in Apps Script editor
2. Test with the `testBackend()` function
3. Verify spreadsheet permissions
4. Check browser console for errors

---

**Deployment should take ~10 minutes total. Good luck! 🚀**

