/**
 * Configuration file for Google Apps Script Web App connection
 * 
 * This version uses Google Apps Script instead of Google Sheets API
 * No Google Cloud Console or API key needed!
 * 
 * To get your Web App URL:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Deploy → New deployment → Web app
 * 4. Set "Who has access" to "Anyone"
 * 5. Copy the Web App URL
 */

const CONFIG = {
    // Your Google Apps Script Web App URL
    // Should look like: https://script.google.com/macros/s/XXXXX/exec
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxIAPLG0ypxN_vAao2W81YwDKjbNwc8G37HslkG-6gFlHOdnNuXC0DFdLu7nvw0q6Zo/exec',
    
    // AI Recommendations Configuration (LiteLLM)
    // IMPORTANT: API keys should be changed per environment
    // For production, use environment-specific keys
    // Never commit real production keys to version control
    // Consider using environment variables or a separate config file (gitignored)
    LITELLM_API_KEY: 'sk-Cv-XPJMj9Si0Hk8EB2KeLg', // Replace with your key
    LITELLM_API_ENDPOINT: 'https://ist-prod-litellm.nullmplatform.com/chat/completions', // Company LiteLLM proxy
    AI_MODEL: 'openai/gpt-4o-mini', // GPT-4o Mini via LiteLLM proxy
    AI_RECOMMENDATIONS_ENABLED: true,
    AI_MAX_CHARS: 330,
    AI_REQUEST_TIMEOUT: 5000 // 5 seconds
};

