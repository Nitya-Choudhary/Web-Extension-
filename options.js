// Save token to chrome.storage
document.getElementById('saveBtn').addEventListener('click', () => {
    const token = document.getElementById('apiKey').value.trim();
    const status = document.getElementById('status');

    if (!token.startsWith('hf_')) {
        status.textContent = '❌ Invalid Token format.';
        status.style.color = '#ef4444';
        return;
    }

    // We store it under 'geminiApiKey' to match your popup.js logic
    chrome.storage.local.set({ geminiApiKey: token }, () => {
        status.textContent = '✅ Token saved successfully!';
        status.style.color = '#10b981';
        setTimeout(() => { status.textContent = ''; }, 3000);
    });
});

// Load existing token if present
chrome.storage.local.get('geminiApiKey', (data) => {
    if (data.geminiApiKey) {
        document.getElementById('apiKey').value = data.geminiApiKey;
    }
});
