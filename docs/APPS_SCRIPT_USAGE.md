# Google Apps Script - getDescriptiveData() Function

## 📋 Overview

The `getDescriptiveData()` function has been added to your Google Apps Script to fetch data from the specific P&C Portfolio spreadsheet.

**Spreadsheet URL:** https://docs.google.com/spreadsheets/d/10YL71NMZ9gfMBa2AQgKqn3KTtNzQjw01S-7PnXHsnyI/edit?gid=1988087509

---

## 🚀 Deployment Steps

### 1. Copy the Script to Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/10YL71NMZ9gfMBa2AQgKqn3KTtNzQjw01S-7PnXHsnyI/edit
2. Click **Extensions → Apps Script**
3. Delete any existing code
4. Copy and paste the contents of `GoogleAppsScript.gs` into the editor
5. Click the **Save icon (💾)**
6. Name the project (e.g., "P&C Portfolio API")

### 2. Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the **gear icon** next to "Select type"
3. Choose **Web app**
4. Configure settings:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone (or "Anyone with the link")
5. Click **Deploy**
6. Copy the **Web App URL** (it will look like: `https://script.google.com/macros/s/...`)
7. Click **Done**

### 3. Authorize the Script

- The first time you deploy, Google will ask you to authorize the script
- Click **Authorize access**
- Choose your Google account
- Click **Advanced** if you see a warning
- Click **Go to [Project Name] (unsafe)**
- Click **Allow**

---

## 💻 Client-Side JavaScript Usage

### Method 1: Fetch Descriptive Data

```javascript
// Your Web App URL from deployment
const WEB_APP_URL = 'https://script.google.com/macros/s/.../exec';

// Call the getDescriptiveData() function
async function loadDescriptiveData() {
  try {
    const response = await fetch(WEB_APP_URL + '?action=descriptive');
    const result = await response.json();
    
    if (result.success) {
      console.log('Spreadsheet ID:', result.spreadsheetId);
      console.log('Sheet Name:', result.sheetName);
      console.log('Total Rows:', result.metadata.rowCount);
      console.log('Data:', result.data);
      console.log('Headers:', result.metadata.headers);
      return result.data;
    } else {
      console.error('Error:', result.message);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to fetch descriptive data:', error);
  }
}

// Call the function
loadDescriptiveData();
```

### Method 2: Default Data Fetch (Active Spreadsheet)

```javascript
// Call without parameters to get data from the active spreadsheet
async function loadDefaultData() {
  const response = await fetch(WEB_APP_URL);
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  }
}
```

### Method 3: Using in Your Dashboard

Add this to your `dashboard-script.js`:

```javascript
/**
 * Load descriptive analysis data from Google Sheet
 */
async function fetchDescriptiveData() {
  try {
    const response = await fetch(CONFIG.WEB_APP_URL + '?action=descriptive');
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const jsonData = await response.json();
    
    if (!jsonData.success) {
      throw new Error(jsonData.error || 'Failed to fetch descriptive data');
    }
    
    console.log('Descriptive data loaded:', {
      spreadsheet: jsonData.spreadsheetId,
      sheet: jsonData.sheetName,
      rows: jsonData.metadata.rowCount,
      columns: jsonData.metadata.columnCount
    });
    
    return jsonData;
    
  } catch (error) {
    console.error('Error fetching descriptive data:', error);
    throw error;
  }
}
```

