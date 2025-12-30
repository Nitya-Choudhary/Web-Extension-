# AI Summarizer Pro 2025 🚀

A modern Chrome Extension that uses LLMs (Llama 3.3) to provide instant, high-quality summaries of any webpage. Built with Manifest V3 and Glassmorphism UI.

## ✨ Features
- **AI Powered:** Integrated with Hugging Face Inference Router.
- **Dark Mode:** Automatic theme switching with persistence.
- **Local History:** Saves your last 10 summaries locally using Chrome Storage.
- **Privacy First:** Your API key is stored locally on your device and never sent to our servers.

## 🛠️ Installation
1. Clone this repository.
2. Go to `chrome://extensions/` in your browser.
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select the project folder.

## 🔑 Setup
This extension requires a **Hugging Face Token** to function:
1. Get a free token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
2. Ensure the token has "Make calls to Inference Providers" enabled.
3. Right-click the extension icon -> **Options** and paste your token.

## 🏗️ Tech Stack
- **Manifest V3**
- **Hugging Face Router API**
- **Glassmorphism CSS**
