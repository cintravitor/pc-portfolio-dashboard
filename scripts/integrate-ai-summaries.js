/**
 * Integration Script - Apply AI Summaries to Application
 * 
 * This script updates the data-manager.js to use AI-generated summaries
 * when displaying problem descriptions on cards.
 * 
 * Usage:
 *   node scripts/integrate-ai-summaries.js
 * 
 * What it does:
 *   1. Loads ai-summaries.json
 *   2. Updates getCardSummaryMetrics() to use summaries
 *   3. Adds fallback to original text if summary missing
 *   4. Creates backup of original file
 */

const fs = require('fs');
const path = require('path');

const SUMMARIES_PATH = path.join(__dirname, '../data/ai-summaries.json');
const DATA_MANAGER_PATH = path.join(__dirname, '../src/js/core/data-manager.js');

console.log('🔧 AI Summaries Integration Starting...\n');

// Step 1: Load summaries
console.log('📁 Loading AI summaries...');
if (!fs.existsSync(SUMMARIES_PATH)) {
    console.error('❌ Error: ai-summaries.json not found!');
    console.error('   Run: node scripts/generate-ai-summaries.js first\n');
    process.exit(1);
}

const summaries = JSON.parse(fs.readFileSync(SUMMARIES_PATH, 'utf-8'));
console.log(`✅ Loaded ${Object.keys(summaries).length} summaries\n`);

// Step 2: Create backup
console.log('💾 Creating backup of data-manager.js...');
const backupPath = DATA_MANAGER_PATH + '.backup-' + Date.now();
fs.copyFileSync(DATA_MANAGER_PATH, backupPath);
console.log(`✅ Backup created: ${backupPath}\n`);

// Step 3: Read data-manager.js
console.log('📖 Reading data-manager.js...');
let dataManagerCode = fs.readFileSync(DATA_MANAGER_PATH, 'utf-8');

// Step 4: Inject summaries as a constant
console.log('✏️  Injecting AI summaries into code...');

const summariesConstant = `
// ==================== AI SUMMARIES ====================
// Auto-generated AI summaries for problem descriptions
// Generated: ${new Date().toISOString()}
// To regenerate: node scripts/generate-ai-summaries.js

const AI_SUMMARIES = ${JSON.stringify(summaries, null, 4)};

/**
 * Get AI summary for a solution (with fallback to original)
 * @param {string} solutionName - Name of the solution
 * @param {string} originalProblem - Original problem text (fallback)
 * @returns {string} AI summary or original problem text
 */
function getAISummary(solutionName, originalProblem) {
    if (AI_SUMMARIES[solutionName] && AI_SUMMARIES[solutionName].summary) {
        return AI_SUMMARIES[solutionName].summary;
    }
    // Fallback: use original with line-clamp in CSS
    return originalProblem || 'No problem statement defined';
}

`;

// Find the right place to inject (after imports, before first function)
const injectPosition = dataManagerCode.indexOf('// ==================== DATA PROCESSING ====================');
if (injectPosition === -1) {
    console.error('❌ Error: Could not find injection point in data-manager.js');
    process.exit(1);
}

dataManagerCode = 
    dataManagerCode.substring(0, injectPosition) +
    summariesConstant +
    dataManagerCode.substring(injectPosition);

// Step 5: Update getCardSummaryMetrics to use AI summaries
console.log('✏️  Updating getCardSummaryMetrics function...');

const oldProblemLine = "problem: product.problem || 'No problem statement defined',";
const newProblemLine = "problem: getAISummary(product.name, product.problem),";

if (dataManagerCode.includes(oldProblemLine)) {
    dataManagerCode = dataManagerCode.replace(oldProblemLine, newProblemLine);
    console.log('✅ Updated problem field to use AI summaries\n');
} else {
    console.warn('⚠️  Could not find exact problem field line. Manual update may be needed.\n');
}

// Step 6: Write updated file
console.log('💾 Writing updated data-manager.js...');
fs.writeFileSync(DATA_MANAGER_PATH, dataManagerCode, 'utf-8');
console.log('✅ File updated successfully\n');

// Step 7: Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ INTEGRATION COMPLETE!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Changes made:');
console.log('  ✅ Added AI_SUMMARIES constant with all summaries');
console.log('  ✅ Added getAISummary() helper function');
console.log('  ✅ Updated getCardSummaryMetrics() to use summaries');
console.log('  ✅ Fallback to original text if summary missing\n');
console.log('Backup location:');
console.log(`  📁 ${backupPath}\n`);
console.log('📋 NEXT STEPS:');
console.log('  1. Test the application: http://localhost:8080');
console.log('  2. Verify summaries display correctly on cards');
console.log('  3. If issues occur, restore from backup');
console.log('  4. Commit changes to git when satisfied\n');
console.log('To restore backup:');
console.log(`  cp "${backupPath}" "${DATA_MANAGER_PATH}"\n`);

