/**
 * Analytics Testing Suite
 * Run this in browser console to verify analytics is working
 * 
 * Usage: Copy and paste this entire file into browser console (F12)
 */

(function() {
    console.log('🧪 Starting Analytics Test Suite...\n');
    
    const tests = [];
    let passed = 0;
    let failed = 0;
    
    // Helper function to run a test
    function test(name, fn) {
        try {
            const result = fn();
            if (result) {
                console.log(`✅ PASS: ${name}`);
                passed++;
                tests.push({ name, status: 'PASS' });
            } else {
                console.error(`❌ FAIL: ${name}`);
                failed++;
                tests.push({ name, status: 'FAIL' });
            }
        } catch (error) {
            console.error(`❌ ERROR: ${name}`, error);
            failed++;
            tests.push({ name, status: 'ERROR', error: error.message });
        }
    }
    
    // ===== TEST SUITE =====
    
    test('Analytics module is loaded', () => {
        return typeof window.Analytics !== 'undefined';
    });
    
    test('Analytics.init function exists', () => {
        return typeof window.Analytics.init === 'function';
    });
    
    test('Analytics.trackEvent function exists', () => {
        return typeof window.Analytics.trackEvent === 'function';
    });
    
    test('Analytics has session ID', () => {
        const sessionId = window.Analytics.getSessionId();
        return sessionId !== null && sessionId.startsWith('sess_');
    });
    
    test('Analytics is enabled by default', () => {
        return window.Analytics.isEnabled() === true;
    });
    
    test('Can track custom event', () => {
        window.Analytics.trackEvent('test_event', { test: true, timestamp: Date.now() });
        const events = window.Analytics.getEvents({ eventType: 'test_event' });
        return events.length > 0;
    });
    
    test('Events have required fields', () => {
        const events = window.Analytics.getEvents();
        if (events.length === 0) return false;
        
        const event = events[0];
        return event.timestamp && 
               event.sessionId && 
               event.eventType && 
               event.timestampMs;
    });
    
    test('Can get summary statistics', () => {
        const summary = window.Analytics.getSummary();
        return summary && 
               summary.sessionId && 
               summary.totalEvents >= 0 &&
               summary.eventsByType;
    });
    
    test('Can export JSON', () => {
        const json = window.Analytics.exportJSON();
        return json && 
               json.metadata && 
               json.events && 
               Array.isArray(json.events);
    });
    
    test('Can export CSV', () => {
        const csv = window.Analytics.exportCSV();
        return typeof csv === 'string' && csv.includes('Timestamp');
    });
    
    test('Can filter events by type', () => {
        window.Analytics.trackEvent('filter_test', { value: 123 });
        const filtered = window.Analytics.getEvents({ eventType: 'filter_test' });
        return filtered.length > 0 && filtered[0].eventType === 'filter_test';
    });
    
    test('Can disable analytics', () => {
        window.Analytics.disable();
        const isDisabled = !window.Analytics.isEnabled();
        window.Analytics.enable(); // Re-enable for other tests
        return isDisabled;
    });
    
    test('Can enable analytics', () => {
        window.Analytics.enable();
        return window.Analytics.isEnabled() === true;
    });
    
    test('Session ID persists in localStorage', () => {
        const sessionId = window.Analytics.getSessionId();
        const stored = localStorage.getItem('pnc_analytics_session_id');
        return stored && JSON.parse(stored) === sessionId;
    });
    
    test('Events are stored in localStorage', () => {
        const storedEvents = localStorage.getItem('pnc_analytics_events');
        return storedEvents !== null && JSON.parse(storedEvents).length > 0;
    });
    
    // ===== INTERACTIVE TESTS (Manual) =====
    
    console.log('\n\n📋 Interactive Tests (Manual):\n');
    console.log('Run these commands to test user interactions:\n');
    console.log('1. Analytics.trackTabSwitch("explore", "insights");');
    console.log('2. Analytics.trackDetailPanelOpen("product-123", "Test Product");');
    console.log('3. Analytics.trackChartInteraction("bar", "click");');
    console.log('4. Analytics.trackFilterApplied("area", "HRBP");');
    console.log('5. Analytics.trackSearch("test", 10);');
    console.log('\nThen verify with: Analytics.getEvents()\n\n');
    
    // ===== SUMMARY =====
    
    console.log('\n========================================');
    console.log('📊 TEST RESULTS');
    console.log('========================================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${tests.length}`);
    console.log(`🎯 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
    console.log('========================================\n');
    
    if (failed === 0) {
        console.log('🎉 All tests passed! Analytics is working correctly.\n');
        console.log('📊 Current Analytics Summary:');
        console.table(window.Analytics.getSummary());
        console.log('\n💡 TIP: Run Analytics.getEvents() to see all captured events');
    } else {
        console.error('⚠️ Some tests failed. Check the errors above.');
    }
    
    // ===== DEMO DATA =====
    
    console.log('\n\n🎨 Demo: Viewing Analytics Data\n');
    console.log('1. Summary Statistics:');
    console.log(window.Analytics.getSummary());
    
    console.log('\n2. Recent Events (last 5):');
    const allEvents = window.Analytics.getEvents();
    console.table(allEvents.slice(-5));
    
    console.log('\n3. Events by Type:');
    const summary = window.Analytics.getSummary();
    console.table(summary.eventsByType);
    
    console.log('\n\n📥 Export Options:\n');
    console.log('• Download JSON: Analytics.download("json")');
    console.log('• Download CSV:  Analytics.download("csv")');
    console.log('• View JSON:     Analytics.exportJSON()');
    console.log('• View CSV:      Analytics.exportCSV()');
    
    console.log('\n\n🔧 Utility Commands:\n');
    console.log('• Clear all data:    Analytics.clearData()');
    console.log('• Clear events only: Analytics.clearEvents()');
    console.log('• Disable tracking:  Analytics.disable()');
    console.log('• Enable tracking:   Analytics.enable()');
    
    console.log('\n\n✅ Test suite complete!\n');
    
    return {
        passed,
        failed,
        total: tests.length,
        tests,
        successRate: ((passed / tests.length) * 100).toFixed(1) + '%'
    };
    
})();

