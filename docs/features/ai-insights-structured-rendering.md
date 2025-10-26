# AI-Driven Insights: Structured Rendering

## Overview
The AI-Driven Insights component uses structured, **compact** rendering to maximize scannability for senior leadership (PLT/CHR) while minimizing vertical space.

## Design Philosophy
**Compact & Scannable**: Tight spacing, bold typography, and minimal padding create a clean, professional appearance that conveys maximum information in minimal space.

## Layout Structure

### Two-Row Layout Design
- **Row 1**: AI Insights card (full width, spans both columns)
- **Row 2**: Two compact scorecards side by side (Smoke Detectors, Data Health)

This layout maximizes information density while eliminating white space.

## AI Insights Format

### 1. Strategic Priority (Highest prominence)
- **Bold, uppercase heading** (0.9rem, 700 weight)
- Subtle purple accent border (3px)
- Minimal padding (0.75rem vertical)
- Single concise paragraph (1-2 sentences)
- Very subtle purple gradient background

### 2. Key Findings (Supporting data)
- Bullet list format (•)
- **Compact spacing** (0.4rem gap between items)
- 1.5 line-height for readability
- Clean, minimal styling with no extra padding
- Smaller font (0.875rem) for density
- 4 findings maximum for optimal scannability

## Severity Markers
Color-coded badges provide instant visual recognition of priority levels:

