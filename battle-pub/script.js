document.getElementById('battle').addEventListener('submit', async function(event) {
    event.preventDefault();

    const char1 = {name: document.getElementById('char1name').value, description: document.getElementById('char1desc').value}
    const char2 = {name: document.getElementById('char2name').value, description: document.getElementById('char2desc').value}
    const responseDiv = document.getElementById('response');
    responseDiv.innerHTML = '';


    const response = await fetch('/battles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ char1:char1, char2:char2, language: document.getElementById('lang').value})
    });

    if (!response.ok) {
        responseDiv.textContent = 'Error: ' + response.statusText;
        return;
    }
    responseDiv.textContent = "";

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        responseDiv.textContent += chunk;
    }
});
function updateWindowShit() {
    if(window.outerWidth > window.outerHeight) {
        document.getElementsByTagName('body')[0].style.display = 'flex';
    } else {
        document.getElementsByTagName('body')[0].style.display = '';
    }
}

setInterval(() => {
    updateWindowShit();
}, 50);