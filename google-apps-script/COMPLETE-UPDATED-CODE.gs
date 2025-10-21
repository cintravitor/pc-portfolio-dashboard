/**
 * P&C Portfolio Data API with Governance Dashboard Endpoint
 * Google Apps Script Web App
 * Version: 2.1 (Enhanced Governance Metrics)
 * 
 * INSTRUCTIONS: Copy this ENTIRE file and replace your existing Apps Script code
 */

// ==================== MAIN ENDPOINT ====================

function doGet(e) {
  try {
    const action = e.parameter ? e.parameter.action : null;
    
    if (action === 'getGovernanceData') {
      Logger.log('🎯 Governance data request received');
      const governanceData = getGovernanceData();
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Governance data retrieved successfully',
          ...governanceData
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // DEFAULT: Return raw sheet data (backward compatible)
    const spreadsheetId = '10YL71NMZ9gfMBa2AQgKqn3KTtNzQjw01S-7PnXHsnyI';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheetName = '[2025] P&C Portfolio';
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }
    
    const data = sheet.getDataRange().getValues();
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: data,
        sheetName: sheetName,
        lastUpdated: new Date().toISOString(),
        rowCount: data.length,
        columnCount: data.length > 0 ? data[0].length : 0
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Failed to fetch data from Google Sheet'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== GOVERNANCE DASHBOARD ENDPOINT ====================

function getGovernanceData() {
  try {
    Logger.log('📊 Starting governance data calculation...');
    
    const sheet = SpreadsheetApp.openById('10YL71NMZ9gfMBa2AQgKqn3KTtNzQjw01S-7PnXHsnyI')
      .getSheetByName('[2025] P&C Portfolio');
    
    if (!sheet) {
      throw new Error('Sheet "[2025] P&C Portfolio" not found');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[1]; // Row 1 has column names
    const rows = data.slice(2); // Skip rows 0 and 1
    
    Logger.log(`Processing ${rows.length} solutions...`);
    
    const governanceData = {
      smokeDetectors: calculateSmokeDetectorsSummary(rows, headers),
      bauAnomalies: calculateBAUAnomalies(rows, headers),
      dataHealth: calculateDataHealth(rows, headers),
      ptechInvolvement: calculatePTechInvolvement(rows, headers),
      teamConsumption: calculateTeamConsumption(rows, headers),
      performanceMetrics: calculatePerformanceMetrics(rows, headers),
      strategicGaps: calculateStrategicGaps(rows, headers),
      // NEW METRICS
      metricsCoverage: calculateMetricsCoverage(rows, headers),
      portfolioDistribution: calculatePortfolioDistribution(rows, headers),
      ptechByArea: calculatePTechByArea(rows, headers),
      bauDedication: calculateBAUDedication(rows, headers),
      timestamp: new Date().toISOString()
    };
    
    Logger.log('✅ Governance data calculation complete');
    return governanceData;
    
  } catch (error) {
    Logger.log('ERROR in getGovernanceData: ' + error.toString());
    throw error;
  }
}

// ==================== EXISTING HELPER FUNCTIONS ====================

function calculateSmokeDetectorsSummary(rows, headers) {
  const triggered = [];
  let totalCount = 0;
  const getColIdx = (name) => headers.indexOf(name);
  const nameIdx = getColIdx('Solution name');
  const uxMetricIdx = getColIdx('Key Metric\nUser Experience');
  const biMetricIdx = getColIdx('Key Metric\nBusiness Impact');
  const maturityIdx = getColIdx('Maturity Stage');
  
  rows.forEach((row) => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    const detectorTypes = [];
    const uxMetric = row[uxMetricIdx];
    const biMetric = row[biMetricIdx];
    if (!uxMetric || uxMetric === '' || uxMetric === 'N/A' || !biMetric || biMetric === '' || biMetric === 'N/A') {
      detectorTypes.push('Lacking Metrics');
    }
    const maturity = row[maturityIdx];
    if (maturity && maturity.toString().includes('Decline')) {
      detectorTypes.push('Maturity: Decline Stage');
    }
    if (detectorTypes.length > 0) {
      triggered.push({ name: solutionName, triggers: detectorTypes, primaryTrigger: detectorTypes[0] });
      totalCount++;
    }
  });
  return { count: totalCount, triggered: triggered.slice(0, 20) };
}

function calculateBAUAnomalies(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  const nameIdx = getColIdx('Solution name');
  const totalBAUIdx = getColIdx('Total\nHeadcount Allocation (BAU) in hours \n(Formula)');
  const high = [], flagged = [], normal = [];
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    const totalHours = parseFloat(row[totalBAUIdx]) || 0;
    const item = { name: solutionName, hours: totalHours };
    if (totalHours >= 3800) high.push(item);
    else if (totalHours >= 1900) flagged.push(item);
    else if (totalHours > 0) normal.push(item);
  });
  
  high.sort((a, b) => b.hours - a.hours);
  flagged.sort((a, b) => b.hours - a.hours);
  
  return {
    high: high.slice(0, 15),
    flagged: flagged.slice(0, 15),
    normal: normal.slice(0, 10),
    summary: { highCount: high.length, flaggedCount: flagged.length, normalCount: normal.length }
  };
}

