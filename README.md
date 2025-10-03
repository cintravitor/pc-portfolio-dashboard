# Product Portfolio Dashboard

A simple, lightweight web application that automatically syncs with a Google Sheet to display product portfolio data. The dashboard updates automatically every 24 hours and includes manual refresh capability.

## Features

- 🔄 Automatic data sync every 24 hours
- 📊 Clean, responsive table display
- 💾 Offline caching (uses localStorage)
- 🎨 Modern, gradient UI design
- 📱 Mobile-friendly responsive layout
- ⚡ No complex frameworks - just vanilla HTML, CSS, and JavaScript
- 🔓 **No Google Cloud Console needed** - uses Google Apps Script

## Prerequisites

- A Google Account
- A Google Sheet with your product portfolio data
- A modern web browser
- A simple local web server (instructions below)

---

## Setup Instructions (No Google Cloud Console Required!)

### Step 1: Prepare Your Google Sheet

1. Open your Google Sheet containing the portfolio data
2. Make sure the first row contains column headers
3. Keep this tab open - you'll need it in the next step

---

### Step 2: Create a Google Apps Script Web App

This is the **easiest method** and doesn't require Google Cloud Console permissions!

#### 2.1: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. A new tab will open with the Apps Script editor
3. You'll see a default `Code.gs` file with some sample code

#### 2.2: Replace the Code

1. **Delete all the existing code** in the editor
2. **Copy and paste** the following code:

```javascript
/**
 * Google Apps Script Web App
 * Serves Google Sheet data as JSON via a public URL
 */

function doGet(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    // Create JSON response
    const jsonData = {
      success: true,
      data: data,
      lastUpdated: new Date().toISOString(),
      rowCount: data.length
    };
    
    // Return JSON with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify(jsonData))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    const errorResponse = {
      success: false,
      error: error.toString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### 2.3: Deploy as Web App

1. Click the **"Deploy"** button (top-right, blue button) → **"New deployment"**
2. Click the gear icon ⚙️ next to "Select type" → Choose **"Web app"**
3. Fill in the settings:
   - **Description**: `Portfolio Data API` (or any name you like)
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone** (this makes it public)
4. Click **"Deploy"**
5. **Authorize the app**:
   - You'll see a permissions dialog
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" if you see a warning
   - Click "Go to [Project Name] (unsafe)"
   - Click "Allow"
6. **Copy the Web App URL** that appears (it looks like: `https://script.google.com/macros/s/XXXXX/exec`)
7. Click **"Done"**

**Important**: Save this URL! You'll need it in Step 3.

---

### Step 3: Configure the Application

1. Open `config.js` in a text editor
2. Replace the entire file with this updated version:

```javascript
/**
 * Configuration file for Google Apps Script connection
 * 
 * This version uses Google Apps Script Web App instead of Google Sheets API
 * No Google Cloud Console or API key needed!
 */

const CONFIG = {
    // Your Google Apps Script Web App URL
    // Get this from: Extensions → Apps Script → Deploy → Web App URL
    WEB_APP_URL: 'YOUR_WEB_APP_URL_HERE'
};
```

3. Replace `'YOUR_WEB_APP_URL_HERE'` with the URL you copied in Step 2
4. Save the file

**Example:**
```javascript
const CONFIG = {
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXX/exec'
};
```

---

### Step 4: Update the JavaScript Code

We need to update `script.js` to use the new Google Apps Script endpoint:

1. Open `script.js`
2. Find the `fetchSheetData()` function (around line 18)
3. Replace the entire function with the updated version below:

```javascript
/**
 * Main function to fetch data from Google Apps Script Web App
 */
async function fetchSheetData() {
    // Show loading indicator
    showLoading(true);
    hideError();
    
    try {
        // Validate configuration
        if (!CONFIG.WEB_APP_URL || CONFIG.WEB_APP_URL === 'YOUR_WEB_APP_URL_HERE') {
            throw new Error('Missing Web App URL. Please configure config.js with your Google Apps Script URL.');
        }
        
        console.log('Fetching data from Google Apps Script...');
        
        // Make the request to the Web App
        const response = await fetch(CONFIG.WEB_APP_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        
        // Check if the response was successful
        if (!jsonData.success) {
            throw new Error(jsonData.error || 'Unknown error from Web App');
        }
        
        // Extract the data
        const rows = jsonData.data;
        
        if (!rows || rows.length === 0) {
            throw new Error('No data found in the spreadsheet');
        }
        
        console.log(`Successfully fetched ${rows.length} rows`);
        
        // Cache the data and update timestamp
        cacheData(rows);
        updateLastFetchTime();
        
        // Display the data in a table
        displayDataAsTable(rows);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        showError(`Failed to fetch data: ${error.message}`);
        
        // Try to load cached data if available
        loadCachedData();
    } finally {
        showLoading(false);
    }
}
```

