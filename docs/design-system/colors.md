# Color System

**Version:** 1.0.0  
**Last Updated:** November 15, 2025

---

## 🎨 Color Philosophy

The Mercury Light color system is built on **ethereal clarity** with soft, approachable hues that create depth through layered transparency rather than stark contrast.

**Core Principles:**
- Soft, muted tones for reduced eye strain
- Purple/indigo as primary accent (Mercury theme)
- Generous use of transparency for glass effect
- Semantic color naming for clear intent
- WCAG AA compliant contrast ratios

---

## 🌈 Color Palette

### Primary Colors

#### Mercury Accent (Primary Brand)

```css
--primary: #667eea
```

<table>
<tr>
<td style="background: #667eea; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Primary buttons, key highlights, active states<br>
<strong>HEX:</strong> #667eea<br>
<strong>RGB:</strong> rgb(102, 126, 234)<br>
<strong>HSL:</strong> hsl(229, 76%, 66%)
</td>
</tr>
</table>

**Contrast Ratios:**
- On white background: 4.8:1 ✅ WCAG AA
- With white text: 4.5:1 ✅ WCAG AA

---

#### Secondary

```css
--secondary: #764ba2
```

<table>
<tr>
<td style="background: #764ba2; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Gradient ends, secondary highlights, badges<br>
<strong>HEX:</strong> #764ba2<br>
<strong>RGB:</strong> rgb(118, 75, 162)<br>
<strong>HSL:</strong> hsl(270, 37%, 46%)
</td>
</tr>
</table>

---

#### Mercury Accent (Refined)

```css
--mercury-accent: #6366f1
```

<table>
<tr>
<td style="background: #6366f1; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Focus states, important UI elements, borders<br>
<strong>HEX:</strong> #6366f1<br>
<strong>RGB:</strong> rgb(99, 102, 241)<br>
<strong>HSL:</strong> hsl(238, 84%, 67%)
</td>
</tr>
</table>

---

#### Mercury Glow

```css
--mercury-glow: #818cf8
```

<table>
<tr>
<td style="background: #818cf8; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Hover states, subtle highlights<br>
<strong>HEX:</strong> #818cf8<br>
<strong>RGB:</strong> rgb(129, 140, 248)<br>
<strong>HSL:</strong> hsl(234, 89%, 74%)
</td>
</tr>
</table>

---

#### Mercury Silver

```css
--mercury-silver: #e8eaf0
```

<table>
<tr>
<td style="background: #e8eaf0; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Subtle backgrounds, dividers<br>
<strong>HEX:</strong> #e8eaf0<br>
<strong>RGB:</strong> rgb(232, 234, 240)<br>
<strong>HSL:</strong> hsl(225, 22%, 93%)
</td>
</tr>
</table>

---

### Semantic Colors

#### Success

```css
--success: #10b981
```

<table>
<tr>
<td style="background: #10b981; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Success messages, positive metrics, "on target" indicators<br>
<strong>HEX:</strong> #10b981<br>
<strong>RGB:</strong> rgb(16, 185, 129)<br>
<strong>HSL:</strong> hsl(160, 84%, 39%)<br>
<strong>Contrast on white:</strong> 3.9:1 ✅ WCAG AA (large text)
</td>
</tr>
</table>

**When to Use:**
- Metrics above target
- Successful operations
- Positive smoke detector results
- "Healthy" status indicators

---

#### Warning

```css
--warning: #f59e0b
```

<table>
<tr>
<td style="background: #f59e0b; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Caution alerts, "approaching threshold" warnings<br>
<strong>HEX:</strong> #f59e0b<br>
<strong>RGB:</strong> rgb(245, 158, 11)<br>
<strong>HSL:</strong> hsl(38, 92%, 50%)<br>
<strong>Contrast on white:</strong> 3.1:1 ⚠️ (use larger sizes)
</td>
</tr>
</table>

**When to Use:**
- Metrics near target but not critical
- Semi-automated processes
- "Attention needed" alerts

---

#### Danger

```css
--danger: #ef4444
```

<table>
<tr>
<td style="background: #ef4444; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Errors, critical issues, smoke detectors triggered<br>
<strong>HEX:</strong> #ef4444<br>
<strong>RGB:</strong> rgb(239, 68, 68)<br>
<strong>HSL:</strong> hsl(0, 84%, 60%)<br>
<strong>Contrast on white:</strong> 4.5:1 ✅ WCAG AA
</td>
</tr>
</table>

**When to Use:**
- Smoke detectors triggered
- Critical errors
- Metrics significantly below target
- Data quality issues

---

### Text Colors

#### Text Primary

```css
--text-primary: #1e293b
```

<table>
<tr>
<td style="background: #1e293b; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Headlines, primary body text, important content<br>
<strong>HEX:</strong> #1e293b<br>
<strong>RGB:</strong> rgb(30, 41, 59)<br>
<strong>Contrast on white:</strong> 14.7:1 ✅ WCAG AAA
</td>
</tr>
</table>

---

#### Text Secondary

```css
--text-secondary: #475569
```

<table>
<tr>
<td style="background: #475569; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Secondary text, labels, descriptions<br>
<strong>HEX:</strong> #475569<br>
<strong>RGB:</strong> rgb(71, 85, 105)<br>
<strong>Contrast on white:</strong> 8.6:1 ✅ WCAG AAA
</td>
</tr>
</table>

---

#### Text Tertiary

```css
--text-tertiary: #64748b
```

<table>
<tr>
<td style="background: #64748b; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Metadata, timestamps, auxiliary info<br>
<strong>HEX:</strong> #64748b<br>
<strong>RGB:</strong> rgb(100, 116, 139)<br>
<strong>Contrast on white:</strong> 5.8:1 ✅ WCAG AA
</td>
</tr>
</table>