function calculateDataHealth(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  const nameIdx = getColIdx('Solution name');
  const uxMetricIdx = getColIdx('Key Metric\nUser Experience');
  const biMetricIdx = getColIdx('Key Metric\nBusiness Impact');
  const ownerIdx = getColIdx('Owner\'s Name');
  
  let missingUX = 0, missingBI = 0, missingOwner = 0, totalSolutions = 0;
  
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
    totalSolutions, missingUX, missingBI, missingOwner,
    missingMetrics: missingUX + missingBI, healthScore
  };
}

function calculatePTechInvolvement(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  const nameIdx = getColIdx('Solution name');
  const ptechIdx = getColIdx('[ONLY For PTech] \nPeople Tech Involvement Flag');
  
  let withPTech = 0, withoutPTech = 0;
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
    withPTech, withoutPTech, ptechSolutions: ptechSolutions.slice(0, 20),
    percentage: Math.round((withPTech / (withPTech + withoutPTech)) * 100)
  };
}

function calculateTeamConsumption(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  const pjcIdx = getColIdx('PJC \nHeadcount Allocation (BAU) in hours in a year \n*only input numbers');
  const patoIdx = getColIdx('PATO\nHeadcount Allocation (BAU) in hours in a year \n*only input numbers');
  const taIdx = getColIdx('Talent Acquisition\nHeadcount Allocation (BAU) in hours in a year \n*only input numbers');
  const hrbpIdx = getColIdx('HRBP\nHeadcount Allocation (BAU) in hours in a year \n*only input numbers');
  const pseIdx = getColIdx('PSE\nHeadcount Allocation (BAU) in hours in a year \n*only input numbers');
  
  const teams = { 'PJC': 0, 'PATO': 0, 'Talent Acquisition': 0, 'HRBP': 0, 'PSE': 0 };
  
  rows.forEach(row => {
    teams['PJC'] += parseFloat(row[pjcIdx]) || 0;
    teams['PATO'] += parseFloat(row[patoIdx]) || 0;
    teams['Talent Acquisition'] += parseFloat(row[taIdx]) || 0;
    teams['HRBP'] += parseFloat(row[hrbpIdx]) || 0;
    teams['PSE'] += parseFloat(row[pseIdx]) || 0;
  });
  
  const teamArray = Object.entries(teams).map(([name, hours]) => ({
    team: name, hours: Math.round(hours), fte: (hours / 1900).toFixed(2)
  }));
  teamArray.sort((a, b) => b.hours - a.hours);
  return teamArray;
}

function calculatePerformanceMetrics(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  const nameIdx = getColIdx('Solution name');
  const uxMetricIdx = getColIdx('Key Metric\nUser Experience');
  const uxTargetIdx = getColIdx('TARGET');
  const biMetricIdx = getColIdx('Key Metric\nBusiness Impact');
  const sepUXIdx = headers.indexOf('SEP');
  
  let uxAboveTarget = 0, uxBelowTarget = 0, uxNoData = 0, biWithData = 0, biNoData = 0;
  const uxSamples = [], biSamples = [];
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
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
    ux: { aboveTarget: uxAboveTarget, belowTarget: uxBelowTarget, noData: uxNoData, achievementRate: uxAchievementRate, samples: uxSamples.slice(0, 10) },
    bi: { withData: biWithData, noData: biNoData, samples: biSamples.slice(0, 10) }
  };
}

function calculateStrategicGaps(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  const nameIdx = getColIdx('Solution name');
  const areaIdx = getColIdx('P\'n\'C Area');
  const maturityIdx = getColIdx('Maturity Stage');
  const byArea = {}, byMaturity = {};
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    const area = row[areaIdx] || 'Unspecified';
    const maturity = row[maturityIdx] || 'Unspecified';
    byArea[area] = (byArea[area] || 0) + 1;
    byMaturity[maturity] = (byMaturity[maturity] || 0) + 1;
  });
  
  const areaDistribution = Object.entries(byArea).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const maturityDistribution = Object.entries(byMaturity).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  
  return { byArea: areaDistribution, byMaturity: maturityDistribution };
}

