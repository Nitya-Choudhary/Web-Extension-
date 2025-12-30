document.getElementById('saveBtn').addEventListener('click', () => {
  const key = document.getElementById('apiKey').value;
  chrome.storage.local.set({ geminiApiKey: key }, () => {
    const status = document.getElementById('status');
    status.innerText = "✅ Key saved successfully!";
    setTimeout(() => { status.innerText = ""; }, 3000);
  });
});

// Load existing key if it exists
chrome.storage.local.get('geminiApiKey', (data) => {
  if (data.geminiApiKey) {
    document.getElementById('apiKey').value = data.geminiApiKey;
  }
});
