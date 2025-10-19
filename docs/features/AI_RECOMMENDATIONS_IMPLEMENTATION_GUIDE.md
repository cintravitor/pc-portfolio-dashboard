# AI-Powered Recommendations Implementation Guide

## 📋 Overview

**Goal:** Replace rule-based metric recommendations with AI-powered insights using Google's Gemini API.

**What Changes:**
- Current: Generic recommendations like "Data is being tracked. Consider setting target values..."
- Future: Context-aware AI recommendations like "Pilot-stage authentication for IT Admins at 40 NPS vs 60 target—expected as login friction isn't resolved yet. Gather feedback from your 50-user pilot, identify top 3 pain points, and iterate before scaling."

**Where It Appears:**
In the detail panel, below each metric chart:
- Key Metrics - User Experience → [Chart] → 🤖 AI Recommendation
- Key Metrics - Business Impact → [Chart] → 🤖 AI Recommendation

---

## 🎯 Key Features

### AI Context Enrichment:
The AI receives rich product context:
- **Product Name**
- **Problem it Solves**
- **Solution Description**
- **Maturity Stage** (Concept/Pilot/Growth/Production/Sunsetting)
- **Target User**
- **Metric Data** (12 months actual vs target)

### Output Constraints:
- **Maximum 330 characters** (concise, tweet-length)
- **2 sentences max** (ONE insight + ONE action)
- **Stage-appropriate advice** (different for Pilot vs Production)
- **Actionable** (specific next steps, not generic)

---

## 🔑 Prerequisites

### Step 1: Get Your Gemini API Key (2 minutes)

1. **Go to Google AI Studio:**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **Sign in with your personal Gmail account**
   - Use personal email, NOT company email
   - This avoids company permission constraints

3. **Click "Create API Key"**
   - Select "Create API key in new project"
   - Or choose an existing Google Cloud project

4. **Copy your API key**
   - Looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Keep it safe, don't share publicly

5. **Verify it's free:**
   - Free tier: 15 requests/min, 1M tokens/day
   - Your usage: ~200-300 calls/day = **FREE**
   - No credit card required

### What You'll Need:
- ✅ Gemini API key
- ✅ Text editor (VS Code, Cursor, etc.)
- ✅ Local development server (already have this)
- ✅ 60-90 minutes of implementation time

---

## 📁 Files We'll Create/Modify

### NEW FILES:
1. **`src/js/core/ai-recommendations.js`** (~200 lines)
   - Main AI module
   - Handles Gemini API calls
   - Builds enhanced prompts
   - Manages caching

### MODIFIED FILES:
1. **`src/js/config.js`**
   - Add Gemini API key
   - Add feature flag

2. **`src/js/core/ui/ui-detail-panel.js`**
   - Import AI module
   - Replace rule-based logic with AI calls
   - Add loading/error states

3. **`src/css/dashboard-style.css`**
   - Add 🤖 AI badge styling
   - Style loading animation
   - Ensure 330-char text fits

4. **`index.html`**
   - Include new AI script
   - Version bump

---

## 🚀 Implementation Steps

### Phase 1: Configuration Setup (5 minutes)

#### Step 1.1: Update `config.js`

Add to your existing config:

```javascript
const CONFIG = {
    // Existing Web App URL
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbx.../exec',
    
    // NEW: Gemini AI Configuration
    GEMINI_API_KEY: 'YOUR_API_KEY_HERE', // Replace with your actual key
    GEMINI_API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    AI_RECOMMENDATIONS_ENABLED: true, // Feature flag for easy disable
    AI_MAX_CHARS: 330,
    AI_REQUEST_TIMEOUT: 5000 // 5 seconds
};
```

**Action:** Replace `YOUR_API_KEY_HERE` with your actual Gemini API key.

---

### Phase 2: Create AI Module (30 minutes)

#### Step 2.1: Create `src/js/core/ai-recommendations.js`

This is the main AI module. Key functions:

```javascript
/**
 * AI Recommendations Module
 * Generates context-aware metric recommendations using Gemini API
 */

(function() {
    'use strict';

    // Enhanced prompt template (330 char limit)
    function buildEnhancedPrompt(product, metricType, monthlyData, targetData) {
        // Builds prompt with product context + metric data
        // Returns: "You are a product performance advisor..."
    }

    // Call Gemini API
    async function callGeminiAPI(prompt) {
        // Sends request to Gemini
        // Returns: AI-generated recommendation
    }

    // Main function
    async function generateAIRecommendation(product, metricType) {
        // 1. Check cache first
        // 2. Build prompt
        // 3. Call Gemini
        // 4. Cache result
        // 5. Return recommendation
    }

    // Export
    window.AIRecommendations = {
        generate: generateAIRecommendation
    };
})();
```

**Full code will be provided in implementation.**

---

### Phase 3: Update Detail Panel (20 minutes)

#### Step 3.1: Modify `ui-detail-panel.js`

Replace `generatePerformanceRecommendation()` with AI-powered version:

**Before:**
```javascript
function generatePerformanceRecommendation(monthlyData, targetData, metricName, metricType) {
    // Rule-based logic
    if (!hasTargetData) {
        return "Data is being tracked...";
    }
    // ...
}
```

