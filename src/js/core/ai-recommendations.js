/**
 * AI Recommendations Module
 * Generates context-aware metric recommendations using LiteLLM API
 * 
 * @module ai-recommendations
 */

(function() {
    'use strict';
    
    /**
     * Build enhanced prompt with product context and metric data
     * @param {Object} product - Product data object
     * @param {string} metricType - 'UX' or 'BI'
     * @param {Array} monthlyData - Actual monthly values
     * @param {Array} targetData - Target monthly values
     * @returns {string} - Formatted prompt for AI
     */
    function buildEnhancedPrompt(product, metricType, monthlyData, targetData) {
        const metricName = metricType === 'UX' ? product.keyMetricUX : product.keyMetricBI;
        const metricTypeLabel = metricType === 'UX' ? 'User Experience' : 'Business Impact';
        
        // Format monthly data for better readability
        const formatArray = (arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return '[]';
            return '[' + arr.map(v => v || 'N/A').join(', ') + ']';
        };
        
        const prompt = `You are a seasoned product leader with 15+ years of experience in complex B2B and enterprise products. Your expertise spans user research, design craft, product analytics, and delivering high-impact solutions. You excel at synthesizing product context with performance data to provide clear, actionable recommendations that drive meaningful outcomes.

Product Context:
- Product Name: "${product.name || 'Unknown Product'}"
- Problem it Solves: "${product.problem || 'Not specified'}"
- Solution: "${product.solution || 'Not specified'}"
- Maturity Stage: "${product.maturity || 'Unknown'}"
- Target User: "${product.targetUser || 'Not specified'}"

Metric Analysis:
- Metric Type: "${metricTypeLabel}" (${metricType})
- Metric Name: "${metricName || 'Unknown Metric'}"
- Time Period: 12 months (Jan-Dec)
- Actual Values: ${formatArray(monthlyData)}
- Target Values: ${formatArray(targetData)}

Task:
Drawing on your deep product expertise, analyze the performance trend in context of the product's maturity stage, target user needs, and the problem being solved. Provide a sharp, actionable recommendation that a Product Owner can immediately act upon.

Requirements:
- Maximum 330 characters (strict limit)
- 2 concise sentences maximum
- Focus on ONE key insight + ONE specific action
- Consider user research and design implications
- Professional, direct tone
- Plain text only

Output the recommendation text only.`;

        return prompt;
    }
    
    /**
     * Call LiteLLM API
     * @param {string} prompt - The prompt to send
     * @returns {Promise<string>} - AI-generated recommendation
     */
    async function callLiteLLMAPI(prompt) {
        if (!CONFIG.LITELLM_API_KEY) {
            throw new Error('LiteLLM API key not configured');
        }
        
        if (!CONFIG.AI_RECOMMENDATIONS_ENABLED) {
            throw new Error('AI recommendations are disabled');
        }
        
        console.log('[AI] Calling LiteLLM API...', {
            endpoint: CONFIG.LITELLM_API_ENDPOINT,
            model: CONFIG.AI_MODEL,
            promptLength: prompt.length
        });
        
        const requestBody = {
            model: CONFIG.AI_MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 150, // ~330 characters
            temperature: 0.7 // Balanced creativity
        };
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.AI_REQUEST_TIMEOUT);
            
            const response = await fetch(CONFIG.LITELLM_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.LITELLM_API_KEY}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[AI] API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`LiteLLM API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('[AI] API Response:', data);
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response structure from LiteLLM');
            }
            
            const recommendation = data.choices[0].message.content.trim();
            
            // Validate length
            if (recommendation.length > CONFIG.AI_MAX_CHARS) {
                console.warn('[AI] Recommendation too long, truncating:', recommendation.length);
                return recommendation.substring(0, CONFIG.AI_MAX_CHARS) + '...';
            }
            
            console.log('[AI] ✅ Recommendation generated:', {
                length: recommendation.length,
                text: recommendation
            });
            
            return recommendation;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('[AI] Request timeout after', CONFIG.AI_REQUEST_TIMEOUT, 'ms');
                throw new Error('AI request timeout');
            }
            console.error('[AI] API call failed:', error);
            throw error;
        }
    }
    
    /**
     * Get cached recommendation
     * @param {number} productId - Product ID
     * @param {string} metricType - 'UX' or 'BI'
     * @returns {string|null} - Cached recommendation or null
     */
    function getCachedRecommendation(productId, metricType) {
        try {
            const cacheKey = `ai-rec-${productId}-${metricType}`;
            const cached = sessionStorage.getItem(cacheKey);
            
            if (cached) {
                const data = JSON.parse(cached);
                console.log('[AI] 💾 Using cached recommendation:', cacheKey);
                return data.recommendation;
            }
        } catch (error) {
            console.warn('[AI] Cache read failed:', error);
        }
        return null;
    }
    
    /**
     * Cache recommendation
     * @param {number} productId - Product ID
     * @param {string} metricType - 'UX' or 'BI'
     * @param {string} recommendation - Recommendation text
     */
    function cacheRecommendation(productId, metricType, recommendation) {
        try {
            const cacheKey = `ai-rec-${productId}-${metricType}`;
            const data = {
                recommendation,
                timestamp: Date.now()
            };
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            console.log('[AI] 💾 Cached recommendation:', cacheKey);
        } catch (error) {
            console.warn('[AI] Cache write failed:', error);
        }
    }
    
    /**
     * Generate AI-powered recommendation
     * Main entry point for getting recommendations
     * @param {Object} product - Product data object
     * @param {string} metricType - 'UX' or 'BI'
     * @returns {Promise<string>} - Recommendation text
     */
    async function generateAIRecommendation(product, metricType) {
        console.log('[AI] Generating recommendation for:', {
            product: product.name,
            metricType,
            maturityStage: product.maturity
        });
        
        // Check cache first
        const cached = getCachedRecommendation(product.id, metricType);
        if (cached) {
            return cached;
        }
        
        // Get metric data
        const monthlyData = metricType === 'UX' ? product.monthlyUX : product.monthlyBI;
        const targetData = metricType === 'UX' ? product.targetUX : product.targetBI;
        
        // Build prompt
        const prompt = buildEnhancedPrompt(product, metricType, monthlyData, targetData);
        
        // Call API
        const recommendation = await callLiteLLMAPI(prompt);
        
        // Cache result
        cacheRecommendation(product.id, metricType, recommendation);
        
        return recommendation;
    }
    
    /**
     * Clear all cached recommendations
     * Useful for testing or when data changes
     */
    function clearCache() {
        try {
            const keys = Object.keys(sessionStorage);
            const aiKeys = keys.filter(key => key.startsWith('ai-rec-'));
            aiKeys.forEach(key => sessionStorage.removeItem(key));
            console.log('[AI] 🗑️ Cleared', aiKeys.length, 'cached recommendations');
        } catch (error) {
            console.warn('[AI] Cache clear failed:', error);
        }
    }
    
    // Export public API
    window.AIRecommendations = {
        generate: generateAIRecommendation,
        clearCache: clearCache,
        buildPrompt: buildEnhancedPrompt // For testing/debugging
    };
    
    console.log('✅ AI Recommendations module loaded (LiteLLM)');
    
})();

