# AI Recommendations - Console Testing Guide

## 🚀 Quick Test (Copy & Paste)

### Step 1: Start Local Server

```bash
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"
python3 -m http.server 8080
```

### Step 2: Open Dashboard

Open in browser: **http://localhost:8080**

### Step 3: Open Browser Console

Press **F12** or **Cmd+Option+I** (Mac)

Click on **Console** tab

---

## 🧪 Test Commands

### Test 1: Check if AI Module Loaded

```javascript
console.log('AI Module:', window.AIRecommendations);
console.log('Config:', CONFIG);
```

**Expected Output:**
```
AI Module: {generate: ƒ, clearCache: ƒ, buildPrompt: ƒ}
Config: {WEB_APP_URL: "...", LITELLM_API_KEY: "sk-LbL_...", ...}
✅ AI Recommendations module loaded (LiteLLM)
```

---

### Test 2: Load Portfolio Data

```javascript
// Refresh data first
await fetchSheetData();

// Get all products
const products = window.DataManager.getAllProducts();
console.log('Products loaded:', products.length);
console.log('First product:', products[0]);
```

---

### Test 3: Test AI Recommendation (Single Product)

```javascript
// Get first product
const product = window.DataManager.getAllProducts()[0];

console.log('Testing with product:', product.name);

// Generate UX recommendation
const uxRec = await window.AIRecommendations.generate(product, 'UX');
console.log('UX Recommendation:', uxRec);
console.log('Length:', uxRec.length, 'chars');

// Generate BI recommendation
const biRec = await window.AIRecommendations.generate(product, 'BI');
console.log('BI Recommendation:', biRec);
console.log('Length:', biRec.length, 'chars');
```

**Expected Output:**
```
[AI] Generating recommendation for: {product: "...", metricType: "UX", ...}
[AI] Calling LiteLLM API...
[AI] API Response: {...}
[AI] ✅ Recommendation generated: {length: 320, text: "Pilot-stage..."}
[AI] 💾 Cached recommendation: ai-rec-1-UX

UX Recommendation: "Pilot-stage authentication for IT Admins at 40 NPS vs 60 target—expected as login friction isn't resolved yet. Gather feedback from your 50-user pilot, identify top 3 pain points, and iterate before scaling."

Length: 320 chars
```

---

### Test 4: Test Multiple Products

```javascript
// Test with first 3 products
const products = window.DataManager.getAllProducts().slice(0, 3);

for (const product of products) {
    console.log('\n=== Testing:', product.name, '===');
    console.log('Maturity:', product.maturity);
    console.log('Problem:', product.problem);
    
    try {
        const uxRec = await window.AIRecommendations.generate(product, 'UX');
        console.log('UX:', uxRec);
        console.log('Length:', uxRec.length);
        
        const biRec = await window.AIRecommendations.generate(product, 'BI');
        console.log('BI:', biRec);
        console.log('Length:', biRec.length);
    } catch (error) {
        console.error('Failed:', error.message);
    }
}
```

---

### Test 5: Test Caching

```javascript
// Generate recommendation
const product = window.DataManager.getAllProducts()[0];

console.time('First call (no cache)');
const rec1 = await window.AIRecommendations.generate(product, 'UX');
console.timeEnd('First call (no cache)');

console.time('Second call (cached)');
const rec2 = await window.AIRecommendations.generate(product, 'UX');
console.timeEnd('Second call (cached)');

console.log('Same result?', rec1 === rec2);
```

**Expected:**
```
First call (no cache): 1500ms
[AI] 💾 Using cached recommendation: ai-rec-1-UX
Second call (cached): 2ms
Same result? true
```

---

### Test 6: Clear Cache

```javascript
// Clear all cached recommendations
window.AIRecommendations.clearCache();
```

**Expected:**
```
[AI] 🗑️ Cleared 6 cached recommendations
```

---

### Test 7: View Prompt (Debug)

