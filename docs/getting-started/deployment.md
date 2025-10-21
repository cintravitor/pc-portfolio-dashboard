# Deployment Guide

## Overview

This guide covers deploying the P&C Portfolio Dashboard to production (GitHub Pages) and managing the Google Apps Script backend.

## Prerequisites

- GitHub repository access
- Google Apps Script editor access
- Google Sheets with portfolio data
- LiteLLM API key (for AI features)

## Production Deployment (GitHub Pages)

### Initial Setup

1. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Save

2. **Configure Custom Domain** (optional)
   - Add CNAME file to repository root
   - Configure DNS records
   - Enable HTTPS

### Deploy Process

#### Automated (Recommended)

Deployment happens automatically when changes are pushed to `main`:

```bash
git checkout main
git merge feature/your-feature
git push origin main
```

GitHub Actions will build and deploy automatically (if configured).

#### Manual

1. **Merge to main:**
   ```bash
   git checkout main
   git merge --no-ff feature/your-feature
   ```

2. **Tag release:**
   ```bash
   git tag -a v6.3.x -m "Release description"
   git push origin main --tags
   ```

3. **Verify deployment:**
   Visit: https://cintravitor.github.io/pc-portfolio-dashboard/

## Google Apps Script Backend

### Setup

1. **Open Apps Script Editor**
   - Go to Google Sheets with portfolio data
   - Extensions → Apps Script

2. **Copy Backend Code**
   - Copy contents of `google-apps-script/analytics-backend.gs`
   - Paste into Code.gs in Apps Script editor
   - Save (Cmd+S / Ctrl+S)

3. **Deploy as Web App**
   - Click Deploy → New deployment
   - Type: Web app
   - Description: "P&C Portfolio Backend v6.3.x"
   - Execute as: Me
   - Who has access: Anyone
   - Deploy

4. **Copy Web App URL**
   ```
   https://script.google.com/macros/s/[ID]/exec
   ```

5. **Update Frontend Config**
   Edit `src/js/config.js`:
   ```javascript
   WEB_APP_URL: 'YOUR_WEB_APP_URL_HERE'
   ```

### Updating Backend

1. **Edit Apps Script**
   - Make changes in Apps Script editor
   - Save changes

2. **Redeploy**
   - Deploy → Manage deployments
   - Click pencil icon on active deployment
   - Change version to "New version"
   - Description: "Update description"
   - Deploy

   **Note:** If using "Head (latest code)" deployment, just save - no redeploy needed.

## Configuration

### Environment Variables

Update `src/js/config.js` before deployment:

```javascript
const CONFIG = {
    // Apps Script backend
    WEB_APP_URL: 'https://script.google.com/macros/s/[ID]/exec',
    
    // LiteLLM API for AI features
    LITELLM_API_ENDPOINT: 'https://api.litellm.ai/v1/chat/completions',
    LITELLM_API_KEY: 'your-api-key-here',
    AI_MODEL: 'gpt-4o-mini',
    
    // Feature flags
    ENABLE_AI_RECOMMENDATIONS: true,
    ENABLE_ANALYTICS_TRACKING: true,
    
    // Data settings
    CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
    AUTO_REFRESH: false
};
```

### Spreadsheet Configuration

Ensure Google Sheet has:
- Sheet name: `[2025] P&C Portfolio`
- Column headers in row 2 (row 1 for section headers)
- Required columns:
  - Solution name
  - Owner's Name
  - P'n'C Area
  - Maturity Stage
  - Key Metric User Experience
  - Key Metric Business Impact
  - Monthly data columns (JAN-DEC)
  - TARGET columns

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing
- [ ] No console errors
- [ ] Code linted and formatted
- [ ] Comments added for complex logic
- [ ] No hardcoded credentials

### Functionality

- [ ] All tabs load correctly
- [ ] Data fetches from Apps Script
- [ ] Filters work (search, dropdowns, pills)
- [ ] Cards display with correct data
- [ ] Detail panel opens with charts
- [ ] AI summaries appear
- [ ] Smoke detectors show
- [ ] Governance dashboard renders
- [ ] Analytics charts display

### Performance

- [ ] Page load < 3 seconds
- [ ] No memory leaks
- [ ] Images optimized
- [ ] CSS/JS minified (if applicable)
- [ ] Caching configured

### Documentation

- [ ] README updated
- [ ] CHANGELOG updated
- [ ] Version number incremented
- [ ] Deployment log created

## Deployment Workflow

### Standard Release

