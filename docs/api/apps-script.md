# Apps Script Backend API

## Overview

Google Apps Script backend provides two main endpoints for data access.

**Base URL**: `https://script.google.com/macros/s/[YOUR_ID]/exec`

## Endpoints

### 1. Get Raw Portfolio Data (Default)

**Request**:
```
GET /exec
```

**Response**:
```javascript
{
    success: true,
    data: [
        [/* Row 1 - Section headers */],
        [/* Row 2 - Column names */],
        [/* Row 3+ - Solution data */],
        //...
    ],
    sheetName: "[2025] P&C Portfolio",
    lastUpdated: "2025-10-21T12:34:56.789Z",
    rowCount: 86,       // Including header rows
    columnCount: 45
}
```

**Example**:
```javascript
const response = await fetch(CONFIG.WEB_APP_URL);
const result = await response.json();
console.log(`Loaded ${result.rowCount} rows`);
```

### 2. Get Governance Data (Processed)

**Request**:
```
GET /exec?action=getGovernanceData
```

**Response**:
```javascript
{
    success: true,
    message: "Governance data retrieved successfully",
    smokeDetectors: {
        count: 15,
        triggered: [
            {
                name: "Solution Name",
                triggers: ["Lacking Metrics", "Decline Stage"],
                primaryTrigger: "Lacking Metrics"
            }
        ]
    },
    bauAnomalies: {
        high: [{name, hours}, ...],     // ≥3800 hrs/year
        flagged: [{name, hours}, ...],  // 1900-3799 hrs/year
        normal: [{name, hours}, ...],   // <1900 hrs/year
        summary: {
            highCount: 5,
            flaggedCount: 12,
            normalCount: 67
        }
    },
    dataHealth: {
        totalSolutions: 84,
        missingUX: 10,
        missingBI: 5,
        missingOwner: 2,
        missingMetrics: 15,
        healthScore: 85
    },
    ptechInvolvement: {
        withPTech: 25,
        withoutPTech: 59,
        ptechSolutions: ["Solution 1", "Solution 2", ...],
        percentage: 30
    },
    teamConsumption: [
        {
            team: "PJC",
            hours: 45000,
            fte: "23.68"
        },
        // ... other teams
    ],
    performanceMetrics: {
        ux: {
            aboveTarget: 15,
            belowTarget: 10,
            noData: 59,
            achievementRate: 60,
            samples: [...]
        },
        bi: {
            withData: 81,
            noData: 3,
            samples: [...]
        }
    },
    strategicGaps: {
        byArea: [
            {name: "PATO", count: 38},
            {name: "PSE", count: 15},
            // ...
        ],
        byMaturity: [
            {name: "3. Mature", count: 45},
            {name: "2. Growth", count: 23},
            // ...
        ]
    },
    timestamp: "2025-10-21T12:34:56.789Z"
}
```

**Example**:
```javascript
const url = `${CONFIG.WEB_APP_URL}?action=getGovernanceData`;
const response = await fetch(url);
const data = await response.json();
console.log(`Smoke detectors: ${data.smokeDetectors.count}`);
```

## Deployment

### Initial Setup

1. Open Google Sheet
2. Extensions → Apps Script
3. Paste backend code from `google-apps-script/analytics-backend.gs`
4. Save (Cmd+S / Ctrl+S)

### Deploy as Web App

1. Click **Deploy → New deployment**
2. Type: **Web app**
3. Description: "P&C Portfolio Backend v6.3.0"
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Click **Deploy**
7. Copy Web App URL

### Update Deployment

**Option A: Using HEAD (Recommended for Development)**

1. Deploy → Manage deployments
2. Edit active deployment
3. Change version to "Head (latest code)"
4. Deploy
5. **No need to redeploy** - changes take effect immediately on save

**Option B: Versioned Deployment (Production)**

1. Deploy → Manage deployments
2. Edit active deployment
3. Change version to "New version"
4. Add description
5. Deploy

## Backend Functions

### Core Functions

```javascript
// Main router
function doGet(e) {
    const action = e.parameter.action;
    if (action === 'getGovernanceData') {
        return getGovernanceData();
    }
    return getRawData();
}

// Governance data orchestrator
function getGovernanceData() {
    const sheet = openSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[1];  // Row 2
    const rows = data.slice(2);  // Skip headers
    
    return {
        smokeDetectors: calculateSmokeDetectorsSummary(rows, headers),
        bauAnomalies: calculateBAUAnomalies(rows, headers),
        // ... other calculations
    };
}

// Helper functions
function calculateSmokeDetectorsSummary(rows, headers) {...}
function calculateBAUAnomalies(rows, headers) {...}
function calculateDataHealth(rows, headers) {...}
function calculatePTechInvolvement(rows, headers) {...}
function calculateTeamConsumption(rows, headers) {...}
function calculatePerformanceMetrics(rows, headers) {...}
function calculateStrategicGaps(rows, headers) {...}
```

## Error Handling

Backend returns consistent error format:

```javascript
{
    success: false,
    error: "Error message",
    message: "User-friendly description",
    spreadsheetId: "10YL71NMZ9gfMBa2AQgKqn3KTtNzQjw01S-7PnXHsnyI"
}
```

**Example Error Response**:
```javascript
{
    success: false,
    error: "Sheet '[2025] P&C Portfolio' not found",
    message: "Failed to fetch data from Google Sheet"
}
```

## Testing

### Test Endpoints Directly

**Raw Data**:
```bash
curl "https://script.google.com/macros/s/[ID]/exec"
```

**Governance Data**:
```bash
curl "https://script.google.com/macros/s/[ID]/exec?action=getGovernanceData"
```

### Test in Apps Script Editor

1. Select function to test
2. Click **Run**
3. Check execution log
4. Verify no errors

### Test in Browser

Visit URL directly in browser:
```
https://script.google.com/macros/s/[ID]/exec?action=getGovernanceData
```

Should display JSON response.

## Performance

### Current Performance
- **Response time**: 1-3 seconds
- **Data size**: ~500KB uncompressed
- **Concurrent users**: Limited by Apps Script quotas

### Apps Script Quotas
- **URL Fetch calls**: 20,000/day
- **Execution time**: 6 minutes/execution
- **Trigger total runtime**: 90 minutes/day

## Security

### Access Control
- **Execute as**: "Me" (your account)
- **Who has access**: "Anyone" (with link)
- **Note**: Sheet permissions separate from script

### Data Privacy
- No sensitive data in responses
- Sheet access controlled separately
- Script logs visible only to owner

## Troubleshooting

### Common Issues

**"Authorization required"**
- Solution: Complete authorization flow during deployment

**"Sheet not found"**
- Solution: Verify sheet name matches exactly: `[2025] P&C Portfolio`

**"Timeout"**
- Solution: Reduce data processing or increase timeout

**"CORS error"**
- Solution: Ensure `ContentService.createTextOutput()` with JSON MIME type

### Debugging

**View Execution Logs**:
1. Apps Script Editor
2. Executions (left sidebar)
3. Click execution to see logs

**Add Logging**:
```javascript
Logger.log('Processing ' + rows.length + ' solutions');
Logger.log('Data health: ' + JSON.stringify(dataHealth));
```

## Related Documentation

- [Data Manager API](data-manager.md)
- [UI Modules API](ui-modules.md)
- [Deployment Guide](../getting-started/deployment.md)

