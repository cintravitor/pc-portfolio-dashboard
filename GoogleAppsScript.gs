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
    // Check if a specific action is requested via query parameter
    const action = e.parameter.action;
    
    if (action === 'descriptive') {
      // Return descriptive analysis data
      return getDescriptiveData();
    }
    
    // Default: return all data
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
 * Get descriptive analysis data
 * This function can be called with ?action=descriptive query parameter
 * Note: Current implementation does analysis client-side for better performance
 * This function is provided for optional server-side analysis if needed
 */
function getDescriptiveData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 3) {
      throw new Error('Insufficient data in spreadsheet');
    }
    
    // Headers are in row 1 (index 1), data starts from row 2
    const headers = data[1];
    const dataRows = data.slice(2);
    
    // Find column indices
    const nameIdx = headers.indexOf("Solution name");
    const maturityIdx = headers.indexOf("Maturity Stage");
    const areaIdx = headers.indexOf("P'n'C Area");
    const ownerIdx = headers.indexOf("Owner's Name");
    const keyMetricUXIdx = headers.indexOf("Key Metric\nUser Experience");
    const keyMetricBIIdx = headers.indexOf("Key Metric\nBusiness Impact");
    const regulatoryIdx = headers.indexOf("Is a regulatory demand?");
    
    // Perform analysis
    const analysis = {
      totalSolutions: 0,
      stageCount: {},
      areaCount: {},
      ownerCount: {},
      metricsCount: {
        withUX: 0,
        withBI: 0,
        withBoth: 0,
        withNone: 0
      },
      regulatoryCount: {
        yes: 0,
        no: 0
      }
    };
    
    // Analyze each row
    dataRows.forEach(row => {
      // Only count rows with a valid name
      const name = row[nameIdx] ? row[nameIdx].toString().trim() : '';
      if (!name) return;
      
      analysis.totalSolutions++;
      
      // Count by maturity stage
      const maturity = row[maturityIdx] ? row[maturityIdx].toString().trim() : 'Not specified';
      analysis.stageCount[maturity] = (analysis.stageCount[maturity] || 0) + 1;
      
      // Count by area
      const area = row[areaIdx] ? row[areaIdx].toString().trim() : 'Not specified';
      analysis.areaCount[area] = (analysis.areaCount[area] || 0) + 1;
      
      // Count by owner
      const owner = row[ownerIdx] ? row[ownerIdx].toString().trim() : 'Not assigned';
      analysis.ownerCount[owner] = (analysis.ownerCount[owner] || 0) + 1;
      
      // Count metrics
      const hasUX = row[keyMetricUXIdx] && row[keyMetricUXIdx].toString().trim() !== '';
      const hasBI = row[keyMetricBIIdx] && row[keyMetricBIIdx].toString().trim() !== '';
      
      if (hasUX) analysis.metricsCount.withUX++;
      if (hasBI) analysis.metricsCount.withBI++;
      if (hasUX && hasBI) analysis.metricsCount.withBoth++;
      if (!hasUX && !hasBI) analysis.metricsCount.withNone++;
      
      // Count regulatory
      const regulatory = row[regulatoryIdx] ? row[regulatoryIdx].toString().toLowerCase() : '';
      if (regulatory.includes('yes')) {
        analysis.regulatoryCount.yes++;
      } else {
        analysis.regulatoryCount.no++;
      }
    });
    
    const jsonData = {
      success: true,
      analysis: analysis,
      lastUpdated: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(jsonData))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.toString(),
      message: 'Failed to generate descriptive analysis'
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

