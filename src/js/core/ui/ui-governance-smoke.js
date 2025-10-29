/**
 * UI Governance Smoke Detector Module
 * Handles smoke detector scorecards, modals, and AI summary cards
 * 
 * Part of the modular UI architecture (Phase 1: Wrapper)
 * @version 8.0.0
 */

(function() {
    'use strict';
    
    // ==================== SMOKE DETECTOR FUNCTIONS ====================
    // Note: Phase 1 delegates to original ui-governance.js
    // Phase 2 will extract these functions fully
    
    /**
     * Create AI Summary Card
     * @param {Object} data - Governance data
     * @returns {HTMLElement} AI summary card element
     */
    function createAISummaryCard(data) {
        const card = document.createElement('div');
        card.className = 'governance-ai-summary';
        card.innerHTML = `
            <h3>
                <span>🤖</span>
                <span>AI-Driven Insights</span>
            </h3>
            <div id="ai-summary-content" class="governance-ai-summary-text">
                <div class="governance-ai-loading">
                    <div class="spinner" style="width: 20px; height: 20px;"></div>
                    <span>Generating insights...</span>
                </div>
            </div>
        `;
        
        // Trigger AI generation asynchronously
        setTimeout(() => generateAISummary(data), 100);
        
        return card;
    }
    
    /**
     * Generate AI Summary using LiteLLM
     * TODO: Extract from ui-governance.js in Phase 2
     */
    async function generateAISummary(data) {
        // Delegate to original implementation temporarily
        if (window.UIManager && window.UIManager.Governance) {
            // Implementation will be in monolithic file for now
            console.log('AI Summary generation delegated to monolithic module');
        }
    }
    
    /**
     * Create Smoke Detector Scorecard
     * @param {Object} smokeDetectorData - Smoke detector data
     * @returns {HTMLElement} Scorecard element
     */
    function createSmokeDetectorScorecard(smokeDetectorData) {
        const card = document.createElement('div');
        card.className = 'governance-scorecard';
        card.onclick = () => showSmokeDetectorModal(smokeDetectorData);
        
        const count = smokeDetectorData?.count || 0;
        const statusClass = count > 10 ? 'danger' : count > 5 ? 'warning' : '';
        
        card.innerHTML = `
            <div class="scorecard-icon">🚨</div>
            <div class="scorecard-value ${statusClass}">${count}</div>
            <div class="scorecard-label">Smoke Detectors Triggered</div>
        `;
        
        return card;
    }
    
    /**
     * Show Smoke Detector Modal with drill-down
     * @param {Object} smokeDetectorData - Smoke detector data
     */
    function showSmokeDetectorModal(smokeDetectorData) {
        const modal = document.createElement('div');
        modal.className = 'smoke-detector-modal';
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
        
        const triggeredList = smokeDetectorData?.triggered || [];
        
        const escapeHtml = (text) => {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        modal.innerHTML = `
            <div class="smoke-detector-modal-content">
                <div class="smoke-detector-modal-header">
                    <h2>🚨 Smoke Detector Details</h2>
                    <button class="smoke-detector-modal-close" onclick="closeModal()">✕</button>
                </div>
                <p style="color: #6b7280; margin-bottom: 1.5rem;">
                    ${triggeredList.length} solution${triggeredList.length !== 1 ? 's' : ''} triggered warning signals
                </p>
                <div class="smoke-detector-list">
                    ${triggeredList.map(item => `
                        <div class="smoke-detector-item">
                            <div class="smoke-detector-item-name">${escapeHtml(item.name)}</div>
                            <div class="smoke-detector-item-triggers">
                                ${item.triggers.map(trigger => `
                                    <span class="smoke-detector-trigger-badge">${escapeHtml(trigger)}</span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Make closeModal global for onclick handlers
        window.closeModal = () => {
            modal.remove();
            delete window.closeModal;
        };
    }
    
    // ==================== EXPORTS ====================
    
    window.UIGovernance = window.UIGovernance || {};
    window.UIGovernance.Smoke = {
        createAISummaryCard,
        createSmokeDetectorScorecard,
        showSmokeDetectorModal
    };
    
    console.log('✅ UI Governance Smoke module loaded');
})();

