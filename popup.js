const summarizeBtn = document.getElementById('summarizeBtn');
const loader = document.getElementById('loader');
const resultContainer = document.getElementById('resultContainer');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');

summarizeBtn.addEventListener('click', async () => {
    // 1. Reset UI
    loader.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    summarizeBtn.disabled = true;
    output.innerText = '';

    try {
        // 2. GET API KEY FROM STORAGE
        const storedData = await chrome.storage.local.get('geminiApiKey');
        const apiKey = storedData.geminiApiKey;

        if (!apiKey) {
            throw new Error("API Key missing! Right-click the extension icon, go to 'Options', and save your key.");
        }

        // 3. Get Tab and extract text
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
            throw new Error("Chrome blocks AI on system pages. Try a news article.");
        }

        const injection = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText,
        });

        if (!injection || !injection[0]?.result) {
            throw new Error("Could not read page content.");
        }

        const pageText = injection[0].result.trim().substring(0, 12000);

        // 4. API CALL
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `Summarize this in 3-5 clear bullet points: ${pageText}` }] 
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            if (data.error.message.includes("API key not valid")) {
                throw new Error("Invalid API Key. Please check your Settings/Options.");
            }
            throw new Error(data.error.message);
        }

        // 5. Display Result
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            output.innerText = data.candidates[0].content.parts[0].text;
            loader.classList.add('hidden');
            resultContainer.classList.remove('hidden');
        } else {
            throw new Error("AI couldn't generate a summary. The page might be too short or protected.");
        }

    } catch (error) {
        output.innerText = "Error: " + error.message;
        loader.classList.add('hidden');
        resultContainer.classList.remove('hidden');
    } finally {
        summarizeBtn.disabled = false;
    }
});

// Copy logic
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.innerText);
    copyBtn.innerText = "✅";
    setTimeout(() => { copyBtn.innerText = "📋"; }, 2000);
});