---

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "spreadsheetId": "10YL71NMZ9gfMBa2AQgKqn3KTtNzQjw01S-7PnXHsnyI",
  "sheetName": "Sheet1",
  "sheetId": 1988087509,
  "data": [
    ["Header1", "Header2", "Header3"],
    ["Row1Col1", "Row1Col2", "Row1Col3"],
    ["Row2Col1", "Row2Col2", "Row2Col3"]
  ],
  "metadata": {
    "rowCount": 3,
    "columnCount": 3,
    "lastRow": 3,
    "lastColumn": 3,
    "headers": ["Header1", "Header2", "Header3"]
  },
  "lastUpdated": "2025-10-03T15:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Exception: Spreadsheet not found",
  "message": "Failed to fetch descriptive data from Google Sheet",
  "spreadsheetId": "10YL71NMZ9gfMBa2AQgKqn3KTtNzQjw01S-7PnXHsnyI"
}
```

---

## 🔧 Function Details

### getDescriptiveData()

**Purpose:** Fetches the entire dataset from the specified Google Sheet

**Parameters:** None (hardcoded spreadsheet ID)

**Returns:** JSON object with:
- `success` (boolean) - Whether the operation succeeded
- `spreadsheetId` (string) - The Google Sheet ID
- `sheetName` (string) - Name of the active sheet
- `sheetId` (number) - The sheet's GID
- `data` (array) - 2D array of all cell values
- `metadata` (object) - Sheet metadata including row/column counts and headers
- `lastUpdated` (string) - ISO timestamp of when data was fetched

**Access:** Via Web App URL with `?action=descriptive` parameter

---

## 🔐 Permissions

The script needs permission to:
- Read from the specified Google Spreadsheet
- Access spreadsheet metadata (sheet names, IDs, etc.)

These permissions are granted when you authorize the script during deployment.

---

## 🐛 Troubleshooting

### "Spreadsheet not found" Error

**Cause:** The script doesn't have access to the spreadsheet

**Solution:**
1. Make sure you're logged into the correct Google account
2. Verify you have access to the spreadsheet
3. Re-deploy the script with "Execute as: Me"
4. Re-authorize the script

### "Sheet not found" Error

**Cause:** The specified sheet (by GID or name) doesn't exist

**Solution:**
1. Check that the spreadsheet has an active sheet
2. If using `getSheetByName()`, verify the sheet name is correct
3. The function currently uses `getActiveSheet()` - make sure there's an active sheet

### CORS Errors

**Cause:** Browser blocking cross-origin requests

**Solution:**
- The Apps Script Web App URL should handle CORS automatically
- Make sure you're using the deployed Web App URL, not the script editor URL
- Try adding `mode: 'no-cors'` to your fetch options (though this limits response access)

### Authentication Issues

**Cause:** User needs to authorize the script

**Solution:**
1. Go to **Deploy → Manage deployments**
2. Click the **pencil icon** to edit
3. Set "Who has access" appropriately
4. Click **Deploy** again
5. Re-authorize if prompted

---

## 📝 Notes

- The function connects to spreadsheet ID: `10YL71NMZ9gfMBa2AQgKqn3KTtNzQjw01S-7PnXHsnyI`
- Currently uses `getActiveSheet()` - modify line 87 if you need a specific sheet by name
- The function returns the entire data range - for large datasets, consider pagination
- Data is fetched fresh on each request (no caching in Apps Script)
- The Web App URL remains the same even after redeploying (unless you create a new deployment)

---

## 🔄 Updating the Script

After making changes to the Apps Script code:

1. Save the changes in the Apps Script editor
2. Go to **Deploy → Manage deployments**
3. Click the **pencil icon** next to your active deployment
4. Change "Version" to **New version**
5. Click **Deploy**

The Web App URL remains the same, but the new code will be active.

---

## ✅ Quick Test

Test your deployment with this simple HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test getDescriptiveData</title>
</head>
<body>
  <h1>Test Descriptive Data Function</h1>
  <button onclick="testFunction()">Fetch Data</button>
  <pre id="output"></pre>
  
  <script>
    const WEB_APP_URL = 'YOUR_WEB_APP_URL_HERE';
    
    async function testFunction() {
      const output = document.getElementById('output');
      output.textContent = 'Loading...';
      
      try {
        const response = await fetch(WEB_APP_URL + '?action=descriptive');
        const data = await response.json();
        output.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        output.textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

---

**Last Updated:** October 3, 2025

