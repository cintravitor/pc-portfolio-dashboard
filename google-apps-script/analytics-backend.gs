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
 * Handle GET requests (for testing/health check and governance data)
 * 
 * @param {Object} e - Event object
 * @return {ContentService.TextOutput} JSON response
 */
function doGet(e) {
  try {
    // Check if this is a governance data request
    const action = e.parameter.action;
    
    if (action === 'getGovernanceData') {
      Logger.log('🎯 Governance data request received');
      const governanceData = getGovernanceData();
      return createResponse(true, 'Governance data retrieved successfully', governanceData);
    }
    
    // Default health check response
    const response = {
      status: 'online',
      service: 'P&C Portfolio Analytics Backend',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      message: 'Use POST to /exec with JSON payload to submit analytics events. Use ?action=getGovernanceData for governance dashboard data.'
    };
    
    return createResponse(true, 'Service is online', response);
  } catch (error) {
    Logger.log('ERROR in doGet: ' + error.toString());
    return createResponse(false, 'Error: ' + error.message);
  }
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
 * @return {ContentService.TextOutput} JSON response
 * 
 * Note: CORS headers are automatically handled by Google Apps Script
 * when deployed as Web App with "Anyone" access
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
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle OPTIONS requests for CORS preflight
 * 
 * @return {ContentService.TextOutput} Empty response
 * 
 * Note: CORS is automatically handled by Google Apps Script
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
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

// ==================== GOVERNANCE DASHBOARD ENDPOINT ====================

/**
 * Get consolidated governance data for the dashboard
 * This endpoint aggregates all portfolio metrics needed for the governance view
 * 
 * @return {Object} Consolidated governance data
 */
function getGovernanceData() {
  try {
    Logger.log('📊 Starting governance data calculation...');
    
    // Open the P&C Portfolio spreadsheet
    const sheet = SpreadsheetApp.openById('10YL71NMZ9gfMBa2AQgKqn3KTtNzQjw01S-7PnXHsnyI')
      .getSheetByName('[2025] P&C Portfolio');
    
    if (!sheet) {
      throw new Error('Sheet "[2025] P&C Portfolio" not found');
    }
    
    // Read all data
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(2); // Skip header rows (row 1 and 2)
    
    Logger.log(`Processing ${rows.length} solutions...`);
    
    // Process and return consolidated metrics
    const governanceData = {
      smokeDetectors: calculateSmokeDetectorsSummary(rows, headers),
      bauAnomalies: calculateBAUAnomalies(rows, headers),
      dataHealth: calculateDataHealth(rows, headers),
      ptechInvolvement: calculatePTechInvolvement(rows, headers),
      teamConsumption: calculateTeamConsumption(rows, headers),
      performanceMetrics: calculatePerformanceMetrics(rows, headers),
      strategicGaps: calculateStrategicGaps(rows, headers),
      timestamp: new Date().toISOString()
    };
    
    Logger.log('✅ Governance data calculation complete');
    return governanceData;
    
  } catch (error) {
    Logger.log('ERROR in getGovernanceData: ' + error.toString());
    throw error;
  }
}

/**
 * Calculate Smoke Detectors Summary
 * Identifies solutions that trigger warning signals
 * 
 * @param {Array} rows - Data rows
 * @param {Array} headers - Column headers
 * @return {Object} Smoke detector summary with count and details
 */
function calculateSmokeDetectorsSummary(rows, headers) {
  const triggered = [];
  let totalCount = 0;
  
  // Helper to get column index
  const getColIdx = (name) => headers.indexOf(name);
  
  // Column indices
  const nameIdx = getColIdx('Solution name');
  const uxMetricIdx = getColIdx('Key Metric\nUser Experience');
  const biMetricIdx = getColIdx('Key Metric\nBusiness Impact');
  const maturityIdx = getColIdx('Maturity Stage');
  const janUXIdx = getColIdx('JAN');
  
  rows.forEach((row, idx) => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    
    const detectorTypes = [];
    
    // Detector 1: Missing Key Metrics
    const uxMetric = row[uxMetricIdx];
    const biMetric = row[biMetricIdx];
    if (!uxMetric || uxMetric === '' || uxMetric === 'N/A' || !biMetric || biMetric === '' || biMetric === 'N/A') {
      detectorTypes.push('Lacking Metrics');
    }
    
    // Detector 2: Decline Stage
    const maturity = row[maturityIdx];
    if (maturity && maturity.includes('Decline')) {
      detectorTypes.push('Maturity: Decline Stage');
    }
    
    // If any detector triggered, add to list
    if (detectorTypes.length > 0) {
      triggered.push({
        name: solutionName,
        triggers: detectorTypes,
        primaryTrigger: detectorTypes[0]
      });
      totalCount++;
    }
  });
  
  return {
    count: totalCount,
    triggered: triggered.slice(0, 20) // Limit to top 20 for performance
  };
}

