/**
 * P&C Portfolio Analytics Backend
 * Google Apps Script Web App for collecting analytics data
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create new project: "P&C Portfolio Analytics Backend"
 * 3. Copy this entire file into Code.gs
 * 4. Deploy > New deployment
 * 5. Type: Web app
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Deploy and copy the web app URL
 * 9. Use that URL in your analytics.js
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  // Target folder ID where the spreadsheet will be created
  FOLDER_ID: '1xPrsn-H0W73FUlrzMcXNf7ea1D2Ixg4t',
  
  // Spreadsheet name
  SPREADSHEET_NAME: '[P&C Portfolio] Official Portfolio Analytics',
  
  // Sheet name within the spreadsheet
  SHEET_NAME: 'Analytics Events',
  
  // Column headers
  HEADERS: ['Timestamp', 'Session ID', 'Tab ID', 'Event Type', 'Event Details', 'Session Age', 'Path', 'User Agent'],
  
  // Maximum rows before creating a new sheet (prevents performance issues)
  MAX_ROWS_PER_SHEET: 50000,
  
  // Enable debug logging
  DEBUG: false
};

// ==================== MAIN ENDPOINTS ====================

/**
 * Handle POST requests from the analytics frontend
 * This is the main entry point for receiving analytics data
 * 
 * @param {Object} e - Event object containing request data
 * @return {ContentService.TextOutput} JSON response
 */
