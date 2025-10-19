# AI Summarization Prompt for Problem Descriptions

## Context
You are summarizing problem statements for a People & Culture (P&C) portfolio dashboard. Each solution addresses a specific operational challenge for HRBPs, Talent Acquisition, People Analytics, and other P&C functions at Nubank.

## Task
Generate a concise, scannable summary that:
1. **Stays within 140 characters maximum** (hard limit - must end naturally, NO truncation)
2. **Uses this structure as a guide** (not strict): "[The problem] affects [target group] in [context/situation], leading to [consequence/impact]"
3. **Uses ALL available context** from dataset (Solution Name, Target User, Journey Stage, Regulatory Demand, Problem Description)
4. **Uses professional, objective language** (no marketing fluff)
5. **Focuses on the pain point**, not the solution
6. **Completes the sentence naturally** (absolutely NO "...", NO cut-offs, NO mid-word truncation)
7. **Prioritizes clarity** over strict adherence to structure

## Enhanced Prompt Template

```
ROLE: You are a Senior Product Manager with extensive expertise in HR challenges and employee experience. You excel at translating complex business and employee challenges into sharp, clear problem statements using deep product knowledge and understanding of organizational pain points.

TASK: Create a complete, scannable problem statement in 140 characters or less.

RECOMMENDED STRUCTURE (use as a guide, not a strict template):
"[The problem] affects [target group] in [context/situation], leading to [consequence/impact]"

Feel free to adapt this structure as needed to create the clearest, most natural statement within 140 characters.

CONTEXT FROM DATASET:
- Solution Name: {SOLUTION_NAME}
- Target User: {TARGET_USER}
- Main Journey Stage: {JOURNEY_STAGE}
- Is Regulatory?: {IS_REGULATORY}
- Problem Description: {PROBLEM_TEXT}

CRITICAL RULES:
1. Use ALL context above to inform your summary (especially Target User and Journey Stage)
2. Maximum 140 characters - COMPLETE sentences only, NO "..." truncation
3. The last character MUST be a period (.) or letter, NEVER "..."
4. Use objective, professional language
5. Be specific about WHO is affected (from Target User field when relevant)
6. Be specific about IMPACT/CONSEQUENCE (from Problem Description)
7. Make it scannable (2-second understanding)
8. Prioritize clarity over strict adherence to structure

EXAMPLES:

Input:
- Solution: "M5+ Talent Brokering"
- Target User: "Senior Leaders (M5+)"
- Journey Stage: "Career Development"
- Problem: "No structured talent brokering process for senior leaders results in suboptimal alignment of skills and roles."

Output: "Lack of structured talent brokering for senior leaders causes skill-role misalignment, leading to underutilized talent and reduced productivity."
(140 chars - COMPLETE SENTENCE, no truncation)

Input:
- Solution: "People Plan"
- Target User: "HRBPs"
- Journey Stage: "Strategic Planning"
- Problem: "Absence of structured People Plan leads to inconsistencies in aligning HR strategies with business objectives."

Output: "HRBPs lack unified People Plans in strategic planning, causing misalignment of HR strategies with business goals and missed talent opportunities."
(140 chars - COMPLETE SENTENCE, no truncation)

YOUR SUMMARY (140 chars max, COMPLETE sentence ending with period):
```

## Quality Criteria for Review

After AI generates summaries, verify each one meets:
- ✅ **Length:** ≤ 140 characters
- ✅ **Structure:** Generally follows "[problem] affects [who] in [context], leading to [impact]" (flexible)
- ✅ **Complete:** NO "..." truncation, ends with period or letter
- ✅ **Context-Rich:** Uses Target User and Journey Stage when relevant
- ✅ **Clarity:** Problem is immediately understandable
- ✅ **Accuracy:** Core issue preserved from original
- ✅ **Professional:** No casual language or fluff
- ✅ **Scannable:** Can be understood in 2-3 seconds

## Batch Processing Approach

1. **Input:** Read ALL fields from CSV (Name, Target User, Journey Stage, Regulatory, Problem)
2. **Process:** Send complete context to AI with enhanced prompt above
3. **Output:** Generate JSON file with mappings:
   ```json
   {
     "AskNu": {
       "original": "The inability to effortlessly track...",
       "summary": "HRBPs lack centralized calibration tracking in performance management, causing inefficiencies.",
       "length": 98,
       "context": {
         "target_user": "HRBPs",
         "journey_stage": "Performance Management"
       }
     }
   }
   ```
4. **Review:** Manually review JSON file for truncations
5. **Integrate:** Update code to use summaries
6. **Fallback:** Keep original if summary missing

## Cost Estimate

Assuming ~90 solutions × 300 chars avg context = 27,000 chars
- **OpenAI GPT-4o-mini:** ~$0.003 (cheap, good quality) ✅ CURRENT
- **Claude Haiku:** ~$0.02 (very cheap, excellent)
- **Gemini Flash:** ~$0.005 (cheapest, good)

**Current:** Using GPT-4o-mini via LiteLLM

---

## ⚠️ IMPORTANT: No Truncation Policy

**The AI MUST generate COMPLETE sentences within 140 characters.**

- ❌ BAD: "No structured talent brokering for senior leaders causes skill-role misalignment, leading to underutilization and red..."
- ✅ GOOD: "Lack of structured talent brokering for senior leaders causes skill-role misalignment, leading to underutilized talent and reduced productivity."

With 140 characters, the AI has room to:
1. Include complete context (who is affected)
2. State the problem clearly
3. Describe the impact fully
4. End with a natural period (no truncation)

