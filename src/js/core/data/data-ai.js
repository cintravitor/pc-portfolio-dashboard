/**
 * Data AI Module
 * Handles AI-powered features and summaries
 * 
 * Part of modular data architecture refactor (Phase 3)
 */

(function() {
    'use strict';
    
    // ==================== PUBLIC API ====================
    
    /**
     * Get AI-generated summary for a solution
     * Falls back to original problem statement if no AI summary available
     * @param {string} solutionName - Name of the solution
     * @param {string} originalProblem - Original problem text (fallback)
     * @returns {string} AI summary or original problem text
     */
    function getAISummary(solutionName, originalProblem) {
        // Check if AI summaries are loaded
        if (window.AI_SUMMARIES && window.AI_SUMMARIES[solutionName]) {
            const summaryData = window.AI_SUMMARIES[solutionName];
            if (summaryData.summary) {
                return summaryData.summary;
            }
        }
        
        // Fallback to original problem (will be line-clamped by CSS)
        return originalProblem || 'No problem statement defined';
    }
    
    // ==================== EXPORTS ====================
    
    // Create namespace
    window.DataManager = window.DataManager || {};
    window.DataManager.AI = {
        getAISummary
    };
    
    console.log('✅ Data AI module loaded');
    
})();