/**
 * Calculate BAU Allocation Anomalies
 * Identifies solutions with high BAU hour allocations
 * 
 * @param {Array} rows - Data rows
 * @param {Array} headers - Column headers
 * @return {Object} BAU anomalies categorized by severity
 */
function calculateBAUAnomalies(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  
  const nameIdx = getColIdx('Solution name');
  const totalBAUIdx = getColIdx('Total\nHeadcount Allocation (BAU) in hours \n(Formula)');
  
  const high = []; // >=3800 hrs
  const flagged = []; // 1900-3799 hrs
  const normal = []; // <1900 hrs
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    
    const totalHours = parseFloat(row[totalBAUIdx]) || 0;
    
    const item = {
      name: solutionName,
      hours: totalHours
    };
    
    if (totalHours >= 3800) {
      high.push(item);
    } else if (totalHours >= 1900) {
      flagged.push(item);
    } else if (totalHours > 0) {
      normal.push(item);
    }
  });
  
  // Sort by hours descending
  high.sort((a, b) => b.hours - a.hours);
  flagged.sort((a, b) => b.hours - a.hours);
  
  return {
    high: high.slice(0, 15),
    flagged: flagged.slice(0, 15),
    normal: normal.slice(0, 10),
    summary: {
      highCount: high.length,
      flaggedCount: flagged.length,
      normalCount: normal.length
    }
  };
}

/**
 * Calculate Data Health Metrics
 * Counts solutions with missing or incomplete data
 * 
 * @param {Array} rows - Data rows
 * @param {Array} headers - Column headers
 * @return {Object} Data health statistics
 */
function calculateDataHealth(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  
  const nameIdx = getColIdx('Solution name');
  const uxMetricIdx = getColIdx('Key Metric\nUser Experience');
  const biMetricIdx = getColIdx('Key Metric\nBusiness Impact');
  const ownerIdx = getColIdx('Owner\'s Name');
  
  let missingUX = 0;
  let missingBI = 0;
  let missingOwner = 0;
  let totalSolutions = 0;
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    
    totalSolutions++;
    
    const uxMetric = row[uxMetricIdx];
    const biMetric = row[biMetricIdx];
    const owner = row[ownerIdx];
    
    if (!uxMetric || uxMetric === '' || uxMetric === 'N/A') missingUX++;
    if (!biMetric || biMetric === '' || biMetric === 'N/A') missingBI++;
    if (!owner || owner === '' || owner === 'N/A') missingOwner++;
  });
  
  const healthScore = Math.round((1 - ((missingUX + missingBI) / (totalSolutions * 2))) * 100);
  
  return {
    totalSolutions,
    missingUX,
    missingBI,
    missingOwner,
    missingMetrics: missingUX + missingBI,
    healthScore
  };
}

/**
 * Calculate PTech Involvement Distribution
 * Groups solutions by People Tech team involvement
 * 
 * @param {Array} rows - Data rows
 * @param {Array} headers - Column headers
 * @return {Object} PTech involvement statistics
 */
function calculatePTechInvolvement(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  
  const nameIdx = getColIdx('Solution name');
  const ptechIdx = getColIdx('[ONLY For PTech] \nPeople Tech Involvement Flag');
  
  let withPTech = 0;
  let withoutPTech = 0;
  const ptechSolutions = [];
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    
    const ptechFlag = row[ptechIdx];
    
    if (ptechFlag === true || ptechFlag === 'TRUE' || ptechFlag === 'YES') {
      withPTech++;
      ptechSolutions.push(solutionName);
    } else {
      withoutPTech++;
    }
  });
  
  return {
    withPTech,
    withoutPTech,
    ptechSolutions: ptechSolutions.slice(0, 20),
    percentage: Math.round((withPTech / (withPTech + withoutPTech)) * 100)
  };
}

/**
 * Calculate Team Consumption by BAU Hours
 * Sums hours allocated to each team (PJC, PATO, TA, HRBP, PSE)
 * 
 * @param {Array} rows - Data rows
 * @param {Array} headers - Column headers
 * @return {Array} Team consumption ranked by hours
 */
