/**
 * Google Apps Script Web App
 * 
 * This script serves Google Sheet data as JSON via a public URL
 * No Google Cloud Console or API key needed!
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Click Extensions → Apps Script
 * 3. Delete any existing code
 * 4. Copy and paste this entire file
 * 5. Click the save icon (💾)
 * 6. Click Deploy → New deployment
 * 7. Click gear icon → Select "Web app"
 * 8. Set "Execute as" to "Me"
 * 9. Set "Who has access" to "Anyone"
 * 10. Click Deploy
 * 11. Copy the Web App URL
 * 12. Paste the URL into config.js
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
      rowCount: data.length,
      columnCount: data.length > 0 ? data[0].length : 0
    };
    
    // Return JSON with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify(jsonData))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    const errorResponse = {
      success: false,
      error: error.toString(),
      message: 'Failed to fetch data from Google Sheet'
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Optional: Function to read a specific sheet by name
 * Uncomment and modify if you want to read from a specific sheet
 */
/*
function doGet(e) {
  try {
    const sheetName = 'Portfolio'; // Change this to your sheet name
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }
    
    const data = sheet.getDataRange().getValues();
    
    const jsonData = {
      success: true,
      data: data,
      sheetName: sheetName,
      lastUpdated: new Date().toISOString(),
      rowCount: data.length
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(jsonData))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.toString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/

/**
 * Optional: Function to read a specific range
 * Uncomment and modify if you want to read only a specific range
 */
/*
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const range = sheet.getRange('A1:Z100'); // Modify this range as needed
    const data = range.getValues();
    
    const jsonData = {
      success: true,
      data: data,
      range: 'A1:Z100',
      lastUpdated: new Date().toISOString(),
      rowCount: data.length
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(jsonData))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.toString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/

