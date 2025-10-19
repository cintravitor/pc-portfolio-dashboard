# AI Summarization Prompt for Problem Descriptions

## Context
You are summarizing problem statements for a People & Culture (P&C) portfolio dashboard. Each solution addresses a specific operational challenge for HRBPs, Talent Acquisition, People Analytics, and other P&C functions at Nubank.

## Task
Generate a concise, scannable summary of each problem description that:
1. **Stays within 120 characters maximum** (hard limit)
2. **Preserves the core business problem** (what's broken or inefficient)
3. **Uses professional, objective language** (no marketing fluff)
4. **Focuses on the pain point**, not the solution
5. **Maintains business context** (HRBP, TA, managers, employees, etc.)

## Prompt Template

```
ROLE: You are a Senior Product Manager with extensive expertise in HR challenges and employee experience. You excel at translating complex business and employee challenges into sharp, clear problem statements using deep product knowledge and understanding of organizational pain points.

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
(119 chars)

Original: "Operational inefficiencies when consulting and executing their transactions, mainly with Oracle, impacting the system and performing many actions involved time-consuming steps and multiple clicks. Users also struggled with the non-intuitive path into the system and not the best user experience"

Summary: "Oracle system inefficiencies: time-consuming multi-step processes with poor UX frustrate users during transactions."
(118 chars)

Original: "With many portals and slack channels, Nubankers lacked a trustworthy place to open tickets, ask questions, and get support, creating an ambient of non official replies and lack of data follow up."

Summary: "No centralized support platform: scattered portals/Slack channels create unreliable responses and poor data tracking."
(119 chars)

Original: "Operational inefficiencies in sending documentation by email and inserting hiring data manual, generating inconsistencies and delays in the onboarding process."

Summary: "Manual documentation and data entry in onboarding causes inefficiencies, inconsistencies, and delays."
(102 chars)

PROBLEM DESCRIPTION TO SUMMARIZE:
{PROBLEM_TEXT}

YOUR SUMMARY (120 chars max):
```

## Quality Criteria for Review

After AI generates summaries, verify each one meets:
- ✅ **Length:** ≤ 120 characters
- ✅ **Clarity:** Problem is immediately understandable
- ✅ **Accuracy:** Core issue preserved from original
- ✅ **Context:** Key stakeholders/systems mentioned if critical
- ✅ **Professional:** No casual language or fluff
- ✅ **Scannable:** Can be understood in 2-3 seconds

## Batch Processing Approach

1. **Input:** Read problem descriptions from CSV
2. **Process:** Send each to AI with prompt above
3. **Output:** Generate JSON file with mappings:
   ```json
   {
     "AskNu": {
       "original": "The inability to effortlessly track...",
       "summary": "No centralized tracking for calibration...",
       "length": 119
     }
   }
   ```
4. **Review:** You manually review JSON file
5. **Integrate:** Update code to use summaries
6. **Fallback:** Keep original if summary missing

## Cost Estimate (for your approval)

Assuming ~50 solutions × 200 chars avg = 10,000 chars
- **OpenAI GPT-4o-mini:** ~$0.01 (cheap, good quality)
- **Claude Haiku:** ~$0.02 (very cheap, excellent)
- **Gemini Flash:** ~$0.005 (cheapest, good)

**Recommendation:** Use GPT-4o-mini or Claude Haiku for best quality/cost balance.

---

## ⚠️ IMPORTANT: Review Before Execution

**Please review the prompt above and confirm:**
1. Is the prompt aligned with your business context?
2. Are the example summaries at the right level of detail?
3. Should I add/remove any instructions?
4. Which AI model do you prefer? (GPT-4o-mini recommended)

Once you approve, I'll implement the batch script and generate summaries for your review.

