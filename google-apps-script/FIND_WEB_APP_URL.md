# 🔗 How to Find Your Web App URL

## Quick Guide

Your Web App URL was created when you deployed in Step 4. Here's how to find it again:

---

## Method 1: From Apps Script Editor (Recommended)

### Step-by-Step:

1. **Open Apps Script**
   - Go to https://script.google.com
   - Click on your project: "P&C Portfolio Analytics Backend"

2. **Click "Deploy" button**
   - Located in top-right corner
   - Blue button

3. **Click "Manage deployments"**
   - A panel will slide in from the right

4. **Find your active deployment**
   - You'll see a row with:
     - Type: Web app
     - Description: "Production deployment - v1" (or whatever you named it)
     - Version: 1 (or higher)
     - Status: Active

5. **Copy the Web App URL**
   - Look for the URL below the description
   - It starts with: `https://script.google.com/macros/s/`
   - Click the copy icon 📋 next to it
   - OR manually select and copy the entire URL

---

## Your Web App URL Format

Your URL will look like this:

```
https://script.google.com/macros/s/AKfycbxTAPL6QypN_6v2WB1VwO6jbMwjbcABC123XYZ/exec
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    This part is unique to your deployment
```

**Important parts:**
- Always starts with: `https://script.google.com/macros/s/`
- Middle part: Long random string (your script ID)
- Always ends with: `/exec`

---

## Method 2: From Execution Logs

If you ran `testBackend()`:

1. Open your Apps Script project
2. Click "Executions" (left sidebar, clock icon)
3. Click on the most recent execution
4. Look through the logs
5. You won't see the Web App URL here, but you'll see the Spreadsheet URL

*Note: This method doesn't show Web App URL, use Method 1 instead*

---

## Method 3: Test If You Have The Right URL

If you think you have the URL, test it:

### Test in Browser:

1. Copy your URL
2. Paste in browser address bar
3. Press Enter

**If correct, you'll see:**
```json
{
  "success": true,
  "message": "Service is online",
  "status": "online",
  "service": "P&C Portfolio Analytics Backend",
  "version": "1.0.0"
}
```

**If wrong, you'll see:**
- "The script completed but did not return anything" (wrong URL format)
- 404 error (URL doesn't exist)
- Authorization error (deployment settings issue)

---

## What If I Can't Find Any Deployments?

If "Manage deployments" shows no deployments:

**This means you haven't deployed yet!**

Go back to Step 2 in DEPLOYMENT_GUIDE.md:

1. Click "Deploy" > "New deployment"
2. Select type: Web app
3. Configure settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click "Deploy"
5. Copy the URL that appears

---

## Common Mistakes

### ❌ Wrong: Using the Script URL
```
https://script.google.com/home/projects/ABC123.../edit
```
This is your script editor URL, NOT the Web App URL!

### ❌ Wrong: Missing /exec at the end
```
https://script.google.com/macros/s/AKfycbx...
```
Must end with `/exec`!

### ✅ Correct: Web App URL
```
https://script.google.com/macros/s/AKfycbxTAPL6QypN_6v2WB1VwO6jbMwjbc/exec
```

---

## Quick Checklist

Your Web App URL is correct if:
- ✅ Starts with `https://script.google.com/macros/s/`
- ✅ Has a long random string in the middle
- ✅ Ends with `/exec`
- ✅ When visited in browser, shows JSON response
- ✅ Length is approximately 100+ characters

---

## Still Can't Find It?

If you absolutely can't find your Web App URL:

**Option A: Re-deploy**

1. Go to your Apps Script project
2. Click "Deploy" > "New deployment"
3. Type: Web app
4. Execute as: Me
5. Access: Anyone
6. Click "Deploy"
7. Copy the new URL

**Option B: Ask Me For Help**

Tell me what you see when you:
1. Go to script.google.com
2. Open your project
3. Click "Deploy" > "Manage deployments"

And I'll help you find it!

---

## Once You Have Your URL

Test it immediately:

```javascript
// In your dashboard console (F12)
fetch('YOUR_WEB_APP_URL')
  .then(r => r.json())
  .then(data => console.log('✅ Backend online:', data))
  .catch(err => console.error('❌ Error:', err));
```

If you see `✅ Backend online: {success: true, ...}`, you have the right URL! 🎉

---

**Need more help? Let me know what you see in "Manage deployments"!**