// ==================== NEW METRICS FUNCTIONS ====================

function calculateMetricsCoverage(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  const nameIdx = getColIdx('Solution name');
  const uxMetricIdx = getColIdx('Key Metric\nUser Experience');
  const biMetricIdx = getColIdx('Key Metric\nBusiness Impact');
  const uxTargetIdx = getColIdx('TARGET');
  const currentMonthIdx = headers.indexOf('OCT'); // Current month
  
  // Try to find BI current month column (after BI section)
  const biTargetIdx = headers.indexOf('TARGET', uxTargetIdx + 1);
  const biCurrentMonthIdx = biTargetIdx !== -1 ? headers.indexOf('OCT', biTargetIdx) : -1;
  
  // For automation, the data might not exist yet, so we'll keep them as 0
  // If you add these columns later, update the logic here
  const uxAutomationIdx = -1; // Set to -1 if column doesn't exist
  const biAutomationIdx = -1; // Set to -1 if column doesn't exist
  
  let totalSolutions = 0, uxMetricDefined = 0, uxCurrentMonthFilled = 0, uxReachedTarget = 0, uxAutomated = 0;
  let biMetricDefined = 0, biCurrentMonthFilled = 0, biReachedTarget = 0, biAutomated = 0;
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    totalSolutions++;
    
    // UX Metrics
    const uxMetric = row[uxMetricIdx];
    if (uxMetric && uxMetric !== '' && uxMetric !== 'N/A') {
      uxMetricDefined++;
      if (currentMonthIdx !== -1) {
        const currentMonthValue = row[currentMonthIdx];
        if (currentMonthValue && currentMonthValue !== '' && currentMonthValue !== 'N/A' && parseFloat(currentMonthValue) !== 0) {
          uxCurrentMonthFilled++;
          const target = parseFloat(row[uxTargetIdx]);
          const value = parseFloat(currentMonthValue);
          if (!isNaN(target) && !isNaN(value) && value >= target) uxReachedTarget++;
        }
      }
    }
    
    // BI Metrics - Fixed: Check actual current month data, not just metric definition
    const biMetric = row[biMetricIdx];
    if (biMetric && biMetric !== '' && biMetric !== 'N/A') {
      biMetricDefined++;
      // Check if BI current month data exists
      if (biCurrentMonthIdx !== -1) {
        const biCurrentMonthValue = row[biCurrentMonthIdx];
        if (biCurrentMonthValue && biCurrentMonthValue !== '' && biCurrentMonthValue !== 'N/A' && parseFloat(biCurrentMonthValue) !== 0) {
          biCurrentMonthFilled++;
        }
      }
    }
    
    // Automation checks (if columns exist)
    if (uxAutomationIdx !== -1) {
      const uxAuto = row[uxAutomationIdx];
      if (uxAuto === true || uxAuto === 'TRUE' || uxAuto === 'YES' || uxAuto === 'Yes') uxAutomated++;
    }
    if (biAutomationIdx !== -1) {
      const biAuto = row[biAutomationIdx];
      if (biAuto === true || biAuto === 'TRUE' || biAuto === 'YES' || biAuto === 'Yes') biAutomated++;
    }
  });
  
  return {
    totalSolutions,
    ux: {
      metricDefined: uxMetricDefined, metricDefinedPercent: Math.round((uxMetricDefined / totalSolutions) * 100),
      currentMonthFilled: uxCurrentMonthFilled, currentMonthFilledPercent: Math.round((uxCurrentMonthFilled / totalSolutions) * 100),
      reachedTarget: uxReachedTarget, reachedTargetPercent: uxMetricDefined > 0 ? Math.round((uxReachedTarget / uxMetricDefined) * 100) : 0,
      automated: uxAutomated, automatedPercent: uxAutomationIdx !== -1 ? Math.round((uxAutomated / totalSolutions) * 100) : null
    },
    bi: {
      metricDefined: biMetricDefined, metricDefinedPercent: Math.round((biMetricDefined / totalSolutions) * 100),
      currentMonthFilled: biCurrentMonthFilled, currentMonthFilledPercent: biCurrentMonthIdx !== -1 ? Math.round((biCurrentMonthFilled / totalSolutions) * 100) : null,
      reachedTarget: biReachedTarget, reachedTargetPercent: biMetricDefined > 0 ? Math.round((biReachedTarget / biMetricDefined) * 100) : 0,
      automated: biAutomated, automatedPercent: biAutomationIdx !== -1 ? Math.round((biAutomated / totalSolutions) * 100) : null
    }
  };
}

