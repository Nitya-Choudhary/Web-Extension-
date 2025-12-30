// Elements
const summarizeBtn = document.getElementById('summarizeBtn');
const loader = document.getElementById('loader');
const resultContainer = document.getElementById('resultContainer');
const output = document.getElementById('output');
const themeToggle = document.getElementById('themeToggle');
const lengthSelect = document.getElementById('lengthSelect');
const summarizerTab = document.getElementById('summarizerTab');
const historyTab = document.getElementById('historyTab');
const historyList = document.getElementById('historyList');

// 1. Initial Theme & History Load
chrome.storage.local.get(['theme', 'history'], (data) => {
    if (data.theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
});

// 2. Tab Switching
summarizerTab.addEventListener('click', () => {
    document.getElementById('summarizerView').classList.remove('hidden');
    document.getElementById('historyView').classList.add('hidden');
    summarizerTab.classList.add('active');
    historyTab.classList.remove('active');
});

historyTab.addEventListener('click', () => {
    document.getElementById('summarizerView').classList.add('hidden');
    document.getElementById('historyView').classList.remove('hidden');
    summarizerTab.classList.remove('active');
    historyTab.classList.add('active');
    loadHistory();
});

// 3. Dark Mode Toggle
themeToggle.addEventListener('change', () => {
    const isDark = themeToggle.checked;
    document.body.classList.toggle('dark-mode', isDark);
    chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
});

// 4. Summarization Logic
summarizeBtn.addEventListener('click', async () => {
    loader.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    summarizeBtn.disabled = true;

    try {
        const { geminiApiKey: token } = await chrome.storage.local.get('geminiApiKey');
        if (!token) throw new Error("API Token missing in Options!");

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText,
        });

        const text = results[0].result.trim().substring(0, 7000);
        const detail = lengthSelect.value === 'short' ? "3 points" : lengthSelect.value === 'long' ? "detailed paragraph" : "5 bullet points";

        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "meta-llama/Llama-3.3-70B-Instruct",
                messages: [{ role: "user", content: `Summarize in ${detail}: ${text}` }],
                max_tokens: 500
            })
        });

        const data = await response.json();
        const summary = data.choices[0].message.content;
        
        output.innerText = summary;
        saveHistory(tab.title, summary);
        
        loader.classList.add('hidden');
        resultContainer.classList.remove('hidden');
    } catch (err) {
        output.innerText = "Error: " + err.message;
        loader.classList.add('hidden');
        resultContainer.classList.remove('hidden');
    } finally {
        summarizeBtn.disabled = false;
    }
});

// 5. History Helpers
async function saveHistory(title, summary) {
    const { history = [] } = await chrome.storage.local.get('history');
    const updated = [{ title, summary, date: new Date().toLocaleDateString() }, ...history].slice(0, 10);
    await chrome.storage.local.set({ history: updated });
}

async function loadHistory() {
    const { history = [] } = await chrome.storage.local.get('history');
    historyList.innerHTML = history.map(h => `
        <div class="history-item">
            <div class="history-date">${h.date}</div>
            <strong>${h.title}</strong>
            <p>${h.summary}</p>
        </div>
    `).join('') || "<p>No history found.</p>";
}

document.getElementById('clearHistoryBtn').addEventListener('click', async () => {
    await chrome.storage.local.set({ history: [] });
    loadHistory();
});