**After:**
```javascript
async function generatePerformanceRecommendation(product, monthlyData, targetData, metricName, metricType) {
    // Check if AI is enabled
    if (CONFIG.AI_RECOMMENDATIONS_ENABLED && window.AIRecommendations) {
        try {
            // Try AI first
            const aiRec = await window.AIRecommendations.generate(product, metricType);
            return formatAIRecommendation(aiRec);
        } catch (error) {
            console.warn('AI failed, falling back to rule-based:', error);
            // Fallback to rule-based
        }
    }
    
    // Rule-based fallback (existing logic)
    // ...
}
```

---

### Phase 4: Add Styling (10 minutes)

#### Step 4.1: Update `dashboard-style.css`

Add AI-specific styles:

```css
/* AI Recommendation Badge */
.ai-recommendation-badge {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

/* Loading state */
.ai-recommendation-loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-style: italic;
}

.ai-recommendation-loading::before {
    content: "🤖";
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

---

### Phase 5: Update HTML (5 minutes)

#### Step 5.1: Modify `index.html`

Add AI script before dashboard-script.js:

```html
<!-- Core Modules -->
<script src="src/js/core/data-manager.js"></script>

<!-- NEW: AI Module -->
<script src="src/js/core/ai-recommendations.js?v=7.0.0"></script>

<!-- UI Modules -->
<script src="src/js/core/ui/ui-charts.js?v=6.3.3"></script>
```

Update version on detail panel:
```html
<script src="src/js/core/ui/ui-detail-panel.js?v=7.0.0"></script>
```

---

## 🧪 Testing Strategy

### Cycle 1: Console Testing (10 minutes)

**Open browser console and test:**

```javascript
// Test 1: Check if AI module loaded
console.log('AI Module:', window.AIRecommendations);

// Test 2: Get a product
const product = window.DataManager.getAllProducts()[0];

// Test 3: Generate recommendation
window.AIRecommendations.generate(product, 'UX')
    .then(rec => console.log('AI Recommendation:', rec));
```

**Expected output:**
```
AI Recommendation: "Pilot-stage authentication for IT Admins at 40 NPS..."
```

---

### Cycle 2: UI Testing (10 minutes)

1. **Open dashboard** → Click product card
2. **Expand Metrics section**
3. **Check for:**
   - ✅ 🤖 badge appears
   - ✅ Loading state shows briefly
   - ✅ AI recommendation appears (≤330 chars)
   - ✅ Recommendation is contextual
   - ✅ Different for UX vs BI metrics

---

### Cycle 3: Error Testing (5 minutes)

**Test fallback behavior:**

1. **Test with invalid API key:**
   - Temporarily set wrong key in config
   - Should fall back to rule-based
   - Should show warning in console

2. **Test with network offline:**
   - Disconnect internet
   - Should fall back gracefully
   - No errors in UI

---

## 📊 Enhanced Prompt Template

This is what the AI receives:

```
You are a product performance advisor helping Product Owners make data-driven decisions.

Product Context:
- Product Name: "Customer Portal Login"
- Problem it Solves: "Users face authentication failures and slow login times"
- Solution: "Streamlined SSO integration with multi-factor authentication"
- Maturity Stage: "Pilot"
- Target User: "Enterprise IT Administrators"

Metric Analysis:
- Metric Type: "UX" (User Experience)
- Metric Name: "Login Success Rate (%)"
- Time Period: 12 months (Jan-Dec)
- Actual Values: [85, 82, 80, 78, 75, 73, 70, 68, 65, 63, 60, 58]
- Target Values: [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90]

Task:
Provide a brief, actionable recommendation considering maturity stage, problem, target user, and performance trends.

Requirements:
- Maximum 330 characters (strict limit)
- 2 concise sentences maximum
- Focus on ONE key insight + ONE specific action
- Professional, direct tone
- Plain text only

