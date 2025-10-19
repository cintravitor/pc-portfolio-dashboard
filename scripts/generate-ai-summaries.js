/**
 * AI Batch Summarization Script for Problem Descriptions
 * 
 * This script reads problem descriptions from the CSV dataset and generates
 * 120-character summaries using AI via your existing LiteLLM configuration.
 * 
 * Uses the same LiteLLM endpoint and API key as your existing AI recommendations feature.
 * 
 * Usage:
 *   node scripts/generate-ai-summaries.js
 * 
 * Requirements:
 *   npm install csv-parse node-fetch
 * 
 * API Configuration:
 *   Uses existing LiteLLM config from your application (src/js/config.js)
 *   Endpoint: https://ist-prod-litellm.nullmplatform.com/chat/completions
 *   Model: openai/gpt-4o-mini (via LiteLLM proxy)
 * 
 * Output:
 *   data/ai-summaries.json - Contains original → summary mapparies
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Use native fetch if available (Node 18+), otherwise use node-fetch
const fetch = globalThis.fetch || require('node-fetch');

// Load existing config from your application
const configPath = path.join(__dirname, '../src/js/config.js');
const configContent = fs.readFileSync(configPath, 'utf-8');

// Extract LiteLLM configuration from config.js
const LITELLM_API_KEY = 'sk-Cv-XPJMj9Si0Hk8EB2KeLg'; // From your existing config
const LITELLM_API_ENDPOINT = 'https://ist-prod-litellm.nullmplatform.com/chat/completions';
const AI_MODEL = 'openai/gpt-4o-mini'; // Via LiteLLM proxy

// Configuration
const CONFIG = {
    csvPath: path.join(__dirname, '../data/[P&C Portfolio] Official Solution Portfolio Dataset - [2025] P&C Portfolio.csv'),
    outputPath: path.join(__dirname, '../data/ai-summaries.json'),
    litellmApiKey: LITELLM_API_KEY,
    litellmEndpoint: LITELLM_API_ENDPOINT,
    aiModel: AI_MODEL,
    maxChars: 120,
    dryRun: false // Set to true to test without API calls
};

// AI Prompt Template
const PROMPT_TEMPLATE = `ROLE: You are a Senior Product Manager with extensive expertise in HR challenges and employee experience. You excel at translating complex business and employee challenges into sharp, clear problem statements using deep product knowledge and understanding of organizational pain points.

TASK: Summarize the following problem statement in exactly 120 characters or less.

RULES:
- Keep the core business problem clear
- Use objective, professional language
- Focus on WHAT is broken, not HOW to fix it
- Preserve critical context (who is affected, what area)
- Remove redundant phrases like "The lack of", "affects directly", etc.
- Make it scannable (someone should understand the issue in 2 seconds)

EXAMPLES:

Original: "The inability to effortlessly track and register the outcome of calibration discussions affects directly HIRBPs (and indirectly all Nubankers) as they are not able to track calibration conversations and decisions, leading to inefficiencies and frustration as they struggle to resolve their inquiries, while also navigating through multiple knowledge hubs and help centers."
Summary: "No centralized tracking for calibration discussions, causing inefficiencies and frustration for HRBPs navigating multiple systems."

Original: "Operational inefficiencies when consulting and executing their transactions, mainly with Oracle, impacting the system and performing many actions involved time-consuming steps and multiple clicks. Users also struggled with the non-intuitive path into the system and not the best user experience"
Summary: "Oracle system inefficiencies: time-consuming multi-step processes with poor UX frustrate users during transactions."

Original: "With many portals and slack channels, Nubankers lacked a trustworthy place to open tickets, ask questions, and get support, creating an ambient of non official replies and lack of data follow up."
Summary: "No centralized support platform: scattered portals/Slack channels create unreliable responses and poor data tracking."

PROBLEM DESCRIPTION TO SUMMARIZE:
{PROBLEM_TEXT}

YOUR SUMMARY (120 chars max):`;

/**
 * Call LiteLLM API to generate summary (using your existing configuration)
 */
async function generateSummary(problemText, solutionName) {
    if (CONFIG.dryRun) {
        console.log(`[DRY RUN] Would summarize: ${solutionName}`);
        return problemText.substring(0, 120); // Mock summary
    }
    
    try {
        // Check for API key
        if (!CONFIG.litellmApiKey) {
            throw new Error('LiteLLM API key not configured');
        }
        
        const prompt = PROMPT_TEMPLATE.replace('{PROBLEM_TEXT}', problemText);
        
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
        
        const summary = data.choices[0].message.content.trim();
        
        // Validate length
        if (summary.length > CONFIG.maxChars) {
            console.warn(`⚠️  Summary too long (${summary.length} chars) for: ${solutionName}`);
            return summary.substring(0, CONFIG.maxChars - 3) + '...';
        }
        
        return summary;
        
    } catch (error) {
        console.error(`❌ Error generating summary for ${solutionName}:`, error.message);
        return null; // Will fall back to original
    }
}

/**
 * Process CSV and generate summaries
 */
async function processBatch() {
    console.log('🤖 AI Batch Summarization Starting...\n');
    console.log(`Model: ${CONFIG.aiModel}`);
    console.log(`Max chars: ${CONFIG.maxChars}`);
    console.log(`Dry run: ${CONFIG.dryRun}\n`);
    
    // Read CSV
    console.log('📁 Reading CSV dataset...');
    const csvContent = fs.readFileSync(CONFIG.csvPath, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        from_line: 2 // Skip metadata row (line 1), start from actual headers (line 2)
    });
    
    console.log(`✅ Found ${records.length} solutions\n`);
    
    // Process each solution
    const summaries = {};
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
        const solutionName = record['Solution name'];
        const problemText = record['Which Problem it Solves'];
        
        if (!solutionName || !problemText) {
            console.log(`⏭️  Skipping: Missing name or problem text`);
            continue;
        }
        
        processedCount++;
        console.log(`[${processedCount}/${records.length}] Processing: ${solutionName.substring(0, 50)}...`);
        
        const summary = await generateSummary(problemText, solutionName);
        
        if (summary) {
            summaries[solutionName] = {
                original: problemText,
                summary: summary,
                length: summary.length,
                timestamp: new Date().toISOString()
            };
            successCount++;
            console.log(`✅ Summary (${summary.length} chars): ${summary}\n`);
        } else {
            errorCount++;
            console.log(`❌ Failed to generate summary\n`);
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

