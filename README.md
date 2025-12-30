# 🚀 Gemini Web Summarizer

A modern Chrome Extension that uses Google's Gemini 1.5 Flash AI to summarize any webpage into concise bullet points instantly.

## ✨ Features
- **AI-Powered**: Leverages Gemini 1.5 Flash for high-quality summaries.
- **Privacy-Focused**: Stores your API key locally in your browser (not in the code).
- **Interactive UI**: Includes a loading spinner and a "copy to clipboard" feature.
- **Modern Design**: Clean, responsive popup interface.

## 🛠️ Installation
1. Download this repository as a ZIP or clone it using `git clone`.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the folder containing these files.

## 🔑 Setup
1. Get a free API Key from [Google AI Studio](https://aistudio.google.com/).
2. Right-click the extension icon in your Chrome toolbar.
3. Select **Options**.
4. Paste your API key and click **Save Key**.
5. Navigate to any article and click **Generate Summary**!

## 📁 Project Structure
- `manifest.json`: Configuration and permissions.
- `popup.html/js/css`: Main extension interface and logic.
- `options.html/js`: Secure API key management.