1. **Create Release Branch**
   ```bash
   git checkout -b release/v6.3.x
   ```

2. **Update Version Numbers**
   - `index.html` (script version tags)
   - `config.js`
   - `README.md`

3. **Run Tests**
   ```bash
   npm test  # If configured
   ```

4. **Create Pre-Deployment Backup**
   ```bash
   git tag pre-deployment-backup-$(date +%Y-%m-%d-%H%M)
   ```

5. **Merge to Main**
   ```bash
   git checkout main
   git merge --no-ff release/v6.3.x
   ```

6. **Tag Release**
   ```bash
   git tag -a v6.3.x -m "Release v6.3.x: Description"
   ```

7. **Push to Remote**
   ```bash
   git push origin main --tags
   ```

8. **Create Deployment Log**
   Create file in `_deployment_logs/`:
   ```
   DEPLOYMENT_v6.3.x_YYYY-MM-DD.md
   ```

9. **Verify Production**
   - Visit production URL
   - Test all features
   - Check browser console
   - Monitor for errors

### Hotfix Process

1. **Create Hotfix Branch from Main**
   ```bash
   git checkout main
   git checkout -b hotfix/issue-description
   ```

2. **Fix Issue**
   Make minimal changes to fix critical bug

3. **Test Fix**
   Verify fix resolves issue without side effects

4. **Merge to Main**
   ```bash
   git checkout main
   git merge --no-ff hotfix/issue-description
   ```

5. **Tag Patch Version**
   ```bash
   git tag -a v6.3.x+1 -m "Hotfix: description"
   git push origin main --tags
   ```

## Rollback Procedure

### Quick Rollback (Production Issue)

1. **Identify Last Good Version**
   ```bash
   git log --oneline
   ```

2. **Revert to Previous Version**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Or Restore from Backup Tag**
   ```bash
   git checkout pre-deployment-backup-YYYY-MM-DD-HHMM
   git checkout -b rollback-temp
   git push origin rollback-temp
   ```

4. **Notify Team**
   Document rollback reason and next steps

### Apps Script Rollback

1. **Open Apps Script Editor**
2. **Deploy → Manage deployments**
3. **Switch to previous version number**
4. **Deploy**

## Monitoring

### Post-Deployment Checks

**First 5 Minutes:**
- [ ] Homepage loads
- [ ] Data fetches successfully
- [ ] No JavaScript errors
- [ ] All tabs functional

**First Hour:**
- [ ] Monitor error logs
- [ ] Check analytics for traffic
- [ ] Verify user reports
- [ ] Watch performance metrics

**First Day:**
- [ ] Review user feedback
- [ ] Check data accuracy
- [ ] Monitor system health
- [ ] Document any issues

### Health Checks

Run these tests regularly:

```bash
# Test data endpoint
curl -s [WEB_APP_URL] | jq '.success'

# Test governance endpoint
curl -s "[WEB_APP_URL]?action=getGovernanceData" | jq '.success'
```

Expected: `true` for both

## Troubleshooting

### Deployment Fails

- Check GitHub Actions logs
- Verify repository permissions
- Ensure no merge conflicts
- Check file paths and names

### Apps Script Issues

- Verify spreadsheet ID correct
- Check sheet name matches
- Confirm "Anyone" access enabled
- Review execution logs in Apps Script

### Data Not Loading in Production

- Check WEB_APP_URL in config.js
- Verify CORS headers from Apps Script
- Test endpoint directly in browser
- Check browser console for errors

## Security

### Before Deploying

- [ ] Remove debug console.logs
- [ ] No API keys in source code
- [ ] Sensitive data not exposed
- [ ] HTTPS enforced
- [ ] Input validation in place

### API Key Management

Store API keys securely:
1. Use environment variables (if backend supports)
2. Never commit to repository
3. Rotate keys regularly
4. Use least-privilege access

## Maintenance

### Regular Tasks

**Weekly:**
- Review error logs
- Check performance metrics
- Update dependencies

**Monthly:**
- Security audit
- Performance optimization
- Documentation review

**Quarterly:**
- Major version update
- Architecture review
- User feedback analysis

## Resources

- [Quick Start Guide](quick-start.md)
- [Local Development Guide](local-development.md)
- [Apps Script Documentation](https://developers.google.com/apps-script)
- [GitHub Pages Docs](https://docs.github.com/pages)

## Support

For deployment issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [GitHub Issues](https://github.com/cintravitor/pc-portfolio-dashboard/issues)
3. Contact repository maintainers