```javascript
const product = window.DataManager.getAllProducts()[0];
const prompt = window.AIRecommendations.buildPrompt(
    product, 
    'UX', 
    product.monthlyUX, 
    product.targetUX
);
console.log('Prompt sent to AI:\n', prompt);
```

---

## ✅ Success Criteria

Your AI module is working if:

1. ✅ **Module loads:** `window.AIRecommendations` exists
2. ✅ **API calls succeed:** No 401/403 errors
3. ✅ **Recommendations generated:** Text appears in console
4. ✅ **Character limit respected:** All ≤330 characters
5. ✅ **Context included:** Mentions maturity stage, problem, or user
6. ✅ **Caching works:** Second call is instant
7. ✅ **Different per metric:** UX vs BI recommendations differ

---

## 🐛 Troubleshooting

### Issue: "LITELLM_API_KEY not configured"

**Check:**
```javascript
console.log('API Key:', CONFIG.LITELLM_API_KEY);
```

**Fix:** Verify config.js has the key

---

### Issue: "401 Unauthorized" or "403 Forbidden"

**Possible causes:**
- Invalid API key
- API key expired
- Wrong endpoint

**Check:**
```javascript
console.log('Endpoint:', CONFIG.LITELLM_API_ENDPOINT);
console.log('Model:', CONFIG.AI_MODEL);
```

**Try:**
- Verify API key is correct
- Check LiteLLM dashboard for key status
- Test endpoint manually

---

### Issue: "Network Error" or "CORS"

**Check:**
```javascript
// Look at Network tab in DevTools
// Check if request is being sent
```

**Possible fixes:**
- Check internet connection
- Verify LiteLLM endpoint is correct
- Check if behind corporate firewall

---

### Issue: Recommendations too generic

**Debug:**
```javascript
// Check what data AI receives
const product = window.DataManager.getAllProducts()[0];
console.log('Product data:', {
    name: product.name,
    problem: product.problem,
    solution: product.solution,
    maturity: product.maturity,
    targetUser: product.targetUser
});
```

**Fix:** Verify product has rich context data

---

### Issue: API timeout

**Check:**
```javascript
console.log('Timeout:', CONFIG.AI_REQUEST_TIMEOUT, 'ms');
```

**Increase if needed:**
```javascript
CONFIG.AI_REQUEST_TIMEOUT = 10000; // 10 seconds
```

---

## 📊 What to Look For

### Good Recommendation Example:
```
"Pilot-stage authentication for IT Admins at 40 NPS vs 60 target—expected 
as login friction isn't resolved yet. Gather feedback from your 50-user pilot, 
identify top 3 pain points, and iterate before scaling."

✅ Mentions maturity (Pilot-stage)
✅ References problem (login friction)
✅ Mentions target user (IT Admins)
✅ Gives specific action (gather feedback, identify 3 pain points)
✅ Stage-appropriate (iterate before scaling)
✅ 320 characters (within limit)
```

### Poor Recommendation Example:
```
"The metric is below target. Consider improving performance 
and implementing best practices to achieve better results."

❌ Generic (could apply to anything)
❌ No context used
❌ No specific action
❌ Not stage-appropriate
```

---

## 🎯 Next Steps

Once console testing works:
1. ✅ Verify API connectivity
2. ✅ Check recommendation quality
3. ✅ Test with multiple products
4. ✅ Validate character limits
5. ✅ Test caching
6. → Move to UI integration

---

## 📞 Quick Commands Reference

```javascript
// Load module check
window.AIRecommendations

// Generate recommendation
await window.AIRecommendations.generate(product, 'UX')

// Clear cache
window.AIRecommendations.clearCache()

// View prompt
window.AIRecommendations.buildPrompt(product, 'UX', monthlyData, targetData)

// Get products
window.DataManager.getAllProducts()

// Get single product by ID
window.DataManager.getProductById(1)
```

---

**Ready to test? Follow the steps above!** 🚀