function doPost(e) {
  try {
    // Log incoming request for debugging
    if (CONFIG.DEBUG) {
      Logger.log('Incoming POST request');
      Logger.log('Headers: ' + JSON.stringify(e));
    }
    
    // Parse the incoming JSON payload
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      Logger.log('ERROR: Failed to parse JSON payload: ' + parseError);
      return createResponse(false, 'Invalid JSON payload');
    }
    
    // Validate the payload structure
    const validationError = validatePayload(payload);
    if (validationError) {
      Logger.log('ERROR: Payload validation failed: ' + validationError);
      return createResponse(false, validationError);
    }
    
    // Get or create the spreadsheet
    const spreadsheet = getOrCreateSpreadsheet();
    if (!spreadsheet) {
      Logger.log('ERROR: Failed to get or create spreadsheet');
      return createResponse(false, 'Failed to access spreadsheet');
    }
    
    // Get or create the sheet
    const sheet = getOrCreateSheet(spreadsheet);
    if (!sheet) {
      Logger.log('ERROR: Failed to get or create sheet');
      return createResponse(false, 'Failed to access sheet');
    }
    
    // Append the data
    const appendResult = appendEventData(sheet, payload);
    if (!appendResult.success) {
      Logger.log('ERROR: Failed to append data: ' + appendResult.error);
      return createResponse(false, appendResult.error);
    }
    
    // Success!
    if (CONFIG.DEBUG) {
      Logger.log('✅ Event data appended successfully');
    }
    
    return createResponse(true, 'Event recorded successfully', {
      rowNumber: appendResult.rowNumber,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    // Catch-all error handler
    Logger.log('ERROR: Unexpected error in doPost: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    return createResponse(false, 'Internal server error: ' + error.message);
  }
}

/**
 * Handle GET requests (for testing/health check)
 * 
 * @param {Object} e - Event object
 * @return {ContentService.TextOutput} JSON response
 */
function doGet(e) {
  const response = {
    status: 'online',
    service: 'P&C Portfolio Analytics Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    message: 'Use POST to /exec with JSON payload to submit analytics events'
  };
  
  return createResponse(true, 'Service is online', response);
}

// ==================== PAYLOAD VALIDATION ====================

/**
 * Validate the incoming payload structure
 * 
 * @param {Object} payload - The parsed JSON payload
 * @return {string|null} Error message if invalid, null if valid
 */
function validatePayload(payload) {
  // Check if payload exists
  if (!payload) {
    return 'Payload is empty or null';
  }
  
  // Check required fields
  const requiredFields = ['timestamp', 'sessionId', 'eventType'];
  for (const field of requiredFields) {
    if (!payload[field]) {
      return `Missing required field: ${field}`;
    }
  }
  
  // Validate timestamp format (should be ISO 8601)
  if (typeof payload.timestamp !== 'string' || !payload.timestamp.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return 'Invalid timestamp format (expected ISO 8601)';
  }
  
  // Validate sessionId format (should start with 'sess_')
  if (typeof payload.sessionId !== 'string' || !payload.sessionId.startsWith('sess_')) {
    return 'Invalid sessionId format';
  }
  
  // Validate eventType (should be non-empty string)
  if (typeof payload.eventType !== 'string' || payload.eventType.length === 0) {
    return 'Invalid eventType';
  }
  
  // Optional: Validate eventDetails (should be object if present)
  if (payload.eventDetails !== undefined && typeof payload.eventDetails !== 'object') {
    return 'Invalid eventDetails (expected object)';
  }
  
  // All validations passed
  return null;
}

// ==================== SPREADSHEET MANAGEMENT ====================

/**
 * Get existing spreadsheet or create a new one
 * 
 * @return {Spreadsheet|null} The spreadsheet object or null on error
 */
function getOrCreateSpreadsheet() {
  try {
    // Get the target folder
    const folder = DriveApp.getFolderById(CONFIG.FOLDER_ID);
    
    // Search for existing spreadsheet by name
    const files = folder.getFilesByName(CONFIG.SPREADSHEET_NAME);
    
    if (files.hasNext()) {
      // Spreadsheet exists - open it
      const file = files.next();
      const spreadsheet = SpreadsheetApp.open(file);
      
      if (CONFIG.DEBUG) {
        Logger.log('✅ Found existing spreadsheet: ' + spreadsheet.getId());
      }
      
      return spreadsheet;
    } else {
      // Spreadsheet doesn't exist - create it
      const spreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
      
      // Move to correct folder
      const file = DriveApp.getFileById(spreadsheet.getId());
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
      
      if (CONFIG.DEBUG) {
        Logger.log('✅ Created new spreadsheet: ' + spreadsheet.getId());
      }
      
      return spreadsheet;
    }
  } catch (error) {
    Logger.log('ERROR in getOrCreateSpreadsheet: ' + error.toString());
    return null;
  }
}

/**
 * Get existing sheet or create a new one with headers
 * 
 * @param {Spreadsheet} spreadsheet - The parent spreadsheet
 * @return {Sheet|null} The sheet object or null on error
 */
function getOrCreateSheet(spreadsheet) {
  try {
    let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      // Sheet doesn't exist - create it
      sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
      
      // Add header row
      sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
      
      // Format header row
      sheet.getRange(1, 1, 1, CONFIG.HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#667eea')
        .setFontColor('#ffffff');
      
      // Freeze header row
      sheet.setFrozenRows(1);
      
      // Auto-resize columns
      for (let i = 1; i <= CONFIG.HEADERS.length; i++) {
        sheet.autoResizeColumn(i);
      }
      
      if (CONFIG.DEBUG) {
        Logger.log('✅ Created new sheet with headers');
      }
    }
    
    // Check if sheet is getting too large
    if (sheet.getLastRow() >= CONFIG.MAX_ROWS_PER_SHEET) {
      // Archive current sheet and create new one
      const timestamp = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd');
      sheet.setName(`${CONFIG.SHEET_NAME} (Archive ${timestamp})`);
      
      // Create new active sheet
      sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME, 0);
      sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
      sheet.getRange(1, 1, 1, CONFIG.HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#667eea')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      
      Logger.log('⚠️ Created new sheet due to row limit. Archived previous sheet.');
    }
    
    return sheet;
  } catch (error) {
    Logger.log('ERROR in getOrCreateSheet: ' + error.toString());
    return null;
  }
}

// ==================== DATA APPENDING ====================

/**
 * Append event data to the sheet
 * 
 * @param {Sheet} sheet - The target sheet
 * @param {Object} payload - The event data
 * @return {Object} Result object with success status
 */
function appendEventData(sheet, payload) {
  try {
    // Prepare row data matching the header columns
    const rowData = [
      payload.timestamp || '',
      payload.sessionId || '',
      payload.tabId || '',
      payload.eventType || '',
      JSON.stringify(payload.eventDetails || {}), // Convert object to JSON string
      payload.sessionAge || 0,
      payload.path || '',
      payload.userAgent || ''
    ];
    
    // Append the row
    sheet.appendRow(rowData);
    
    // Get the row number that was just added
    const rowNumber = sheet.getLastRow();
    
    // Optional: Add timestamp to column A if not already present
    // This ensures we have a timestamp even if payload doesn't include one
    if (!payload.timestamp) {
      sheet.getRange(rowNumber, 1).setValue(new Date().toISOString());
    }
    
    return {
      success: true,
      rowNumber: rowNumber
    };
    
  } catch (error) {
    Logger.log('ERROR in appendEventData: ' + error.toString());
    return {
      success: false,
      error: error.message
    };
  }
}

// ==================== RESPONSE UTILITIES ====================

/**
 * Create a standardized JSON response
 * 
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {Object} data - Optional additional data
 * @return {ContentService.TextOutput} JSON response with CORS headers
 */
function createResponse(success, message, data = {}) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString(),
    ...data
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handle OPTIONS requests for CORS preflight
 * 
 * @return {ContentService.TextOutput} Empty response with CORS headers
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '86400');
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Test function to verify the script works
 * Run this from the Script Editor to test
 */
function testBackend() {
  Logger.log('🧪 Testing Analytics Backend...\n');
  
  // Test 1: Get/Create Spreadsheet
  Logger.log('Test 1: Spreadsheet Access');
  const spreadsheet = getOrCreateSpreadsheet();
  Logger.log(spreadsheet ? '✅ Spreadsheet access successful' : '❌ Failed to access spreadsheet');
  
  // Test 2: Get/Create Sheet
  Logger.log('\nTest 2: Sheet Access');
  const sheet = getOrCreateSheet(spreadsheet);
  Logger.log(sheet ? '✅ Sheet access successful' : '❌ Failed to access sheet');
  
  // Test 3: Validate Payload
  Logger.log('\nTest 3: Payload Validation');
  const validPayload = {
    timestamp: new Date().toISOString(),
    sessionId: 'sess_test_12345',
    eventType: 'test_event',
    eventDetails: { test: true }
  };
  const validationError = validatePayload(validPayload);
  Logger.log(validationError ? '❌ Validation failed: ' + validationError : '✅ Validation successful');
  
  // Test 4: Append Test Data
  Logger.log('\nTest 4: Append Data');
  const appendResult = appendEventData(sheet, validPayload);
  Logger.log(appendResult.success ? '✅ Data append successful' : '❌ Data append failed: ' + appendResult.error);
  
  Logger.log('\n✅ All tests complete!');
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  Logger.log('Spreadsheet URL: ' + spreadsheet.getUrl());
}

/**
 * Get analytics summary statistics
 * Useful for viewing data from the script editor
 */
function getAnalyticsSummary() {
  try {
    const spreadsheet = getOrCreateSpreadsheet();
    const sheet = getOrCreateSheet(spreadsheet);
    
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.length).getValues();
    
    // Count events by type
    const eventCounts = {};
    const sessionIds = new Set();
    
    data.forEach(row => {
      const eventType = row[3]; // Event Type column
      const sessionId = row[1]; // Session ID column
      
      if (eventType) {
        eventCounts[eventType] = (eventCounts[eventType] || 0) + 1;
      }
      if (sessionId) {
        sessionIds.add(sessionId);
      }
    });
    
    Logger.log('📊 Analytics Summary:');
    Logger.log('Total Events: ' + (lastRow - 1));
    Logger.log('Unique Sessions: ' + sessionIds.size);
    Logger.log('Event Types:');
    for (const [type, count] of Object.entries(eventCounts)) {
      Logger.log(`  - ${type}: ${count}`);
    }
    Logger.log('\nSpreadsheet URL: ' + spreadsheet.getUrl());
    
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
  }
}

/**
 * Clear all analytics data (use with caution!)
 * This will delete all rows except the header
 */
function clearAnalyticsData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Clear All Analytics Data?',
    'This will permanently delete all analytics events. Are you sure?',
    ui.ButtonSet.YES_NO
  );
  
  if (response == ui.Button.YES) {
    try {
      const spreadsheet = getOrCreateSpreadsheet();
      const sheet = getOrCreateSheet(spreadsheet);
      
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
        Logger.log('✅ Cleared ' + (lastRow - 1) + ' rows');
        ui.alert('Success', 'All analytics data has been cleared.', ui.ButtonSet.OK);
      } else {
        Logger.log('⚠️ No data to clear');
        ui.alert('No Data', 'There is no analytics data to clear.', ui.ButtonSet.OK);
      }
    } catch (error) {
      Logger.log('ERROR: ' + error.toString());
      ui.alert('Error', 'Failed to clear data: ' + error.message, ui.ButtonSet.OK);
    }
  }
}

