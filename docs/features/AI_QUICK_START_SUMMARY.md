# AI Recommendations - Quick Start Summary

## 🎯 What We're Building

**Replace this:**
> "Data is being tracked. Consider setting target values to measure performance against goals."

**With AI-powered recommendations like:**
> "Pilot-stage authentication for IT Admins at 40 NPS vs 60 target—expected as login friction isn't resolved yet. Gather feedback from your 50-user pilot, identify top 3 pain points, and iterate before scaling."

---

## ⚡ Quick Setup (5 steps)

### 1. Get API Key (2 min)
```
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with personal Gmail (NOT company email)
3. Click "Create API Key" → "Create in new project"
4. Copy the key (AIzaSy...)
5. Keep it safe
```

### 2. Update Config (1 min)
**File:** `src/js/config.js`

Add after existing WEB_APP_URL:
```javascript
GEMINI_API_KEY: 'YOUR_KEY_HERE',
GEMINI_API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
AI_RECOMMENDATIONS_ENABLED: true,
AI_MAX_CHARS: 330
```

### 3. Create AI Module (Ready to copy)
**File:** `src/js/core/ai-recommendations.js` (NEW file)

Full code will be provided when implementing.

### 4. Update Detail Panel (Modify existing)
**File:** `src/js/core/ui/ui-detail-panel.js`

Replace `generatePerformanceRecommendation()` with AI-powered version.

### 5. Test & Deploy
```bash
# Test locally
python3 -m http.server 8080
open http://localhost:8080

# Deploy
git checkout -b feature/ai-recommendations
git add .
git commit -m "feat: Add AI-powered recommendations"
git push -u origin feature/ai-recommendations
git checkout main
git merge feature/ai-recommendations
git push origin main
```

---

## 📋 Files to Touch

| File | Action | Lines |
|------|--------|-------|
| `config.js` | Add 4 new config values | +4 |
| `ai-recommendations.js` | **CREATE NEW** | +200 |
| `ui-detail-panel.js` | Modify recommendation function | ~50 |
| `dashboard-style.css` | Add AI badge styles | +30 |
| `index.html` | Include AI script | +1 |

---

## 🧪 Testing Checklist

**Console Test:**
```javascript
// Should work
window.AIRecommendations.generate(product, 'UX')
```

**UI Test:**
- [ ] Open product detail panel
- [ ] Expand Metrics section
- [ ] See 🤖 badge
- [ ] See AI recommendation (≤330 chars)
- [ ] Different for UX vs BI
- [ ] Mentions product stage/problem

**Error Test:**
- [ ] Invalid API key → Falls back to rule-based
- [ ] Network offline → Falls back gracefully
- [ ] No console errors

---

## 💡 AI Prompt (What it receives)

```
Product Context:
- Name: "Customer Portal"
- Problem: "Authentication failures"
- Solution: "SSO integration"
- Stage: "Pilot"
- User: "IT Admins"

Metric Data:
- Type: UX
- Name: "Login Success Rate"
- Actual: [85, 82, 80...]
- Target: [90, 90, 90...]

Task: Give 330-char recommendation
```

---

## ⏱️ Time Estimate

| Phase | Time | What |
|-------|------|------|
| Setup | 5 min | Get API key, update config |
| AI Module | 30 min | Create new file, implement functions |
| Integration | 20 min | Update detail panel |
| Styling | 10 min | Add CSS |
| Testing | 15 min | Console + UI + Errors |
| Deploy | 10 min | Git commit, merge, push |
| **Total** | **90 min** | **Start to production** |

---

## 💰 Cost

**Free Tier:**
- 15 requests/min
- 1M tokens/day

**Your Usage:**
- ~200-300 requests/day
- **Cost: $0** (FREE!)

---

## 🎯 Success = 

✅ Click product → Expand Metrics → See 🤖 AI recommendation  
✅ Recommendation mentions maturity stage  
✅ Recommendation is ≤330 characters  
✅ Recommendation is actionable  
✅ Falls back gracefully on errors  

---

## 🚀 When You're Ready

1. Read: `AI_RECOMMENDATIONS_IMPLEMENTATION_GUIDE.md` (full details)
2. Get API key
3. Follow the guide step-by-step
4. Test in console first
5. Test in UI
6. Deploy to production

**Total time: 90 minutes from zero to hero!** ✨

---

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "API key not valid" | Check for typos in config.js |
| "CORS error" | Normal, check Network tab for response |
| Recs too long | AI should enforce 330, add truncation if needed |
| Not contextual | Verify product data passed correctly |
| No fallback | Check if rule-based logic still exists |

---

**All set! Save this for when you're ready to implement.** 🎉

