/**
 * COMPREHENSIVE TEST SUITE - Enhanced UI Features
 * 
 * Run this in the browser console after loading the application
 * 
 * Usage:
 *   1. Open P&C Portfolio Dashboard
 *   2. Open Browser Console (F12)
 *   3. Copy and paste this entire file
 *   4. Press Enter to run all tests
 * 
 * @author QA Engineer
 * @date October 8, 2025
 */

(function() {
    'use strict';
    
    // Test results storage
    const testResults = {
        passed: 0,
        failed: 0,
        skipped: 0,
        tests: []
    };
    
    // Test utilities
    const TestUtils = {
        log(message, type = 'info') {
            const styles = {
                info: 'color: #3b82f6; font-weight: bold;',
                success: 'color: #10b981; font-weight: bold;',
                error: 'color: #ef4444; font-weight: bold;',
                warning: 'color: #f59e0b; font-weight: bold;'
            };
            console.log(`%c${message}`, styles[type]);
        },
        
        assert(condition, message) {
            if (condition) {
                this.log(`✓ ${message}`, 'success');
                return true;
            } else {
                this.log(`✗ ${message}`, 'error');
                throw new Error(`Assertion failed: ${message}`);
            }
        },
        
        assertEquals(actual, expected, message) {
            return this.assert(
                actual === expected,
                `${message} (expected: ${expected}, got: ${actual})`
            );
        },
        
        assertGreaterThan(actual, expected, message) {
            return this.assert(
                actual > expected,
                `${message} (expected > ${expected}, got: ${actual})`
            );
        },
        
        assertContains(array, item, message) {
            return this.assert(
                array.includes(item),
                `${message} (expected array to contain ${item})`
            );
        },
        
        wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    };
    
    // Test runner
    async function runTest(testName, testFn) {
        TestUtils.log(`\n🧪 Running: ${testName}`, 'info');
        try {
            await testFn();
            testResults.passed++;
            testResults.tests.push({ name: testName, status: 'PASSED' });
            TestUtils.log(`✅ PASSED: ${testName}\n`, 'success');
        } catch (error) {
            testResults.failed++;
            testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
            TestUtils.log(`❌ FAILED: ${testName}`, 'error');
            console.error(error);
        }
    }
    
    // ================= TEST CASES =================
    
    /**
     * TC-001: Initial State (All Collapsed)
     */
    async function testInitialStateCollapsed() {
        // Ensure data is loaded
        const portfolioData = window.State.getPortfolioData();
        TestUtils.assertGreaterThan(portfolioData.length, 0, 'Portfolio data loaded');
        
        // Collapse all and render
        window.UIManager.Cards.collapseAllAreas();
        window.UIManager.Cards.render();
        await TestUtils.wait(100);
        
        // Check all sections are collapsed
        const collapsedSections = document.querySelectorAll('.area-cards.collapsed');
        const expandedSections = document.querySelectorAll('.area-cards.expanded');
        
        TestUtils.assertGreaterThan(collapsedSections.length, 0, 'At least one collapsed section exists');
        TestUtils.assertEquals(expandedSections.length, 0, 'No expanded sections');
        
        // Check toggle icons show "+"
        const toggleIcons = document.querySelectorAll('.area-toggle-icon');
        const allPlus = Array.from(toggleIcons).every(icon => icon.textContent === '+');
        TestUtils.assert(allPlus, 'All toggle icons show "+"');
        
        // Check area counts are visible
        const areaCounts = document.querySelectorAll('.area-count');
        TestUtils.assertGreaterThan(areaCounts.length, 0, 'Area counts visible');
    }
    
    /**
     * TC-002: Toggle Single Section
     */
    async function testToggleSingleSection() {
        // Start from collapsed state
        window.UIManager.Cards.collapseAllAreas();
        window.UIManager.Cards.render();
        await TestUtils.wait(100);
        
        // Get first area section
        const firstSection = document.querySelector('.area-section');
        TestUtils.assert(firstSection, 'First area section exists');
        
        const area = firstSection.dataset.area;
        const areaCards = firstSection.querySelector('.area-cards');
        const toggleIcon = firstSection.querySelector('.area-toggle-icon');
        
        // Check initial state
        TestUtils.assert(areaCards.classList.contains('collapsed'), 'Initially collapsed');
        TestUtils.assertEquals(toggleIcon.textContent, '+', 'Toggle icon is "+"');
        
        // Toggle to expand
        window.UIManager.Cards.toggleArea(area);
        await TestUtils.wait(500); // Wait for animation
        
        // Check expanded state
        TestUtils.assert(areaCards.classList.contains('expanded'), 'Now expanded');
        TestUtils.assertEquals(toggleIcon.textContent, '−', 'Toggle icon is "−"');
        
        // Toggle to collapse
        window.UIManager.Cards.toggleArea(area);
        await TestUtils.wait(500);
        
        // Check collapsed again
        TestUtils.assert(areaCards.classList.contains('collapsed'), 'Collapsed again');
        TestUtils.assertEquals(toggleIcon.textContent, '+', 'Toggle icon is "+" again');
    }
    
    /**
     * TC-003: Toggle Multiple Sections
     */
    async function testToggleMultipleSections() {
        // Start from collapsed state
        window.UIManager.Cards.collapseAllAreas();
        window.UIManager.Cards.render();
        await TestUtils.wait(100);
        
        // Get all area sections
        const sections = document.querySelectorAll('.area-section');
        TestUtils.assertGreaterThan(sections.length, 1, 'Multiple sections exist');
        
        // Get first 3 areas
        const areas = Array.from(sections).slice(0, 3).map(s => s.dataset.area);
        
        // Expand all three
        areas.forEach(area => window.UIManager.Cards.toggleArea(area));
        await TestUtils.wait(500);
        
        // Check all three are expanded
        const expandedSections = document.querySelectorAll('.area-cards.expanded');
        TestUtils.assertGreaterThan(expandedSections.length, 2, 'Multiple sections expanded');
        
        // Verify specific sections are expanded
        areas.forEach(area => {
            const section = document.querySelector(`[data-area="${area}"]`);
            const cards = section.querySelector('.area-cards');
            TestUtils.assert(
                cards.classList.contains('expanded'),
                `Section "${area}" is expanded`
            );
        });
    }
    
    /**
     * TC-006: Platform Display
     */
    async function testPlatformDisplay() {
        // Expand first area
        const firstSection = document.querySelector('.area-section');
        const area = firstSection.dataset.area;
        window.UIManager.Cards.expandAreas([area]);
        await TestUtils.wait(100);
        
        // Find platform badges
        const platformBadges = document.querySelectorAll('.platform-badge, .platform-empty');
        TestUtils.assertGreaterThan(platformBadges.length, 0, 'Platform info displayed');
        
        // Check for proper display
        platformBadges.forEach(badge => {
            const text = badge.textContent;
            TestUtils.assert(
                text.length > 0,
                'Platform badge has text content'
            );
        });
    }
    
    /**
     * TC-007: Automation Status Display
     */
    async function testAutomationStatus() {
        // Expand first area
        const firstSection = document.querySelector('.area-section');
        const area = firstSection.dataset.area;
        window.UIManager.Cards.expandAreas([area]);
        await TestUtils.wait(100);
        
        // Find automation badges
        const automationBadges = document.querySelectorAll('.automation-badge');
        TestUtils.assertGreaterThan(automationBadges.length, 0, 'Automation badges displayed');
        
        // Check for valid classes
        automationBadges.forEach(badge => {
            const hasValidClass = 
                badge.classList.contains('automation-automated') ||
                badge.classList.contains('automation-partial') ||
                badge.classList.contains('automation-manual');
            
            TestUtils.assert(hasValidClass, 'Badge has valid automation class');
        });
    }
    
    /**
     * TC-011: Filter with Single Match
     */
    async function testFilterSingleMatch() {
        // Clear all filters first
        window.UIManager.Filters.clearFilters();
        await TestUtils.wait(100);
        
        // Get all areas
        const allAreas = Array.from(document.querySelectorAll('.area-section'))
            .map(s => s.dataset.area);
        
        // Apply area filter (select first area)
        const targetArea = allAreas[0];
        document.getElementById('filter-area').value = targetArea;
        window.UIManager.Filters.applyFiltersFromUI();
        await TestUtils.wait(500);
        
        // Check that only target area is expanded
        const expandedSections = Array.from(document.querySelectorAll('.area-cards.expanded'))
            .map(el => el.closest('.area-section').dataset.area);
        
        TestUtils.assertEquals(expandedSections.length, 1, 'Only one section expanded');
        TestUtils.assertEquals(expandedSections[0], targetArea, 'Correct section expanded');
    }
    
    /**
     * TC-012: Filter with Multiple Matches
     */
    async function testFilterMultipleMatches() {
        // Clear filters
        window.UIManager.Filters.clearFilters();
        await TestUtils.wait(100);
        
        // Apply a broad search filter (e.g., "a" should match many)
        document.getElementById('search-input').value = 'a';
        window.UIManager.Filters.applyFiltersFromUI();
        await TestUtils.wait(500);
        
        // Check that multiple sections can be expanded
        const expandedSections = document.querySelectorAll('.area-cards.expanded');
        // Can't assert exact number, but should be > 0
        TestUtils.assertGreaterThan(expandedSections.length, 0, 'At least one section expanded');
    }
    
    /**
     * TC-013: Filter with Zero Matches
     */
    async function testFilterZeroMatches() {
        // Clear filters
        window.UIManager.Filters.clearFilters();
        await TestUtils.wait(100);
        
        // Apply filter with no matches
        document.getElementById('search-input').value = 'XYZNONEXISTENT123';
        window.UIManager.Filters.applyFiltersFromUI();
        await TestUtils.wait(500);
        
        // Check empty state is shown
        const emptyState = document.getElementById('empty-state');
        const cardsContainer = document.getElementById('cards-container');
        
        TestUtils.assert(
            !emptyState.classList.contains('hidden'),
            'Empty state is visible'
        );
        TestUtils.assert(
            cardsContainer.classList.contains('hidden'),
            'Cards container is hidden'
        );
    }
    
    /**
     * TC-014: Clear Filters
     */
    async function testClearFilters() {
        // Apply some filters
        document.getElementById('search-input').value = 'test';
        document.getElementById('filter-area').value = '';
        window.UIManager.Filters.applyFiltersFromUI();
        await TestUtils.wait(500);
        
        // Clear filters
        window.UIManager.Filters.clearFilters();
        await TestUtils.wait(500);
        
        // Check all inputs are cleared
        TestUtils.assertEquals(
            document.getElementById('search-input').value,
            '',
            'Search input cleared'
        );
        TestUtils.assertEquals(
            document.getElementById('filter-area').value,
            '',
            'Area filter cleared'
        );
        
        // Check all sections are collapsed
        const expandedSections = document.querySelectorAll('.area-cards.expanded');
        TestUtils.assertEquals(expandedSections.length, 0, 'All sections collapsed');
    }
    
    /**
     * TC-016: Empty Dataset
     */
    async function testEmptyDataset() {
        // Save current data
        const originalData = window.State.getPortfolioData();
        
        // Set empty data
        window.State.setPortfolioData([]);
        window.State.setFilteredData([]);
        window.UIManager.Cards.render();
        await TestUtils.wait(100);
        
        // Check empty state
        const emptyState = document.getElementById('empty-state');
        TestUtils.assert(
            !emptyState.classList.contains('hidden'),
            'Empty state shown for empty dataset'
        );
        
        // Check no sections rendered
        const sections = document.querySelectorAll('.area-section');
        TestUtils.assertEquals(sections.length, 0, 'No sections rendered');
        
        // Restore data
        window.State.setPortfolioData(originalData);
        window.State.setFilteredData(originalData);
        window.UIManager.Cards.render();
    }
    
    /**
     * TC-019: Special Characters in Area Name
     */
    async function testSpecialCharactersInAreaName() {
        // Check if any area has special characters
        const sections = document.querySelectorAll('.area-section');
        
        sections.forEach(section => {
            const areaTitle = section.querySelector('.area-title');
            const areaData = section.dataset.area;
            
            // Should not contain unescaped HTML
            TestUtils.assert(
                !areaTitle.innerHTML.includes('<script>'),
                'No script tags in area name'
            );
            TestUtils.assert(
                !areaTitle.innerHTML.includes('javascript:'),
                'No javascript: protocol in area name'
            );
        });
    }
    
    /**
     * TC-020: Performance Test (Large Dataset)
     */
    async function testPerformance() {
        const data = window.State.getFilteredData();
        
        // Test render performance
        console.time('Render Performance');
        window.UIManager.Cards.render();
        console.timeEnd('Render Performance');
        
        // Test toggle performance
        const firstSection = document.querySelector('.area-section');
        if (firstSection) {
            const area = firstSection.dataset.area;
            
            console.time('Toggle Performance');
            window.UIManager.Cards.toggleArea(area);
            console.timeEnd('Toggle Performance');
        }
        
        // Test filter performance
        console.time('Filter Performance');
        document.getElementById('search-input').value = 'a';
        window.UIManager.Filters.applyFiltersFromUI();
        console.timeEnd('Filter Performance');
        
        // Clear filter
        window.UIManager.Filters.clearFilters();
        
        TestUtils.log('Performance metrics logged to console', 'success');
    }
    
    /**
     * TC-021: Card Detail Panel Integration
     */
    async function testCardDetailPanelIntegration() {
        // Expand first area
        const firstSection = document.querySelector('.area-section');
        const area = firstSection.dataset.area;
        window.UIManager.Cards.expandAreas([area]);
        await TestUtils.wait(100);
        
        // Find first card
        const firstCard = document.querySelector('.product-card');
        TestUtils.assert(firstCard, 'Product card exists');
        
        // Check card has product ID
        const productId = firstCard.dataset.productId;
        TestUtils.assert(productId !== undefined, 'Card has product ID');
        
        // Verify clicking card doesn't break anything
        // (We can't fully test detail panel without triggering actual click)
        TestUtils.log('Card has product ID and is clickable', 'success');
    }
    
    /**
     * TC-022: State Persistence During Re-render
     */
    async function testStatePersistence() {
        // Expand two areas
        const sections = Array.from(document.querySelectorAll('.area-section')).slice(0, 2);
        const areas = sections.map(s => s.dataset.area);
        
        areas.forEach(area => window.UIManager.Cards.toggleArea(area));
        await TestUtils.wait(100);
        
        // Force re-render (should maintain expansion state)
        window.UIManager.Cards.render();
        await TestUtils.wait(100);
        
        // Check both areas are still expanded
        areas.forEach(area => {
            const section = document.querySelector(`[data-area="${area}"]`);
            const cards = section.querySelector('.area-cards');
            TestUtils.assert(
                cards.classList.contains('expanded'),
                `Area "${area}" remained expanded after re-render`
            );
        });
    }
    
    // ================= RUN ALL TESTS =================
    
    async function runAllTests() {
        TestUtils.log('═══════════════════════════════════════', 'info');
        TestUtils.log('  ENHANCED UI FEATURES - TEST SUITE', 'info');
        TestUtils.log('═══════════════════════════════════════', 'info');
        TestUtils.log('Starting test execution...\n', 'info');
        
        const startTime = Date.now();
        
        // Run all tests
        await runTest('TC-001: Initial State (All Collapsed)', testInitialStateCollapsed);
        await runTest('TC-002: Toggle Single Section', testToggleSingleSection);
        await runTest('TC-003: Toggle Multiple Sections', testToggleMultipleSections);
        await runTest('TC-006: Platform Display', testPlatformDisplay);
        await runTest('TC-007: Automation Status Display', testAutomationStatus);
        await runTest('TC-011: Filter with Single Match', testFilterSingleMatch);
        await runTest('TC-012: Filter with Multiple Matches', testFilterMultipleMatches);
        await runTest('TC-013: Filter with Zero Matches', testFilterZeroMatches);
        await runTest('TC-014: Clear Filters', testClearFilters);
        await runTest('TC-016: Empty Dataset', testEmptyDataset);
        await runTest('TC-019: Special Characters in Area Name', testSpecialCharactersInAreaName);
        await runTest('TC-020: Performance Test', testPerformance);
        await runTest('TC-021: Card Detail Panel Integration', testCardDetailPanelIntegration);
        await runTest('TC-022: State Persistence During Re-render', testStatePersistence);
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        // Print summary
        TestUtils.log('\n═══════════════════════════════════════', 'info');
        TestUtils.log('  TEST EXECUTION COMPLETE', 'info');
        TestUtils.log('═══════════════════════════════════════', 'info');
        TestUtils.log(`Total Tests: ${testResults.passed + testResults.failed}`, 'info');
        TestUtils.log(`✓ Passed: ${testResults.passed}`, 'success');
        TestUtils.log(`✗ Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
        TestUtils.log(`Duration: ${duration}s`, 'info');
        
        if (testResults.failed === 0) {
            TestUtils.log('\n🎉 ALL TESTS PASSED! 🎉', 'success');
        } else {
            TestUtils.log('\n⚠️  SOME TESTS FAILED  ⚠️', 'error');
            TestUtils.log('Failed tests:', 'error');
            testResults.tests
                .filter(t => t.status === 'FAILED')
                .forEach(t => TestUtils.log(`  - ${t.name}: ${t.error}`, 'error'));
        }
        
        return testResults;
    }
    
    // Export for external use
    window.TestSuite = {
        runAll: runAllTests,
        testResults: testResults
    };
    
    // Auto-run if this script is executed directly
    TestUtils.log('Test suite loaded. Run window.TestSuite.runAll() to execute all tests.', 'info');
    TestUtils.log('Auto-running tests in 2 seconds...', 'warning');
    
    setTimeout(() => {
        runAllTests().then(results => {
            console.log('Test results:', results);
        });
    }, 2000);
    
})();

