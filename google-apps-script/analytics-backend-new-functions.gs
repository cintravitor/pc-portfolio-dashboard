/**
 * NEW GOVERNANCE METRICS FUNCTIONS
 * Add these functions to analytics-backend.gs after calculateStrategicGaps()
 */

/**
 * Calculate Metrics Coverage Statistics
 * Tracks UX and BI metric coverage, current month fill rates, and automation
 */
function calculateMetricsCoverage(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  
  const nameIdx = getColIdx('Solution name');
  const uxMetricIdx = getColIdx('Key Metric\nUser Experience');
  const biMetricIdx = getColIdx('Key Metric\nBusiness Impact');
  const uxTargetIdx = getColIdx('TARGET');
  
  // Get current month column (October = OCT)
  const currentMonth = 'OCT'; // You can make this dynamic
  const currentMonthIdx = headers.indexOf(currentMonth);
  
  // Find automation columns (if they exist)
  const biAutomationIdx = headers.indexOf('BI Metric Automated?');
  const uxAutomationIdx = headers.indexOf('UX Metric Automated?');
  
  let totalSolutions = 0;
  
  // UX Metrics
  let uxMetricDefined = 0;
  let uxCurrentMonthFilled = 0;
  let uxReachedTarget = 0;
  let uxAutomated = 0;
  
  // BI Metrics
  let biMetricDefined = 0;
  let biCurrentMonthFilled = 0;
  let biReachedTarget = 0;
  let biAutomated = 0;
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    
    totalSolutions++;
    
    // UX Metric checks
    const uxMetric = row[uxMetricIdx];
    if (uxMetric && uxMetric !== '' && uxMetric !== 'N/A') {
      uxMetricDefined++;
      
      // Check current month data
      if (currentMonthIdx !== -1) {
        const currentMonthValue = row[currentMonthIdx];
        if (currentMonthValue && currentMonthValue !== '' && currentMonthValue !== 'N/A' && currentMonthValue !== 0) {
          uxCurrentMonthFilled++;
          
          // Check if reached target
          const target = parseFloat(row[uxTargetIdx]);
          const value = parseFloat(currentMonthValue);
          if (!isNaN(target) && !isNaN(value) && value >= target) {
            uxReachedTarget++;
          }
        }
      }
    }
    
    // BI Metric checks
    const biMetric = row[biMetricIdx];
    if (biMetric && biMetric !== '' && biMetric !== 'N/A') {
      biMetricDefined++;
      
      // For BI, we check if there's any recent data (simplified)
      if (biMetric) {
        biCurrentMonthFilled++; // Assume if metric is defined, it has data
      }
    }
    
    // Automation checks
    if (uxAutomationIdx !== -1) {
      const uxAuto = row[uxAutomationIdx];
      if (uxAuto === true || uxAuto === 'TRUE' || uxAuto === 'YES' || uxAuto === 'Yes') {
        uxAutomated++;
      }
    }
    
    if (biAutomationIdx !== -1) {
      const biAuto = row[biAutomationIdx];
      if (biAuto === true || biAuto === 'TRUE' || biAuto === 'YES' || biAuto === 'Yes') {
        biAutomated++;
      }
    }
  });
  
  return {
    totalSolutions: totalSolutions,
    ux: {
      metricDefined: uxMetricDefined,
      metricDefinedPercent: Math.round((uxMetricDefined / totalSolutions) * 100),
      currentMonthFilled: uxCurrentMonthFilled,
      currentMonthFilledPercent: Math.round((uxCurrentMonthFilled / totalSolutions) * 100),
      reachedTarget: uxReachedTarget,
      reachedTargetPercent: uxMetricDefined > 0 ? Math.round((uxReachedTarget / uxMetricDefined) * 100) : 0,
      automated: uxAutomated,
      automatedPercent: Math.round((uxAutomated / totalSolutions) * 100)
    },
    bi: {
      metricDefined: biMetricDefined,
      metricDefinedPercent: Math.round((biMetricDefined / totalSolutions) * 100),
      currentMonthFilled: biCurrentMonthFilled,
      currentMonthFilledPercent: Math.round((biCurrentMonthFilled / totalSolutions) * 100),
      reachedTarget: biReachedTarget,
      reachedTargetPercent: biMetricDefined > 0 ? Math.round((biReachedTarget / biMetricDefined) * 100) : 0,
      automated: biAutomated,
      automatedPercent: Math.round((biAutomated / totalSolutions) * 100)
    }
  };
}

