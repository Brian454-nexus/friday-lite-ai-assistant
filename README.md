# 🚀 FRIDAY LITE-AI Personal Assistant

## 🤖 Introduction
FRIDAY LITE-AI is a cutting-edge **AI-powered personal assistant** that leverages **Dialogflow API** to provide intelligent responses, streamline tasks, and enhance user interaction. Inspired by the **futuristic AI systems** in sci-fi, FRIDAY LITE-AI is built to be a **smart, responsive, and human-like assistant** that operates seamlessly in a Single Page Application (SPA) format.

## 🎯 Features
✔ **Natural Language Processing (NLP)** – Powered by **Dialogflow API** for smart conversations.  
✔ **Single Page Application (SPA)** – Smooth, seamless experience with no page reloads.  
✔ **Real-time Chat Interface** – Engaging and interactive chat UI.  
✔ **Dark/Light Mode Toggle** – Personalized themes for better user experience.  
✔ **Keyboard Shortcut Support** – Press `Enter` to send messages quickly.  
✔ **Asynchronous API Calls** – Fast and efficient data fetching with `fetch()` and `async/await`.  
✔ **Interactive Event Listeners** – Click, keypress, and mode switch events for smooth interaction.  
✔ **Dynamic Chat History** – Messages are rendered using `map()` for better UI updates.  
✔ **JSON Integration (Stretch Goal)** – Option to save and retrieve chat history using `db.json`.  

## 🏗️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript (Vanilla JS)  
- **AI API:** Dialogflow API  
- **Data Handling:** Fetch API, JSON  
- **Styling:** Responsive CSS, Theme Switching  

## 📂 Project Structure
```
FRIDAY-LITE-AI/
├── frontend/
│   ├── index.html   # Chat Interface
│   ├── style.css    # Styling
│   ├── script.js    # API Calls & Logic
├── assets/
│   ├── images/
├── db.json          # (Stretch Goal) Chat History Persistence
├── README.md        # Documentation
```

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```sh
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