function calculatePortfolioDistribution(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  const nameIdx = getColIdx('Solution name');
  const journeyMainIdx = getColIdx('Main Journey Stage Impacted');
  const journeyCollateralIdx = getColIdx('Collateral Journey Stage Impacted');
  const targetUserIdx = getColIdx('Target User');
  const regulatoryIdx = getColIdx('Is a regulatory demand?');
  const platformIdx = getColIdx('User Interface Platform');
  
  const byJourney = {}, byTargetUser = {}, byPlatform = {};
  let regulatoryCount = 0, nonRegulatoryCount = 0;
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    
    const journeyMain = row[journeyMainIdx];
    const journeyCollateral = row[journeyCollateralIdx];
    if (journeyMain && journeyMain !== '' && journeyMain !== 'N/A') byJourney[journeyMain] = (byJourney[journeyMain] || 0) + 1;
    if (journeyCollateral && journeyCollateral !== '' && journeyCollateral !== 'N/A' && journeyCollateral !== journeyMain) {
      byJourney[journeyCollateral] = (byJourney[journeyCollateral] || 0) + 1;
    }
    
    const targetUser = row[targetUserIdx] || 'Unspecified';
    byTargetUser[targetUser] = (byTargetUser[targetUser] || 0) + 1;
    
    const platform = row[platformIdx] || 'Unspecified';
    byPlatform[platform] = (byPlatform[platform] || 0) + 1;
    
    const regulatory = (row[regulatoryIdx] || '').toString().toLowerCase();
    if (regulatory.includes('yes')) regulatoryCount++;
    else nonRegulatoryCount++;
  });
  
  const journeyDistribution = Object.entries(byJourney).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const targetUserDistribution = Object.entries(byTargetUser).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const platformDistribution = Object.entries(byPlatform).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const totalSolutions = regulatoryCount + nonRegulatoryCount;
  
  return {
    byJourney: journeyDistribution,
    byTargetUser: targetUserDistribution,
    byPlatform: platformDistribution,
    regulatory: {
      yes: regulatoryCount, no: nonRegulatoryCount,
      yesPercent: Math.round((regulatoryCount / totalSolutions) * 100),
      noPercent: Math.round((nonRegulatoryCount / totalSolutions) * 100)
    }
  };
}

function calculatePTechByArea(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  const nameIdx = getColIdx('Solution name');
  const areaIdx = getColIdx('P\'n\'C Area');
  const ptechIdx = getColIdx('[ONLY For PTech] \nPeople Tech Involvement Flag');
  const areaStats = {};
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    const area = row[areaIdx] || 'Unspecified';
    const ptechFlag = row[ptechIdx];
    const hasPTech = ptechFlag === true || ptechFlag === 'TRUE' || ptechFlag === 'YES';
    
    if (!areaStats[area]) areaStats[area] = { total: 0, withPTech: 0, withoutPTech: 0 };
    areaStats[area].total++;
    if (hasPTech) areaStats[area].withPTech++;
    else areaStats[area].withoutPTech++;
  });
  
  const ptechByArea = Object.entries(areaStats).map(([area, stats]) => ({
    area, total: stats.total, withPTech: stats.withPTech, withoutPTech: stats.withoutPTech,
    percentWithPTech: Math.round((stats.withPTech / stats.total) * 100)
  }));
  ptechByArea.sort((a, b) => b.total - a.total);
  return ptechByArea;
}

function calculateBAUDedication(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  const nameIdx = getColIdx('Solution name');
  const totalHoursIdx = getColIdx('Total\nHeadcount Allocation (BAU) in hours \n(Formula)');
  const totalHCIdx = getColIdx('Total\nHeadcount Allocation (BAU) in # HC \n(Formula)');
  const solutions = [];
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    const hours = parseFloat(row[totalHoursIdx]) || 0;
    const hc = parseFloat(row[totalHCIdx]) || 0;
    if (hours > 0) solutions.push({ name: solutionName, hoursPerYear: Math.round(hours), fullyDedicatedHC: parseFloat(hc.toFixed(2)) });
  });
  
  solutions.sort((a, b) => b.hoursPerYear - a.hoursPerYear);
  return {
    topSolutions: solutions.slice(0, 20),
    totalHours: solutions.reduce((sum, s) => sum + s.hoursPerYear, 0),
    totalHC: solutions.reduce((sum, s) => sum + s.fullyDedicatedHC, 0)
  };
}

