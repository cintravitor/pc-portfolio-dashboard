# Repository Settings Guide

**Purpose:** Configure your GitHub repository for secure, quality-controlled contributions  
**Date:** October 4, 2025  
**For:** Repository owners and maintainers

---

## 🔐 Security Settings

### 1. Branch Protection Rules (CRITICAL)

**Location:** Settings → Branches → Add rule

**Protect `main` branch with these rules:**

#### ✅ Required Settings:

```
Branch name pattern: main

☑ Require a pull request before merging
  ☑ Require approvals (set to 1)
  ☐ Dismiss stale pull request approvals when new commits are pushed (optional)
  ☐ Require review from Code Owners (optional, if you create CODEOWNERS file)

☑ Require status checks to pass before merging (if you add CI/CD)
  
☐ Require conversation resolution before merging (recommended)

☐ Require signed commits (optional, for extra security)

☑ Require linear history (keeps git history clean)

☐ Require deployments to succeed before merging (optional)

☑ Lock branch (prevents force pushes)
  ☑ Do not allow bypassing the above settings

☑ Restrict who can push to matching branches
  → Add: YOUR_USERNAME (only you can directly push)
```

**What This Does:**
- ✅ Prevents direct pushes to `main` (even from you - encourages PR workflow)
- ✅ Requires PRs to be reviewed before merging
- ✅ Requires at least 1 approval (yours)
- ✅ Prevents force pushes that could rewrite history
- ✅ Keeps git history linear and clean

**Result:** External contributors **CANNOT** push to `main`. They **MUST** create PRs that you review.

---

### 2. Repository Access Control

**Location:** Settings → Collaborators and teams

**Current Status:**
- You are the owner (full access)
- External contributors have NO direct access
- They can only fork and submit PRs

**To Add Trusted Collaborators (Optional):**
1. Go to Settings → Collaborators
2. Click "Add people"
3. Choose permission level:
   - **Read:** Can view and fork
   - **Triage:** Can manage issues and PRs
   - **Write:** Can push to branches (NOT recommended for external)
   - **Maintain:** Can manage repo settings
   - **Admin:** Full access

**Recommendation:** Keep it as-is (only you have access) unless you have trusted team members.

---

### 3. General Repository Settings

**Location:** Settings → General

#### Features to Enable:

**Issues:**
- ☑ Enable issues
- Allows bug reports and feature requests
- Uses your templates automatically

**Pull Requests:**
- ☑ Allow merge commits (default)
- ☑ Allow squash merging (recommended for cleaner history)
- ☑ Allow rebase merging (optional)
- ☑ Automatically delete head branches (keeps repo clean)

**Discussions (Optional):**
- ☑ Enable discussions
- Creates a Q&A forum
- Separate from issues (for questions, not bugs)

**Projects (Optional):**
- Can enable for project management
- Track issues and PRs in boards

#### Danger Zone Settings:

**DO NOT:**
- ❌ Make repository public if you don't want external contributions yet
- ❌ Transfer ownership
- ❌ Archive repository
- ❌ Delete repository

---

## 📝 Pull Request Settings

**Location:** Settings → General → Pull Requests

### Merge Button Options:

**Recommended Configuration:**

```
☑ Allow merge commits
  Default message: "Default commit message"
  
☑ Allow squash merging
  Default message: "Default commit message"
  ☑ Default to pull request title and commit details
  
☐ Allow rebase merging (optional)

☑ Automatically delete head branches
```

**What Each Does:**

1. **Merge Commits** (Traditional)
   - Keeps all commits from PR
   - Creates merge commit
   - Full history preserved

2. **Squash Merging** (Recommended)
   - Combines all PR commits into one
   - Cleaner history
   - Uses PR title as commit message

3. **Rebase Merging**
   - Replays commits on top of base
   - No merge commit
   - Linear history

**Recommendation:** Enable all three, let yourself choose based on PR size.

---

## 🔔 Notification Settings

**Location:** Your Profile → Settings → Notifications → Custom routing

### For Repository Owners:

**You'll be notified about:**
- ✅ New pull requests
- ✅ New issues
- ✅ Comments on your PRs
- ✅ Review requests
- ✅ Mentions (@username)

**Notification Options:**
- Email (immediate)
- Web (check on GitHub)
- Mobile app (if installed)

**Recommended:** Enable email for PRs and issues so you don't miss contributions.

---

## 🤖 GitHub Actions (Optional CI/CD)

**Location:** Settings → Actions → General

### Why Add CI/CD?

Automatically:
- Run linters on PRs
- Check code quality
- Run tests
- Validate changes

### Basic Linting Action Example:

Create `.github/workflows/lint.yml`:

```yaml
name: Lint Code

on:
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check JavaScript
        run: |
          # Add linting commands here
          echo "Linting JavaScript files..."
          # Example: npx eslint src/js/**/*.js
      
      - name: Check for console.log
        run: |
          if grep -r "console.log" src/js/; then
            echo "Error: console.log found in source code"
            exit 1
          fi
```

**Benefits:**
- Automated checks before you review
- Catch common issues early
- Enforce code quality
- Save your time

**Note:** This is optional and can be added later.

---

## 👥 Code Owners (Optional)

**Location:** Create `.github/CODEOWNERS` file

### What is CODEOWNERS?

Automatically requests reviews from specific people based on file paths.

