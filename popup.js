const summarizeBtn = document.getElementById('summarizeBtn');
const loader = document.getElementById('loader');
const resultContainer = document.getElementById('resultContainer');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');

summarizeBtn.addEventListener('click', async () => {
  // UI State Reset
  loader.classList.remove('hidden');
  resultContainer.classList.add('hidden');
  summarizeBtn.disabled = true;

  try {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Extract text
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText,
    });

    const pageText = results[0].result.substring(0, 15000); 

    // API Call
    const apiKey = "AIzaSyBF1qa0LHOovSiRdRlzPRsIW499EVlI4SA";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Summarize this text in concise bullet points: ${pageText}` }] }]
      })
    });

    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text;

    // Display Results
    output.innerText = summary;
    loader.classList.add('hidden');
    resultContainer.classList.remove('hidden');
  } catch (error) {
    output.innerText = "Error: " + error.message;
    loader.classList.add('hidden');
    resultContainer.classList.remove('hidden');
  } finally {
    summarizeBtn.disabled = false;
  }
});

// Copy to Clipboard Feature
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(output.innerText);
  copyBtn.innerText = "✅";
  setTimeout(() => { copyBtn.innerText = "📋"; }, 2000);
});
