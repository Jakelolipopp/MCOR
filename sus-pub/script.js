function handle(res) {
    console.log(res);
    document.getElementById('chat-box').innerText = res.content;
    unselectSend();
}

function btnclck() {
    send({messages: [{"role":"user", "content":document.getElementById('message-input').value}]});
    document.getElementById('message-input').value = '';
}

function unselectSend() {
    var element = document.getElementById('send-btn'); var clone = element.cloneNode(true); element.parentNode.replaceChild(clone, element);
}


async function send(data) {
    const options = {
        method:"POST",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(data)
    }   
    const response = await fetch('/jb-ai', options);
    const json = await response.json();
    handle(json);
}
