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

