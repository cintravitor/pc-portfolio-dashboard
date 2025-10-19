/**
 * AI Batch Summarization Script for Problem Descriptions
 * 
 * This script fetches LIVE data from Google Sheets (via Apps Script) and generates
 * 146-character summaries using AI via your existing LiteLLM configuration.
 * 
 * ✨ KEY FEATURE: Uses the SAME Apps Script URL as the web app!
 *    - No more outdated CSV files
 *    - Always uses latest data from Google Sheets
 *    - Single source of truth
 *    - Consistent with web app architecture
 * 
 * Uses the same LiteLLM endpoint and API key as your existing AI recommendations feature.
 * 
 * Usage:
 *   node scripts/generate-ai-summaries.js
 * 
 * Requirements:
 *   npm install node-fetch (or Node 18+ with native fetch)
 * 
 * API Configuration:
 *   - Data Source: Apps Script Web App (same as web app)
 *   - AI Endpoint: https://ist-prod-litellm.nullmplatform.com/chat/completions
 *   - AI Model: openai/gpt-4o-mini (via LiteLLM proxy)
 * 
 * Output:
 *   data/ai-summaries.json - Contains original → summary mappings
 */

const fs = require('fs');
const path = require('path');

// Use native fetch if available (Node 18+), otherwise use node-fetch
const fetch = globalThis.fetch || require('node-fetch');

// Load existing config from your application
const configPath = path.join(__dirname, '../src/js/config.js');
const configContent = fs.readFileSync(configPath, 'utf-8');

// Extract configuration from config.js (same source as web app!)
const LITELLM_API_KEY = 'sk-Cv-XPJMj9Si0Hk8EB2KeLg'; // From your existing config
const LITELLM_API_ENDPOINT = 'https://ist-prod-litellm.nullmplatform.com/chat/completions';
const AI_MODEL = 'openai/gpt-4o-mini'; // Via LiteLLM proxy
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxIAPLG0ypxN_vAao2W81YwDKjbNwc8G37HslkG-6gFlHOdnNuXC0DFdLu7nvw0q6Zo/exec';

// Configuration
const CONFIG = {
    webAppUrl: WEB_APP_URL, // Use Apps Script instead of CSV! 🎉
    outputPath: path.join(__dirname, '../data/ai-summaries.json'),
    litellmApiKey: LITELLM_API_KEY,
    litellmEndpoint: LITELLM_API_ENDPOINT,
    aiModel: AI_MODEL,
    maxChars: 146, // Increased to 146 to capture ALL solutions without truncation
    dryRun: false // Set to true to test without API calls
};

// AI Prompt Template (Enhanced with Full Context)
const PROMPT_TEMPLATE = `ROLE: You are a Senior Product Manager with extensive expertise in HR challenges and employee experience. You excel at translating complex business and employee challenges into sharp, clear problem statements using deep product knowledge and understanding of organizational pain points.

TASK: Create a complete, scannable problem statement in 146 characters or less.

RECOMMENDED STRUCTURE (use as a guide, not a strict template):
"[The problem] affects [target group] in [context/situation], leading to [consequence/impact]"

Feel free to adapt this structure as needed to create the clearest, most natural statement within 146 characters.

CONTEXT FROM DATASET:
- Solution Name: {SOLUTION_NAME}
- Target User: {TARGET_USER}
- Main Journey Stage: {JOURNEY_STAGE}
- Is Regulatory?: {IS_REGULATORY}
- Problem Description: {PROBLEM_TEXT}

CRITICAL RULES:
1. Use ALL context above to inform your summary (especially Target User and Journey Stage)
2. Maximum 146 characters - COMPLETE sentences only, NO "..." truncation
3. The last character MUST be a period (.) or letter, NEVER "..."
4. The ENTIRE summary must be visible without CSS truncation - complete thoughts only
5. Use objective, professional language
6. Be specific about WHO is affected (from Target User field when relevant)
7. Be specific about IMPACT/CONSEQUENCE (from Problem Description)
8. Make it scannable (2-second understanding)
9. Prioritize clarity over strict adherence to structure

EXAMPLES:

Input:
- Solution: "M5+ Talent Brokering"
- Target User: "Senior Leaders (M5+)"
- Journey Stage: "Career Development"
- Problem: "No structured talent brokering process for senior leaders results in suboptimal alignment of skills and roles."
Output: "Lack of structured talent brokering for senior leaders causes skill-role misalignment, leading to underutilized talent and reduced productivity."
(140 chars)

Input:
- Solution: "People Plan"
- Target User: "HRBPs"
- Journey Stage: "Strategic Planning"
- Problem: "Absence of structured People Plan leads to inconsistencies in aligning HR strategies with business objectives."
Output: "HRBPs lack unified People Plans in strategic planning, causing misalignment of HR strategies with business goals and missed talent opportunities."
(146 chars - using full limit)

YOUR SUMMARY (146 chars max, COMPLETE sentence ending with period):`;

