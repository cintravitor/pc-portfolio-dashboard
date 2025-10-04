# Testing the Pub/Sub System

## Quick Validation Tests

Open the browser console on http://localhost:8080 and run these commands:

### Test 1: Basic Pub/Sub Functionality

```javascript
// Test publish and subscribe
window.Utils.subscribe('test:event', (data) => {
    console.log('✅ Received test event:', data);
});

window.Utils.publish('test:event', { message: 'Hello from pub/sub!' });
```

**Expected Output**:
```
📬 Subscribed to event: test:event (1 subscribers)
📡 Publishing event: test:event (1 subscribers)
✅ Received test event: { message: 'Hello from pub/sub!' }
```

---

### Test 2: Multiple Subscribers

```javascript
// Add multiple subscribers to same event
window.Utils.subscribe('filter:changed', (data) => {
    console.log('Subscriber 1 received:', data);
});

window.Utils.subscribe('filter:changed', (data) => {
    console.log('Subscriber 2 received:', data);
});

window.Utils.publish('filter:changed', { area: 'Claims', maturity: 'Growth' });
```

**Expected Output**:
```
📬 Subscribed to event: filter:changed (1 subscribers)
📬 Subscribed to event: filter:changed (2 subscribers)
📡 Publishing event: filter:changed (2 subscribers)
Subscriber 1 received: { area: 'Claims', maturity: 'Growth' }
Subscriber 2 received: { area: 'Claims', maturity: 'Growth' }
```

---

### Test 3: Unsubscribe Functionality

```javascript
// Subscribe and then unsubscribe
const unsubscribe = window.Utils.subscribe('data:loaded', (data) => {
    console.log('This should not print after unsubscribe');
});

// Publish once
window.Utils.publish('data:loaded', { count: 100 });

// Unsubscribe
unsubscribe();

// Publish again (no output expected)
window.Utils.publish('data:loaded', { count: 200 });
```

**Expected Output**:
```
📬 Subscribed to event: data:loaded (1 subscribers)
📡 Publishing event: data:loaded (1 subscribers)
This should not print after unsubscribe
📭 Unsubscribed from event: data:loaded
⚠️ No subscribers for event: data:loaded
```

---

### Test 4: Debug Utilities

```javascript
// Check what events are registered
console.log('Registered events:', window.Utils.getRegisteredEvents());

// Check subscriber count for specific event
console.log('filter:changed subscribers:', window.Utils.getSubscriberCount('filter:changed'));
```

---

### Test 5: Error Handling

```javascript
// Test publishing to event with no subscribers
window.Utils.publish('nonexistent:event', { data: 'test' });

// Test subscribing with invalid arguments
window.Utils.subscribe(); // Missing event name
window.Utils.subscribe('valid:event'); // Missing callback
window.Utils.subscribe('valid:event', 'not a function'); // Invalid callback
```

**Expected Output**:
```
⚠️ No subscribers for event: nonexistent:event
subscribe() requires an event name (string)
subscribe() requires a callback function
subscribe() requires a callback function
```

---

### Test 6: Cleanup

```javascript
// Clean up all test events
window.Utils.unsubscribeAll('test:event');
window.Utils.unsubscribeAll('filter:changed');
window.Utils.unsubscribeAll('data:loaded');

console.log('Registered events after cleanup:', window.Utils.getRegisteredEvents());
```

---

## Verify Existing Features Still Work

### Portfolio Overview Tab
1. ✅ Switch to "Portfolio Overview" tab
2. ✅ Apply filters (area, maturity, owner)
3. ✅ Verify cards update
4. ✅ Verify filter pills appear
5. ✅ Click a card to see details

### Strategic View Tab
1. ✅ Switch to "Strategic View" tab
2. ✅ Verify KPI cards display
3. ✅ Click "High Risk" card
4. ✅ Verify drill-down to Portfolio Overview
5. ✅ Verify filtered products display

### Planning View Tab
1. ✅ Switch to "Planning View" tab
2. ✅ Verify anomaly alerts display
3. ✅ Verify charts render
4. ✅ Apply filters
5. ✅ Verify charts update

### Descriptive Analysis Tab
1. ✅ Switch to "Descriptive Analysis" tab
2. ✅ Verify statistics display
3. ✅ Verify charts render

---

## Expected Console Output on Page Load

```
✅ Utils module loaded
✅ State management module loaded
✅ Data Manager module loaded
✅ UI Manager module loaded (Refactored)
Portfolio Dashboard initialized
✅ Dashboard ready

💡 TIP: Run testAnomalyDetection() in console to test anomaly detection
```

---

## Success Criteria

### Pub/Sub System
- [x] Can publish events
- [x] Can subscribe to events
- [x] Multiple subscribers work
- [x] Unsubscribe works
- [x] Error handling works
- [x] Debug utilities work

### Existing Features
- [x] All tabs work
- [x] All filters work
- [x] All drill-downs work
- [x] All charts render
- [x] No console errors

### Performance
- [x] No slowdown
- [x] No memory leaks
- [x] Load time unchanged

---

## If Any Test Fails

1. Check browser console for errors
2. Verify all files loaded correctly
3. Check network tab for failed requests
4. Review recent code changes
5. Test in different browser

---

## Manual Feature Testing Checklist

### ✅ Data Loading
- [ ] Refresh button works
- [ ] Data loads from cache
- [ ] Auto-refresh triggers
- [ ] Error handling works

### ✅ Filtering
- [ ] Search works
- [ ] Area filter works
- [ ] Maturity filter works
- [ ] Owner filter works
- [ ] Sort works
- [ ] Clear filters works
- [ ] Filter pills appear
- [ ] Pill removal works

### ✅ Navigation
- [ ] Tab switching works
- [ ] Active tab highlighted
- [ ] Content displays correctly
- [ ] Filters show/hide correctly

### ✅ Details
- [ ] Card click opens details
- [ ] Close button works
- [ ] Collapsible sections work
- [ ] Charts in details render
- [ ] Metrics display correctly

### ✅ Strategic Features
- [ ] KPI cards display
- [ ] Drill-down works
- [ ] Filter notification displays
- [ ] Reset works

---

**All tests passing = Architecture refactor successful! 🎉**

