const summarizeBtn = document.getElementById('summarizeBtn');
const loader = document.getElementById('loader');
const resultContainer = document.getElementById('resultContainer');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');

summarizeBtn.addEventListener('click', async () => {
  // UI Reset
  loader.classList.remove('hidden');
  resultContainer.classList.add('hidden');
  summarizeBtn.disabled = true;

  try {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 1. Safety Check: Don't run on restricted Chrome pages
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
      throw new Error("Cannot summarize system pages. Try a news article or blog.");
    }

    // 2. Extract text from the page
    const scriptResult = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText,
    });

    // Check if scriptResult[0] exists to avoid "reading '0'" error
    if (!scriptResult || !scriptResult[0] || !scriptResult[0].result) {
      throw new Error("Could not read text from this page.");
    }

    const pageText = scriptResult[0].result.substring(0, 15000); 

    // 3. API Call
    const apiKey = "YOUR_NEW_API_KEY"; // PUT YOUR NEW KEY HERE
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Summarize this text in concise bullet points: ${pageText}` }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "API Error");
    }

    // 4. Safe data extraction
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      output.innerText = data.candidates[0].content.parts[0].text;
      loader.classList.add('hidden');
      resultContainer.classList.remove('hidden');
    } else {
      throw new Error("AI returned an empty response. Try a different page.");
    }

  } catch (error) {
    output.innerText = "Error: " + error.message;
    loader.classList.add('hidden');
    resultContainer.classList.remove('hidden');
  } finally {
    summarizeBtn.disabled = false;
  }
});

// Copy Feature
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(output.innerText);
  copyBtn.innerText = "✅";
  setTimeout(() => { copyBtn.innerText = "📋"; }, 2000);
});
