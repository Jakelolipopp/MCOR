document.getElementById('send-btn').addEventListener('click', function() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();

    if (message) {
        const chatBox = document.getElementById('chat-box');
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.classList.add('message');
        chatBox.appendChild(messageElement);
        
        input.value = ''; // Clear input field
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    }
});