function calculateTeamConsumption(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  
  const pjcIdx = getColIdx('PJC \nHeadcount Allocation (BAU) in hours in a year \n*only input numbers');
  const patoIdx = getColIdx('PATO\nHeadcount Allocation (BAU) in hours in a year \n*only input numbers');
  const taIdx = getColIdx('Talent Acquisition\nHeadcount Allocation (BAU) in hours in a year \n*only input numbers');
  const hrbpIdx = getColIdx('HRBP\nHeadcount Allocation (BAU) in hours in a year \n*only input numbers');
  const pseIdx = getColIdx('PSE\nHeadcount Allocation (BAU) in hours in a year \n*only input numbers');
  
  const teams = {
    'PJC': 0,
    'PATO': 0,
    'Talent Acquisition': 0,
    'HRBP': 0,
    'PSE': 0
  };
  
  rows.forEach(row => {
    teams['PJC'] += parseFloat(row[pjcIdx]) || 0;
    teams['PATO'] += parseFloat(row[patoIdx]) || 0;
    teams['Talent Acquisition'] += parseFloat(row[taIdx]) || 0;
    teams['HRBP'] += parseFloat(row[hrbpIdx]) || 0;
    teams['PSE'] += parseFloat(row[pseIdx]) || 0;
  });
  
  // Convert to array and sort by hours descending
  const teamArray = Object.entries(teams).map(([name, hours]) => ({
    team: name,
    hours: Math.round(hours),
    fte: (hours / 1900).toFixed(2)
  }));
  
  teamArray.sort((a, b) => b.hours - a.hours);
  
  return teamArray;
}

/**
 * Calculate Performance Metrics
 * Gets last month UX and BI metrics vs targets
 * 
 * @param {Array} rows - Data rows
 * @param {Array} headers - Column headers
 * @return {Object} Performance metrics summary
 */
function calculatePerformanceMetrics(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  
  const nameIdx = getColIdx('Solution name');
  const uxMetricIdx = getColIdx('Key Metric\nUser Experience');
  const uxTargetIdx = getColIdx('TARGET');
  const biMetricIdx = getColIdx('Key Metric\nBusiness Impact');
  
  // Find the latest month column (SEP is latest in the data)
  const sepUXIdx = headers.indexOf('SEP');
  
  let uxAboveTarget = 0;
  let uxBelowTarget = 0;
  let uxNoData = 0;
  let biWithData = 0;
  let biNoData = 0;
  
  const uxSamples = [];
  const biSamples = [];
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    
    // UX Metrics
    const uxMetric = row[uxMetricIdx];
    const uxTarget = parseFloat(row[uxTargetIdx]);
    const lastMonthUX = parseFloat(row[sepUXIdx]);
    
    if (uxMetric && uxMetric !== 'N/A' && !isNaN(lastMonthUX) && !isNaN(uxTarget)) {
      if (lastMonthUX >= uxTarget) {
        uxAboveTarget++;
        uxSamples.push({ name: solutionName, value: lastMonthUX, target: uxTarget, status: 'above' });
      } else {
        uxBelowTarget++;
        uxSamples.push({ name: solutionName, value: lastMonthUX, target: uxTarget, status: 'below' });
      }
    } else {
      uxNoData++;
    }
    
    // BI Metrics
    const biMetric = row[biMetricIdx];
    if (biMetric && biMetric !== 'N/A') {
      biWithData++;
      biSamples.push({ name: solutionName, metric: biMetric });
    } else {
      biNoData++;
    }
  });
  
  const totalWithUX = uxAboveTarget + uxBelowTarget;
  const uxAchievementRate = totalWithUX > 0 ? Math.round((uxAboveTarget / totalWithUX) * 100) : 0;
  
  return {
    ux: {
      aboveTarget: uxAboveTarget,
      belowTarget: uxBelowTarget,
      noData: uxNoData,
      achievementRate: uxAchievementRate,
      samples: uxSamples.slice(0, 10)
    },
    bi: {
      withData: biWithData,
      noData: biNoData,
      samples: biSamples.slice(0, 10)
    }
  };
}

/**
 * Calculate Strategic Gaps and Distribution
 * Analyzes portfolio distribution by area and maturity
 * 
 * @param {Array} rows - Data rows
 * @param {Array} headers - Column headers
 * @return {Object} Strategic distribution data
 */
function calculateStrategicGaps(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  
  const nameIdx = getColIdx('Solution name');
  const areaIdx = getColIdx('P\'n\'C Area');
  const maturityIdx = getColIdx('Maturity Stage');
  
  const byArea = {};
  const byMaturity = {};
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    
    const area = row[areaIdx] || 'Unspecified';
    const maturity = row[maturityIdx] || 'Unspecified';
    
    byArea[area] = (byArea[area] || 0) + 1;
    byMaturity[maturity] = (byMaturity[maturity] || 0) + 1;
  });
  
  // Convert to arrays
  const areaDistribution = Object.entries(byArea).map(([name, count]) => ({ name, count }));
  const maturityDistribution = Object.entries(byMaturity).map(([name, count]) => ({ name, count }));
  
  // Sort by count
  areaDistribution.sort((a, b) => b.count - a.count);
  maturityDistribution.sort((a, b) => b.count - a.count);
  
  return {
    byArea: areaDistribution,
    byMaturity: maturityDistribution
  };
}