/**
 * Calculate Portfolio Distribution by Journey Stage, Target User, Regulatory, Platform
 */
function calculatePortfolioDistribution(rows, headers) {
  const getColIdx = (name) => headers.indexOf(name);
  
  const nameIdx = getColIdx('Solution name');
  const journeyMainIdx = getColIdx('Main Journey Stage Impacted');
  const journeyCollateralIdx = getColIdx('Collateral Journey Stage Impacted');
  const targetUserIdx = getColIdx('Target User');
  const regulatoryIdx = getColIdx('Is a regulatory demand?');
  const platformIdx = getColIdx('User Interface Platform');
  
  const byJourney = {};
  const byTargetUser = {};
  const byPlatform = {};
  let regulatoryCount = 0;
  let nonRegulatoryCount = 0;
  
  rows.forEach(row => {
    const solutionName = row[nameIdx];
    if (!solutionName || solutionName.trim() === '') return;
    
    // Journey Stage (count both main and collateral)
    const journeyMain = row[journeyMainIdx];
    const journeyCollateral = row[journeyCollateralIdx];
    
    if (journeyMain && journeyMain !== '' && journeyMain !== 'N/A') {
      byJourney[journeyMain] = (byJourney[journeyMain] || 0) + 1;
    }
    if (journeyCollateral && journeyCollateral !== '' && journeyCollateral !== 'N/A' && journeyCollateral !== journeyMain) {
      byJourney[journeyCollateral] = (byJourney[journeyCollateral] || 0) + 1;
    }
    
    // Target User
    const targetUser = row[targetUserIdx] || 'Unspecified';
    byTargetUser[targetUser] = (byTargetUser[targetUser] || 0) + 1;
    
    // Platform
    const platform = row[platformIdx] || 'Unspecified';
    byPlatform[platform] = (byPlatform[platform] || 0) + 1;
    
    // Regulatory
    const regulatory = (row[regulatoryIdx] || '').toString().toLowerCase();
    if (regulatory.includes('yes')) {
      regulatoryCount++;
    } else {
      nonRegulatoryCount++;
    }
  });
  
  // Convert to arrays and sort
  const journeyDistribution = Object.entries(byJourney)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  const targetUserDistribution = Object.entries(byTargetUser)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  const platformDistribution = Object.entries(byPlatform)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  const totalSolutions = regulatoryCount + nonRegulatoryCount;
  
  return {
    byJourney: journeyDistribution,
    byTargetUser: targetUserDistribution,
    byPlatform: platformDistribution,
    regulatory: {
      yes: regulatoryCount,
      no: nonRegulatoryCount,
      yesPercent: Math.round((regulatoryCount / totalSolutions) * 100),
      noPercent: Math.round((nonRegulatoryCount / totalSolutions) * 100)
    }
  };
}

/**
 * Calculate PTech Involvement by P&C Area
 */
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
    
    if (!areaStats[area]) {
      areaStats[area] = {
        total: 0,
        withPTech: 0,
        withoutPTech: 0
      };
    }
    
    areaStats[area].total++;
    if (hasPTech) {
      areaStats[area].withPTech++;
    } else {
      areaStats[area].withoutPTech++;
    }
  });
  
  // Convert to array with percentages
  const ptechByArea = Object.entries(areaStats).map(([area, stats]) => ({
    area: area,
    total: stats.total,
    withPTech: stats.withPTech,
    withoutPTech: stats.withoutPTech,
    percentWithPTech: Math.round((stats.withPTech / stats.total) * 100)
  }));
  
  // Sort by total count
  ptechByArea.sort((a, b) => b.total - a.total);
  
  return ptechByArea;
}

/**
 * Calculate BAU Dedication Details
 * Returns solutions with highest BAU hours and HC allocation
 */
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
    
    if (hours > 0) {
      solutions.push({
        name: solutionName,
        hoursPerYear: Math.round(hours),
        fullyDedicatedHC: parseFloat(hc.toFixed(2))
      });
    }
  });
  
  // Sort by hours
  solutions.sort((a, b) => b.hoursPerYear - a.hoursPerYear);
  
  return {
    topSolutions: solutions.slice(0, 20),
    totalHours: solutions.reduce((sum, s) => sum + s.hoursPerYear, 0),
    totalHC: solutions.reduce((sum, s) => sum + s.fullyDedicatedHC, 0)
  };
}

