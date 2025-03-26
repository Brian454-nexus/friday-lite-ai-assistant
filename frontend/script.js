let chatHistory = [];

async function sendMessage(message) {
    if (!message) return;

    // Add user message
    chatHistory.push({ sender: 'You', text: message });
    renderChat();

    try {
        const response = await fetch('http://localhost:3000/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        chatHistory.push({ sender: 'Friday', text: data.reply });
    } catch (error) {
        chatHistory.push({ sender: 'Friday', text: 'Oops, something went wrong!' });
        console.error('Error:', error);
    }

    renderChat();
    document.getElementById('message-input').value = '';
}

function renderChat() {
    const chatDisplay = document.getElementById('chat-display');
    chatDisplay.innerHTML = ''; // Clear previous messages
    chatHistory.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', msg.sender === 'You' ? 'user' : 'ai');
        messageDiv.textContent = `${msg.text}`;
        chatDisplay.appendChild(messageDiv);
    });
    chatDisplay.scrollTop = chatDisplay.scrollHeight; // Auto-scroll
}

// Event Listeners
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const themeToggle = document.getElementById('theme-toggle');

sendBtn.addEventListener('click', () => sendMessage(messageInput.value.trim()));
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(messageInput.value.trim());
});
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});