/**
 * Call LiteLLM API to generate summary with full context (using your existing configuration)
 */
async function generateSummary(context) {
    const { problemText, solutionName, targetUser, journeyStage, isRegulatory } = context;
    
    if (CONFIG.dryRun) {
        console.log(`[DRY RUN] Would summarize: ${solutionName}`);
        return problemText.substring(0, 120); // Mock summary
    }
    
    try {
        // Check for API key
        if (!CONFIG.litellmApiKey) {
            throw new Error('LiteLLM API key not configured');
        }
        
        // Replace placeholders with full context
        const prompt = PROMPT_TEMPLATE
            .replace('{SOLUTION_NAME}', solutionName || 'N/A')
            .replace('{TARGET_USER}', targetUser || 'N/A')
            .replace('{JOURNEY_STAGE}', journeyStage || 'N/A')
            .replace('{IS_REGULATORY}', isRegulatory || 'No')
            .replace('{PROBLEM_TEXT}', problemText);
        
        const requestBody = {
            model: CONFIG.aiModel,
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 0.3, // Lower temperature for more consistent summaries
            max_tokens: 150
        };
        
        const response = await fetch(CONFIG.litellmEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.litellmApiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`LiteLLM API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response structure from LiteLLM');
        }
        
        let summary = data.choices[0].message.content.trim();
        
        // Remove quotes if AI wrapped the response
        if (summary.startsWith('"') && summary.endsWith('"')) {
            summary = summary.slice(1, -1);
        }
        
        // CRITICAL VALIDATION: Reject truncated summaries
        if (summary.endsWith('...')) {
            console.warn(`⚠️  Summary truncated with "..." - REJECTING: ${solutionName}`);
            throw new Error('Summary truncated with "..." - this violates the prompt rules');
        }
        
        // Validate length (strict: must be <= 146 chars for complete visibility)
        if (summary.length > CONFIG.maxChars) {
            console.warn(`⚠️  Summary too long (${summary.length} chars) - REJECTING: ${solutionName}`);
            throw new Error(`Summary exceeds ${CONFIG.maxChars} characters - text must be fully visible without truncation`);
        }
        
        // Validate it's a complete sentence
        if (summary.length < 20) {
            console.warn(`⚠️  Summary too short (${summary.length} chars) - might be incomplete: ${solutionName}`);
        }
        
        return summary;
        
    } catch (error) {
        console.error(`❌ Error generating summary for ${solutionName}:`, error.message);
        return null; // Will fall back to original
    }
}

/**
 * Fetch data from Apps Script (same source as web app!)
 */
async function fetchPortfolioData() {
    console.log('📡 Fetching latest data from Google Sheets (via Apps Script)...');
    console.log(`URL: ${CONFIG.webAppUrl}\n`);
    
    const response = await fetch(CONFIG.webAppUrl);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const jsonData = await response.json();
    
    if (!jsonData.success || !jsonData.data) {
        throw new Error('Invalid response from Apps Script');
    }
    
    // Convert raw data array to records with headers
    const rawData = jsonData.data;
    if (rawData.length < 3) {
        throw new Error('Not enough data in spreadsheet');
    }
    
    // Skip metadata row (row 0), use row 1 as headers, data starts at row 2
    const headers = rawData[1];
    const records = rawData.slice(2).map(row => {
        const record = {};
        headers.forEach((header, index) => {
            record[header] = row[index];
        });
        return record;
    });
    
    console.log(`✅ Fetched ${records.length} solutions (last updated: ${jsonData.lastUpdated})\n`);
    console.log(`📊 Data is LIVE from Google Sheets (no stale CSV!))\n`);
    
    return records;
}

/**
 * Process data and generate summaries
 */
async function processBatch() {
    console.log('🤖 AI Batch Summarization Starting...\n');
    console.log(`Model: ${CONFIG.aiModel}`);
    console.log(`Max chars: ${CONFIG.maxChars}`);
    console.log(`Dry run: ${CONFIG.dryRun}\n`);
    
    // Fetch data from Apps Script (same as web app!)
    const records = await fetchPortfolioData();
    
    // Process each solution
    const summaries = {};
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
        const solutionName = record['Solution name'];
        const problemText = record['Which Problem it Solves'];
        const targetUser = record['Target User'];
        const journeyStage = record['Main Journey Stage Impacted'];
        const isRegulatory = record['Is a regulatory demand?'];
        
        if (!solutionName || !problemText) {
            console.log(`⏭️  Skipping: Missing name or problem text`);
            continue;
        }
        
        processedCount++;
        console.log(`[${processedCount}/${records.length}] Processing: ${solutionName.substring(0, 50)}...`);
        console.log(`   Target User: ${targetUser || 'N/A'}`);
        console.log(`   Journey Stage: ${journeyStage || 'N/A'}`);
        
        // Pass full context to AI
        const context = {
            solutionName,
            problemText,
            targetUser,
            journeyStage,
            isRegulatory
        };
        
        const summary = await generateSummary(context);
        
        if (summary) {
            summaries[solutionName] = {
                original: problemText,
                summary: summary,
                length: summary.length,
                timestamp: new Date().toISOString(),
                context: {
                    targetUser: targetUser || 'N/A',
                    journeyStage: journeyStage || 'N/A',
                    isRegulatory: isRegulatory || 'No'
                }
            };
            successCount++;
            console.log(`✅ Summary (${summary.length} chars): ${summary}\n`);
        } else {
            errorCount++;
            console.log(`❌ Failed to generate summary (will use line-clamped original as fallback)\n`);
        }
        
        // Rate limiting: wait 100ms between requests
        if (!CONFIG.dryRun) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Save to JSON
    console.log('\n💾 Saving summaries to JSON...');
    fs.writeFileSync(
        CONFIG.outputPath,
        JSON.stringify(summaries, null, 2),
        'utf-8'
    );
    
    // Summary statistics
    console.log('\n✅ BATCH PROCESSING COMPLETE!');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Total solutions: ${records.length}`);
    console.log(`Processed: ${processedCount}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Output: ${CONFIG.outputPath}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // Calculate cost estimate
    if (!CONFIG.dryRun) {
        const avgInputChars = 500; // Approximate
        const totalInputTokens = (successCount * avgInputChars) / 4; // ~4 chars per token
        const totalOutputTokens = (successCount * CONFIG.maxChars) / 4;
        const estimatedCost = (totalInputTokens * 0.00000015) + (totalOutputTokens * 0.0000006); // GPT-4o-mini pricing
        console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)}\n`);
    }
    
    console.log('📋 NEXT STEPS:');
    console.log('1. Review the generated summaries in: data/ai-summaries.json');
    console.log('2. Edit any summaries that need adjustment');
    console.log('3. Run the integration script to update the application');
    console.log('4. Test the new summaries in the browser\n');
}

// Run if executed directly
if (require.main === module) {
    processBatch().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { generateSummary, processBatch };

