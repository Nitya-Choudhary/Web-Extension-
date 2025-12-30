const summarizeBtn = document.getElementById('summarizeBtn');
const loader = document.getElementById('loader');
const resultContainer = document.getElementById('resultContainer');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');

summarizeBtn.addEventListener('click', async () => {
    // 1. Reset UI state
    loader.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    summarizeBtn.disabled = true;
    output.innerText = '';

    try {
        // 2. Get the current active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tabs || tabs.length === 0) {
            throw new Error("No active tab found. Please refresh the page.");
        }

        const activeTab = tabs[0];

        // 3. Safety Check: Chrome blocks scripting on internal pages
        if (activeTab.url.startsWith("chrome://") || activeTab.url.startsWith("edge://") || activeTab.url.startsWith("https://chrome.google.com/webstore")) {
            throw new Error("Chrome prevents extensions from reading system pages or the Web Store. Please try a news site or blog.");
        }

        // 4. Extract text from the webpage
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: () => document.body.innerText,
        }).catch(err => {
            console.error("Scripting error:", err);
            throw new Error("Chrome blocked access to this page. Try refreshing.");
        });

        // 5. Validation: This is where your 'reading 0' error lived
        if (!injectionResults || !Array.isArray(injectionResults) || injectionResults.length === 0) {
            throw new Error("Could not extract any content from this page.");
        }

        const pageText = injectionResults[0].result;
        
        if (!pageText || pageText.trim().length < 50) {
            throw new Error("This page doesn't have enough text to summarize.");
        }

        // Truncate text to stay within API limits
        const cleanedText = pageText.trim().substring(0, 10000);

        // 6. API Call (Replace YOUR_API_KEY with a fresh one from AI Studio)
        const apiKey = "YOUR_API_KEY"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `Provide a concise bulleted summary of the following content: ${cleanedText}` }] 
                }]
            })
        });

        const data = await response.json();

        // 7. Check for API-specific errors
        if (data.error) {
            throw new Error(`AI API Error: ${data.error.message}`);
        }

        // 8. Safely extract and display the summary
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const summary = data.candidates[0].content.parts[0].text;
            output.innerText = summary;
            loader.classList.add('hidden');
            resultContainer.classList.remove('hidden');
        } else {
            throw new Error("The AI was unable to generate a response for this content.");
        }

    } catch (error) {
        console.error("Extension Error:", error);
        output.innerText = "Error: " + error.message;
        loader.classList.add('hidden');
        resultContainer.classList.remove('hidden');
    } finally {
        summarizeBtn.disabled = false;
    }
});

// Clipboard functionality
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.innerText);
    const originalIcon = copyBtn.innerText;
    copyBtn.innerText = "✅";
    setTimeout(() => { copyBtn.innerText = originalIcon; }, 2000);
});