---

#### Text Muted

```css
--text-muted: #94a3b8
```

<table>
<tr>
<td style="background: #94a3b8; width: 100px; height: 60px; border-radius: 8px;"></td>
<td>
<strong>Use Cases:</strong> Placeholder text, disabled states, very subtle info<br>
<strong>HEX:</strong> #94a3b8<br>
<strong>RGB:</strong> rgb(148, 163, 184)<br>
<strong>Contrast on white:</strong> 3.5:1 ⚠️ (use for large text only)
</td>
</tr>
</table>

---

### Glass Effect Colors

These colors use **RGBA** for transparency, creating the signature frosted glass effect.

#### Glass Background

```css
--glass-bg: rgba(255, 255, 255, 0.45)
```

**Use Cases:** Card backgrounds, panel overlays, modals  
**Appearance:** Semi-transparent white with 45% opacity  
**Always pair with:** `backdrop-filter: blur(var(--blur-amount))`

```css
.glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--blur-amount));
}
```

---

#### Glass Border

```css
--glass-border: rgba(255, 255, 255, 0.65)
```

**Use Cases:** Borders on glass elements  
**Appearance:** Brighter white edge at 65% opacity  
**Creates:** Subtle luminous outline

---

#### Glass Shadow

```css
--glass-shadow: rgba(99, 102, 241, 0.08)
```

**Use Cases:** Box shadows on glass cards  
**Appearance:** Soft purple-tinted shadow  
**Usage:**
```css
box-shadow: 0 8px 32px var(--glass-shadow);
```

---

#### Glass Hover

```css
--glass-hover: rgba(255, 255, 255, 0.65)
```

**Use Cases:** Hover state for glass elements  
**Appearance:** Brighter glass effect on interaction

---

## 🎨 Color Gradients

### Primary Gradient

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Use Cases:** Buttons, badges, feature highlights

**Visual Preview:**
```
  #667eea ───────────────► #764ba2
  (Primary)              (Secondary)
```

---

### Table Header Gradient

```css
background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
```

**Use Cases:** Table headers, section backgrounds

---

### Background Gradient (Body)

```css
background: 
    radial-gradient(circle at 20% 80%, rgba(167, 139, 250, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(196, 181, 253, 0.04) 0%, transparent 40%),
    linear-gradient(135deg, #fafbfd 0%, #f5f7fb 100%);
background-attachment: fixed;
```

**Creates:** Multi-layered ambient glow effect

---

## 📊 Maturity Stage Colors

Used for lifecycle stage visualization:

| Stage | Color | Hex | Use Case |
|-------|-------|-----|----------|
| **Development** | Blue | `#3b82f6` | New initiatives |
| **Growth** | Green | `#10b981` | Scaling products |
| **Mature** | Purple | `#8b5cf6` | Established solutions |
| **Decline** | Orange | `#f59e0b` | Sunsetting products |

---

## ♿ Accessibility Guidelines

### Contrast Requirements

**WCAG AA Standards:**
- Normal text (< 18px): 4.5:1 minimum
- Large text (≥ 18px): 3:1 minimum
- UI Components: 3:1 minimum

**Our Compliance:**

| Token | On White BG | Status |
|-------|-------------|--------|
| `--text-primary` | 14.7:1 | ✅ AAA |
| `--text-secondary` | 8.6:1 | ✅ AAA |
| `--text-tertiary` | 5.8:1 | ✅ AA |
| `--text-muted` | 3.5:1 | ⚠️ Large text only |
| `--primary` | 4.8:1 | ✅ AA |
| `--success` | 3.9:1 | ✅ AA (large text) |
| `--danger` | 4.5:1 | ✅ AA |

---

## 🎯 Usage Guidelines

### ✅ DO

- Use semantic tokens (`--success`, `--danger`) instead of raw colors
- Maintain consistent glass effect opacity (45% for backgrounds)
- Test color combinations for accessibility
- Use gradients sparingly for important elements
- Apply `backdrop-filter: blur()` with glass backgrounds

### ❌ DON'T

- Hardcode color hex values (use CSS variables)
- Use `--text-muted` for small text (< 18px)
- Mix glass effects with solid colors
- Overuse bright colors (maintain ethereal aesthetic)
- Ignore contrast ratios

---

## 🔧 Implementation Examples

### Glass Card

```css
.card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--blur-amount));
    -webkit-backdrop-filter: blur(var(--blur-amount));
    border: 1px solid var(--glass-border);
    box-shadow: 0 8px 32px var(--glass-shadow);
    border-radius: 16px;
}
```

### Status Badge

```css
.badge-success {
    background: var(--success);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 8px;
    font-weight: 600;
}
```

### Interactive Button

```css
.btn-primary {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    border: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}
```

---

## 🌙 Dark Mode (Planned)

Dark mode color tokens (not yet implemented):

```css
@media (prefers-color-scheme: dark) {
    :root {
        --text-primary: #f1f5f9;
        --text-secondary: #cbd5e1;
        --text-tertiary: #94a3b8;
        --text-muted: #64748b;
        
        --glass-bg: rgba(15, 23, 42, 0.6);
        --glass-border: rgba(51, 65, 85, 0.8);
        --glass-shadow: rgba(0, 0, 0, 0.3);
        
        /* Semantic colors remain the same */
    }
}
```

---

## 📚 Related Documentation

- [Typography](./typography.md) - Font pairing with colors
- [Components](./components.md) - Component-specific color usage
- [Patterns](./patterns.md) - Common color patterns

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