### Example CODEOWNERS file:

```
# Default owner for everything
* @YOUR_USERNAME

# Specific areas
/src/js/core/ @YOUR_USERNAME @TRUSTED_DEVELOPER
/docs/ @YOUR_USERNAME @DOCUMENTATION_TEAM
/src/css/ @YOUR_USERNAME @DESIGNER

# Configuration files (require extra care)
/src/js/config.js @YOUR_USERNAME
/.github/ @YOUR_USERNAME
```

**Benefits:**
- Automatic review requests
- Clear ownership
- Subject matter experts involved

**Recommendation:** Start without this, add later if you have multiple maintainers.

---

## 🌐 GitHub Pages Settings

**Location:** Settings → Pages

**Current Configuration:**

```
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

**How Deployment Works:**

1. You merge a PR to `main`
2. GitHub Pages automatically rebuilds
3. Changes go live in ~1-2 minutes
4. Site accessible at your GitHub Pages URL

**Important:**
- Only merged changes deploy
- PRs do NOT deploy (safe to test)
- You control what gets merged
- Failed deployments don't break the site

**Recommendation:** Keep current settings.

---

## 📊 Repository Visibility

**Location:** Settings → General → Danger Zone

### Options:

1. **Public** (Recommended for Open Source)
   - ✅ Anyone can view
   - ✅ Anyone can fork
   - ✅ Appears in search
   - ✅ Can accept contributions
   - ❌ Code is visible to everyone

2. **Private**
   - ✅ Only you can view
   - ❌ No external contributions
   - ❌ Not open source

**Current Status:** Public (for open source contributions)

**Recommendation:** Keep public if you want community contributions.

---

## 🔍 Security Advisories

**Location:** Security tab → Advisories

### Enable Security Features:

```
☑ Dependency graph
  Tracks your dependencies
  
☑ Dependabot alerts
  Notifies of vulnerable dependencies
  
☑ Dependabot security updates
  Automatically creates PRs to fix vulnerabilities
  
☐ Code scanning (optional)
  Advanced security analysis
```

**Recommendation:** Enable at least Dependabot alerts.

---

## 📋 Issue & PR Templates

**Status:** ✅ Already Configured

You have:
- ✅ Bug report template
- ✅ Feature request template
- ✅ Pull request template

**Location:** `.github/ISSUE_TEMPLATE/` and `.github/pull_request_template.md`

**How They Work:**
- Automatically appear when creating issues/PRs
- Guide contributors to provide necessary information
- Improve quality of submissions

---

## 🎯 Recommended Settings Summary

### Must-Have (Critical):

1. ✅ **Branch Protection on `main`**
   - Require PR reviews
   - Require approvals (1+)
   - Prevent direct pushes
   - Lock branch

2. ✅ **Pull Request Settings**
   - Enable squash merging
   - Auto-delete branches

3. ✅ **Issues Enabled**
   - With templates

4. ✅ **Notifications Enabled**
   - Email for PRs
   - Email for issues

### Nice-to-Have (Optional):

- GitHub Discussions
- GitHub Actions (CI/CD)
- CODEOWNERS file
- Dependabot
- Code scanning

---

## 🔐 Security Checklist

Before accepting contributions:

**Repository:**
- [ ] Branch protection enabled on `main`
- [ ] Only you can merge PRs
- [ ] Force pushes blocked
- [ ] GitHub Pages deploys only from `main`

**For Each PR:**
- [ ] Review code thoroughly
- [ ] Check for security issues (API keys, secrets)
- [ ] Test locally before merging
- [ ] Verify no malicious code
- [ ] Check performance impact
- [ ] Ensure documentation updated

**Red Flags to Watch For:**
- ⚠️ Adds external scripts or CDN links
- ⚠️ Modifies config files
- ⚠️ Includes suspicious URLs
- ⚠️ Accesses localStorage excessively
- ⚠️ Makes unexpected API calls
- ⚠️ Obfuscated code
- ⚠️ Large binary files

---

## 🚀 Deployment Process

### Current Workflow:

```
1. Developer creates PR
   ↓
2. You review code
   ↓
3. You test locally
   ↓
4. You request changes (if needed)
   ↓
5. Developer updates
   ↓
6. You approve & merge
   ↓
7. GitHub Pages auto-deploys
   ↓
8. Live in 1-2 minutes
```

**You Control:**
- ✅ What gets reviewed
- ✅ What gets approved
- ✅ What gets merged
- ✅ What goes to production

**You DON'T Control:**
- ❌ When forks are created (anyone can fork)
- ❌ What developers do in their forks

**But That's OK!** Changes in forks don't affect your repository.

---

## 📞 Getting Help

**GitHub Documentation:**
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Pull Request Reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests)
- [Repository Settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features)

---

## ✅ Quick Setup Checklist

**To configure your repository now:**

1. [ ] Go to Settings → Branches
2. [ ] Click "Add rule"
3. [ ] Enter "main" as branch name pattern
4. [ ] Check "Require a pull request before merging"
5. [ ] Check "Require approvals" (set to 1)
6. [ ] Check "Require linear history"
7. [ ] Check "Lock branch"
8. [ ] Click "Create" or "Save changes"

**Done!** Your `main` branch is now protected.

---

**With these settings, you maintain full control while enabling community contributions!**

*Last Updated: October 4, 2025*

