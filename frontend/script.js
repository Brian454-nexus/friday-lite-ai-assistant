let chatHistory = [];

async function sendMessage(message) {
    chatHistory.push({ sender: 'You', text: message });
    const response = await fetch('http://localhost:3000/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    });
    const data = await response.json();
    chatHistory.push({ sender: 'Friday', text: data.reply });
    renderChat();
    messageInput.value = '';
}

function renderChat() {
    const chatDisplay = document.getElementById('chat-display');
    chatDisplay.innerHTML = '';
    chatHistory.forEach(msg => {
        chatDisplay.innerHTML += `<p><strong>${msg.sender}:</strong> ${msg.text}</p>`;
    });
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
sendBtn.addEventListener('click', () => sendMessage(messageInput.value.trim()));