Output the recommendation text only.
```

---

## 🎯 Expected Results

### Example 1: Pilot-Stage Below Target
**Input:**
- Product: Customer Portal (Pilot)
- Problem: Authentication failures
- Target User: IT Admins
- Metric: 40 NPS vs 60 target

**AI Output:**
> "Pilot-stage authentication for IT Admins at 40 NPS vs 60 target—expected as login friction isn't resolved yet. Gather feedback from your 50-user pilot, identify top 3 pain points, and iterate before scaling. Focus on adoption, not hitting targets yet."

---

### Example 2: Production-Stage Exceeding
**Input:**
- Product: Expense System (Production)
- Problem: Slow approvals
- Target User: Finance Teams
- Metric: 95% vs 90% target

**AI Output:**
> "Production-stage Expense Approval System exceeds 90% target at 95%, solving slow approvals for Finance Teams. Time to scale: document what high performers do, check for compliance gaps, and mentor other teams. Replicate this success across the organization."

---

## 💰 Cost & Performance

### API Costs:
- **Free Tier:** 15 requests/min, 1M tokens/day
- **Your Usage:** ~200-300 requests/day
- **Cost:** $0 (well within free tier)

### Performance:
- **API Response Time:** 1-3 seconds
- **Caching:** Reduces repeat calls by ~80%
- **Fallback:** <100ms if AI fails

---

## 🔧 Troubleshooting

### Issue: "API key not valid"
**Solution:**
1. Check API key is correct in config.js
2. Verify key is active in Google AI Studio
3. Check for typos or extra spaces

### Issue: "CORS error"
**Solution:**
- This is normal with no-cors mode
- Data still reaches Gemini
- Check Network tab for actual response

### Issue: Recommendations too long
**Solution:**
- Gemini should enforce 330 char limit
- If not, add post-processing truncation
- Adjust prompt to emphasize "strict limit"

### Issue: Recommendations not contextual
**Solution:**
- Check product data is being passed correctly
- Verify prompt includes all context fields
- Test with different products

---

## 📚 Implementation Checklist

**Before Starting:**
- [ ] Have Gemini API key ready
- [ ] Local server running
- [ ] Code editor open
- [ ] Browser DevTools ready

**Phase 1: Setup**
- [ ] Add API key to config.js
- [ ] Add feature flag
- [ ] Save and verify no syntax errors

**Phase 2: AI Module**
- [ ] Create ai-recommendations.js
- [ ] Implement buildEnhancedPrompt()
- [ ] Implement callGeminiAPI()
- [ ] Implement caching
- [ ] Test in console

**Phase 3: Integration**
- [ ] Update ui-detail-panel.js
- [ ] Add loading states
- [ ] Add error fallback
- [ ] Import AI module

**Phase 4: Styling**
- [ ] Add AI badge styles
- [ ] Add loading animation
- [ ] Test responsive layout

**Phase 5: Testing**
- [ ] Console test API calls
- [ ] UI test with multiple products
- [ ] Error test fallback behavior
- [ ] Performance test response times

**Phase 6: Deployment**
- [ ] Create feature branch
- [ ] Commit changes
- [ ] Test in production
- [ ] Merge to main
- [ ] Create deployment log

---

## 🚀 Quick Start Commands

```bash
# 1. Navigate to project
cd "/Users/vitor.cintra/Documents/Cursor Projects & Tests/P&C Portfolio"

# 2. Create feature branch
git checkout -b feature/ai-recommendations

# 3. Start local server for testing
python3 -m http.server 8080

# 4. Open in browser
open http://localhost:8080

# 5. After implementation, commit
git add .
git commit -m "feat: Add AI-powered metric recommendations with Gemini API"
git push -u origin feature/ai-recommendations

# 6. Merge to main
git checkout main
git merge feature/ai-recommendations
git push origin main
```

---

## 📖 Additional Resources

### Gemini API Documentation:
- https://ai.google.dev/docs

### Character Counting:
- Use: `yourText.length` in console
- Verify AI responses stay ≤330

### Testing Prompts:
- Experiment in Google AI Studio first
- Copy working prompts to code

---

## ✅ Success Criteria

Your implementation is successful when:

1. ✅ **API Connectivity**
   - Gemini API responds without errors
   - Console shows successful API calls

2. ✅ **Context Awareness**
   - Recommendations mention maturity stage
   - References problem being solved
   - Considers target user type

3. ✅ **Character Limit**
   - All recommendations ≤ 330 characters
   - No truncation in UI

4. ✅ **Actionability**
   - Each recommendation has specific action
   - Stage-appropriate advice
   - Not generic/boilerplate

5. ✅ **Performance**
   - Recommendations load in <5 seconds
   - Caching reduces API calls
   - UI remains responsive

6. ✅ **Error Handling**
   - Graceful fallback to rule-based
   - No UI crashes on API failure
   - User sees recommendation either way

7. ✅ **User Experience**
   - 🤖 badge distinguishes AI recs
   - Loading state provides feedback
   - Recommendations fit in viewport

---

## 🎯 Next Steps After Implementation

1. **Monitor Quality:**
   - Review AI recommendations for 5-10 products
   - Check if context is being used effectively
   - Verify actionability

2. **Gather Feedback:**
   - Share with stakeholders
   - Ask: "Is this recommendation helpful?"
   - Iterate on prompt if needed

3. **Optimize:**
   - Review API usage logs
   - Optimize caching strategy
   - Consider backend proxy for security

4. **Scale:**
   - Once proven, keep as default
   - Remove rule-based fallback
   - Document for other teams

---

## 📞 Support

If you get stuck:

1. **Check Console:**
   - Look for error messages
   - Verify API calls in Network tab
   - Check if modules loaded

2. **Test Incrementally:**
   - Test each phase separately
   - Don't move forward if phase fails
   - Use console.log liberally

3. **Fallback Always:**
   - Rule-based logic still works
   - Can disable AI anytime
   - No breaking changes

---

**Ready to implement? Follow each phase step-by-step!** 🚀

**Estimated Time:** 90 minutes from start to production

**Difficulty:** Intermediate (requires API key, JavaScript knowledge, testing)

**Reward:** Context-aware, AI-powered recommendations that delight users! ✨