- **[HIGH RISK]** - Red badge (`--danger` / #ef4444)
- **[MEDIUM RISK]** - Orange badge (`--warning` / #f59e0b)
- **[ATTENTION NEEDED]** - Purple badge (`--mercury-accent` / #6366f1)

## Technical Implementation

### Architecture
- **AI prompt requests structured output** with markdown-style formatting
- **`parseStructuredAIOutput()`** converts text to semantic HTML
- **`parseInlineFormatting()`** transforms severity markers into color-coded badges
- **CSS applies Mercury Light Design System tokens** for consistent styling
- **Filter changes preserve formatting** through regeneration

### Files Modified
- `src/js/core/ui/ui-governance.js` - Parsing logic and AI prompt
- `src/css/dashboard-style.css` - Structured styling classes

### CSS Classes
- `.ai-insights-structured` - Main container
- `.ai-section` - Generic section wrapper
- `.ai-summary` - Strategic priority section
- `.ai-findings` - Key findings section
- `.ai-recommendations` - Recommended actions section
- `.ai-section-heading` - Section headings (bolded, larger)
- `.ai-paragraph` - Paragraph text with optimal line-height
- `.ai-list` - List container with proper spacing
- `.ai-list-item` - Individual list items
- `.ai-severity-badge` - Severity marker badges
- `.ai-severity-high` - High risk styling (red)
- `.ai-severity-medium` - Medium risk styling (orange)
- `.ai-severity-attention` - Attention needed styling (purple)

## Design Rationale

### Visual Hierarchy
1. **Strategic Priority** appears first with highest visual weight (bold uppercase, accent color, subtle background)
2. **Key Findings** provide supporting evidence with clean bullet structure
3. **Recommended Actions** appear last with action-oriented styling (numbered list, green accent)

### Compact Design Features
- **1.5 line-height** provides optimal readability without wasting vertical space
- **0.4rem gaps** between list items creates density while maintaining scannability
- **Minimal padding** (0.75rem) on highlighted sections reduces card height
- **Smaller fonts** (0.875rem for lists) maximize information density
- **Color-coded sections** enable instant recognition with subtle backgrounds
- **Semantic HTML** (h4, ul, ol) provides proper document structure
- **Bold typography** creates visual hierarchy without large font sizes

### Responsive Design
- Headings scale down on mobile (0.8125rem / 0.875rem)
- List padding adjusts for smaller screens (1rem)
- List gaps tighten further on mobile (0.35rem)
- Severity badges shrink appropriately (0.5625rem font size)
- Maintains readability while preserving compact design

## Usage Example

### AI Output Format
```
**STRATEGIC PRIORITY**
Enhance overall portfolio stability by addressing critical anomalies and improving data health.

**KEY FINDINGS**
• 8 smoke detectors triggered warning signals, indicating potential critical issues [HIGH RISK]
• 4 solutions with high demand and 14 flagged for medium demand may lead to resource strain [MEDIUM RISK]
• 10 solutions are missing key metrics, resulting in a low data health score of 94% [ATTENTION NEEDED]
• Achieving only 43% of the UX target suggests significant room for improvement [MEDIUM RISK]
```

### Rendered Output
The above format renders in a **2-row layout**:

**Row 1 (Full Width):**
- AI Insights card with Strategic Priority section (purple background, bold heading)
- Bulleted list for key findings with proper spacing
- Color-coded severity badges inline with text

**Row 2 (Side by Side):**
- Smoke Detectors scorecard (compact, centered layout)
- Data Health Score scorecard (compact, centered layout)

## Visual Layout

```
┌─────────────────────────────────────────────────────┐
│   🎯 Action Layer: Portfolio Health Summary         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🤖 AI-Driven Insights (FULL WIDTH)                │
│  ╔═══════════════════════════════════════════════╗ │
│  ║ STRATEGIC PRIORITY                            ║ │
│  ║ Enhance portfolio stability...                ║ │
│  ║                                               ║ │
│  ║ KEY FINDINGS                                  ║ │
│  ║ • 8 smoke detectors [HIGH RISK]               ║ │
│  ║ • 4 high demand [MEDIUM RISK]                 ║ │
│  ║ • 10 missing metrics [ATTENTION NEEDED]       ║ │
│  ║ • 43% UX achievement [MEDIUM RISK]            ║ │
│  ╚═══════════════════════════════════════════════╝ │
│                                                     │
├──────────────────────┬──────────────────────────────┤
│  🚨                  │  📊                          │
│  8                   │  94%                         │
│  Smoke Detectors     │  Data Health Score           │
│  Triggered           │  10 missing metrics          │
└──────────────────────┴──────────────────────────────┘
```

## Testing Checklist

### Desktop (1920x1080)
- ✅ AI Insights card spans full width (Row 1)
- ✅ Scorecards are side by side with no white space (Row 2)
- ✅ Headings are bolded and uppercase
- ✅ Bullet lists render with proper indenting
- ✅ Color badges appear with correct colors (High=red, Medium=orange, Attention=purple)
- ✅ Line spacing prevents "wall of text" (1.5 line-height)
- ✅ 2-section hierarchy is clear (Strategic Priority + Key Findings)
- ✅ No "Recommended Actions" section present

### Mobile (375x667)
- ✅ Headings scale appropriately
- ✅ Lists remain readable with adjusted padding
- ✅ Severity badges don't overflow
- ✅ Line spacing maintains readability

### Filter Consistency
- ✅ Formatting maintained on filter changes
- ✅ Structured output preserved on regeneration

## Browser Support
- Chrome/Edge (Chromium) ✅
- Safari (WebKit) ✅
- Firefox ✅

## Accessibility
- Semantic HTML structure (h4, ul, ol)
- Sufficient color contrast for badges
- Keyboard navigation compatible
- Screen reader friendly

## Performance
- Parsing overhead: <5ms
- No impact on initial page load
- Efficient DOM manipulation
- Lightweight CSS (minimal specificity)

## Maintenance Notes

### Modifying Sections
To add a new section type, update `parseStructuredAIOutput()`:
```javascript
if (sectionName.includes('NEW_SECTION')) {
    sectionClass += ' ai-new-section';
}
```

### Changing Severity Markers
To add a new severity level, update both:
1. `parseInlineFormatting()` - Add regex replacement
2. CSS - Add `.ai-severity-newlevel` class

### Adjusting Styling
All colors use CSS custom properties from Mercury Light Design System:
- `--mercury-accent` - Purple
- `--danger` - Red
- `--warning` - Orange
- `--success` - Green
- `--text-primary`, `--text-secondary`, `--text-muted` - Text colors

## Rollback Instructions

### Quick Rollback (CSS Only)
If styling breaks existing layout, remove lines 5687-5840 in `dashboard-style.css`

### Partial Rollback (JS Only)
Revert line 748 in `ui-governance.js`:
```javascript
contentEl.innerHTML = `<p>${escapeHtml(aiText)}</p>`;
```

### Full Rollback
```bash
git revert <commit-hash>
git push origin main
```

## Related Documentation
- [Mercury Light Design System](../architecture/design-system.md)
- [Governance Dashboard Architecture](../architecture/governance-dashboard.md)
- [AI Integration Guide](../guides/ai-integration.md)

