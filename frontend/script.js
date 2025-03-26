let chatHistory = [];

async function sendMessage(message) {
    chatHistory.push({ sender: 'You', text: message });

