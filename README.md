# 🚀 FRIDAY LITE - AI Personal Assistant

## 🤖 Introduction
FRIDAY LITE is a sleek, AI-powered personal assistant built with **Dialogflow API**. Designed as a **Single Page Application (SPA)**, it offers a modern, responsive chat interface inspired by Grok and ChatGPT.

## 🎯 Features
✔ **NLP via Dialogflow** - Smart, human-like responses.  
✔ **SPA Design** - No page reloads, smooth UX.  
✔ **Aesthetic UI** - Chat bubbles, gradients, animations.  
✔ **Dark/Light Mode** - Toggle with a stylish emoji button.  
✔ **Event Listeners** - Send via click, Enter key, theme toggle.  
✔ **Chat History** - Dynamic rendering with array iteration.  
✔ **Async API Calls** - Fast, reliable communication with the backend.  
✔ **Stretch Goal** - Persistent chat history with JSON-Server.

## 🏗️ Tech Stack
- **Frontend**: HTML, CSS, Vanilla JS  
- **Backend**: Node.js, Express  
- **AI**: Dialogflow API  
- **Data**: JSON, Fetch API  

## 📂 Project Structure
FRIDAY-LITE-AI/
├── frontend/
│   ├── index.html   # Chat UI
│   ├── style.css    # Styling
│   ├── script.js    # Logic & API
├── db.json          # Chat history (stretch goal)
├── server.js        # Backend server
├── package.json     # Dependencies
├── README.md        # Docs

text


## 🚀 Setup Instructions

### 1. Clone the Repo
```bash
git clone https://github.com/yourusername/friday-lite-ai.git
cd friday-lite-ai
```

### 2️⃣ Setup API Key
- Go to **Dialogflow Console** and create a new agent.
- Retrieve your **API Key**.
- Store it securely in a `.env` file (DO NOT expose it publicly).

### 3️⃣ Run the Project
Simply open `index.html` in your browser!

### (Optional) 4️⃣ Run JSON Server for Chat History
```sh
json-server --watch db.json
```

## 🎮 How to Use
1. Type your message in the chat input.
2. Click the **Send** button or press `Enter` to interact with FRIDAY LITE-AI.
3. Toggle **Dark/Light Mode** for a customized UI experience.
4. Enjoy real-time AI-powered responses!

## 🎯 Future Enhancements
🔹 **Voice Input Support** for hands-free AI conversations.  
🔹 **Multi-language Support** for a broader audience.  
🔹 **Task Automation** to set reminders, fetch weather, etc.  
🔹 **Persistent Chat History** with a full database backend.  

## 🤝 Contributing
Want to enhance FRIDAY LITE-AI? Follow these steps:
1. **Fork** the repository.
2. Create a **new branch** (`feature-branch-name`).
3. Commit changes (`git commit -m "Added new feature"`).
4. Push to your fork and create a **Pull Request**.

## ⚖️ License
This project is licensed under the **MIT License**.

## 🌟 Acknowledgments
Special thanks to:
- **Dialogflow** for its NLP capabilities.
- **OpenAI** for AI inspiration.
- The **developer community** for continuous learning and innovation.

🚀 **Let's build the future of AI together!** 🤖