---

### Step 5: Run the Application Locally

Because modern browsers block certain requests from `file://` URLs, you need to serve the files through a local web server.

#### Option A: Using Python (Recommended)

If you have Python installed:

**Python 3:**
```bash
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"
python3 -m http.server 8000
```

**Python 2:**
```bash
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"
python -m SimpleHTTPServer 8000
```

Then open your browser and go to:
```
http://localhost:8000
```

#### Option B: Using Node.js

If you have Node.js installed:

1. Install a simple HTTP server:
```bash
npm install -g http-server
```

2. Run the server:
```bash
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"
http-server -p 8000
```

3. Open your browser and go to:
```
http://localhost:8000
```

#### Option C: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option D: Using PHP

If you have PHP installed:
```bash
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"
php -S localhost:8000
```

---

### Step 6: Test the Connection

1. Once the page loads, click the **"Refresh Data"** button
2. You should see your Google Sheet data displayed in a table
3. The "Last updated" timestamp should show the current time

If you see an error:
- Check that your Web App URL is correct in `config.js`
- Make sure you deployed the Apps Script as "Anyone" can access
- Check the browser console (F12) for detailed error messages
- Verify the Apps Script code was saved properly

---

## How It Works

### Google Apps Script as Backend

Instead of using the Google Sheets API directly, we use Google Apps Script as a simple backend:

1. **Apps Script reads your sheet** - has full access since it's attached to your sheet
2. **Exposes a public URL** - serves data as JSON
3. **Your webpage fetches from this URL** - no API key needed!
4. **No authentication required** - the Web App handles permissions

### Automatic Updates

The application implements a smart update mechanism:

1. **On first load**: Fetches fresh data from your Web App
2. **Subsequent loads**: Shows cached data if less than 24 hours have passed
3. **Background checks**: Every hour, checks if 24 hours have passed since the last update
4. **Auto-refresh**: Automatically fetches new data when 24 hours have elapsed

### Caching

Data is cached in the browser's localStorage:
- Reduces unnecessary requests
- Provides offline viewing capability
- Persists across browser sessions

---

## Updating Your Data

When you update your Google Sheet:

1. **Manual Refresh**: Click "Refresh Data" button on the webpage
2. **Automatic**: Wait for the 24-hour auto-refresh
3. **Re-deploy Apps Script** (only if you change the script code):
   - Go to Apps Script editor
   - Click "Deploy" → "Manage deployments"
   - Click the pencil icon ✏️
   - Change version to "New version"
   - Click "Deploy"

---

## File Structure

```
portfolio-dashboard/
│
├── index.html          # Main HTML structure
├── style.css           # Styling and responsive design
├── script.js           # Core JavaScript functionality (UPDATED for Apps Script)
├── config.js           # Configuration (UPDATED for Web App URL)
└── README.md           # This file
```

---

## Customization

### Changing the Update Interval

Edit `script.js` and modify the `UPDATE_INTERVAL` constant:

```javascript
// Current: 24 hours
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000;

// Example: 12 hours
const UPDATE_INTERVAL = 12 * 60 * 60 * 1000;

// Example: 1 hour
const UPDATE_INTERVAL = 60 * 60 * 1000;
```

### Reading Specific Sheets or Ranges

Edit the Apps Script code to read specific sheets or ranges:

```javascript
// Read a specific sheet by name
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Portfolio');

// Read a specific range
const range = sheet.getRange('A1:Z100');
const data = range.getValues();
```

### Styling

All visual styles are in `style.css`. You can customize:
- Color scheme (gradient, buttons, etc.)
- Fonts and typography
- Table styling
- Layout and spacing

---

## Troubleshooting

### Error: "Missing Web App URL"
- Make sure you've edited `config.js` with your actual Web App URL
- Check that the URL is in quotes

### Error: "Failed to fetch data"
- Verify your Web App is deployed as "Anyone" can access
- Check that you copied the correct Web App URL (should end with `/exec`)
- Make sure you authorized the script properly

### Error: "Authorization required"
- Re-deploy the Apps Script
- Make sure "Who has access" is set to "Anyone"
- Try the Web App URL directly in your browser - it should show JSON data

### Data not updating when I change the sheet
- Click "Refresh Data" to fetch immediately
- Apps Script serves live data, so changes should appear instantly
- Clear your browser cache if needed

### The Web App URL shows an error page
- Make sure you're using the Web App URL (ends with `/exec`), not the script editor URL
- Re-deploy and get a fresh URL
- Check that the script code was saved correctly

### CORS errors
- The Apps Script setup should handle CORS automatically
- Make sure you're running through a local web server, not opening the HTML file directly

---

## Security Considerations

### Advantages of This Method

1. **No API Key Needed**: Apps Script handles authentication
2. **Fine-grained Control**: You control exactly what data is exposed
3. **No Console Access Required**: Perfect for restricted accounts
4. **Simple Setup**: Fewer steps than traditional API setup

### Security Notes

1. **Public Access**: Your Web App URL is public, anyone with it can fetch your data
2. **Read-Only**: The script only reads data, doesn't modify your sheet
3. **Data Privacy**: Only deploy sheets with data appropriate for public viewing
4. **Rate Limits**: Google Apps Script has usage quotas (plenty for most use cases)

### Enhancing Security (Optional)

Add a simple API key check to your Apps Script:

```javascript
function doGet(e) {
  // Simple API key protection
  const SECRET_KEY = 'your-secret-key-here';
  
  if (e.parameter.key !== SECRET_KEY) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Invalid API key'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ... rest of the code
}
```

Then update your fetch call to include the key:
```javascript
const response = await fetch(`${CONFIG.WEB_APP_URL}?key=your-secret-key-here`);
```

---

## Deployment

For production deployment:

1. **GitHub Pages**: 
   - Push your code to GitHub
   - Enable GitHub Pages
   - Your app will be live at `https://username.github.io/repo-name`

2. **Netlify/Vercel**: 
   - Drag and drop your folder
   - Instant deployment with free hosting

3. **Any Web Host**: 
   - Upload all files via FTP
   - Make sure to include `config.js` with your Web App URL

**Note**: The Web App URL works from any domain, so deployment is simple!

---

## Comparison: Apps Script vs. API Key Method

| Feature | Apps Script (This Method) | Google Sheets API |
|---------|---------------------------|-------------------|
| **Setup Difficulty** | ⭐ Easy | ⭐⭐⭐ Complex |
| **Google Cloud Console** | ❌ Not needed | ✅ Required |
| **API Key** | ❌ Not needed | ✅ Required |
| **Permissions** | ✅ Works with restricted accounts | ❌ Needs project creation rights |
| **Rate Limits** | 20,000 calls/day | 100 requests/100 seconds/user |
| **Customization** | ✅ Full control over data | ⭐ Limited to API features |
| **Security** | ⭐⭐ Good (can add custom auth) | ⭐⭐⭐ Better (OAuth2 support) |

---

## Future Enhancements

Potential improvements for this dashboard:
- Data filtering and search functionality
- Column sorting (ascending/descending)
- Export data to CSV
- Data visualization with charts/graphs
- Multiple sheet support
- Custom API key protection in Apps Script
- Real-time collaboration indicators
- Pagination for large datasets

---

## Apps Script Limitations

Google Apps Script has some usage quotas:

- **URL Fetch calls**: 20,000/day
- **Script runtime**: 6 minutes/execution
- **Simultaneous executions**: 30

For a dashboard with 24-hour refresh cycles, these limits are more than sufficient. Even with 100 users refreshing manually, you'll be well within limits.

---

## Support

For issues related to:
- **Google Apps Script**: [Apps Script Documentation](https://developers.google.com/apps-script)
- **This application**: Check the browser console (F12) for error messages
- **Common issues**: See Troubleshooting section above

---

## Why This Method Is Better for You

✅ **No Google Cloud Console** - Works with restricted accounts  
✅ **Simpler Setup** - 3 steps instead of 6  
✅ **No API Key Management** - One less thing to secure  
✅ **Same Functionality** - All features work identically  
✅ **More Flexible** - Can add custom logic in Apps Script  

---

**Created**: 2025  
**Tech Stack**: HTML5, CSS3, JavaScript (ES6+), Google Apps Script  
**Method**: Google Apps Script Web App (No Cloud Console Required)
