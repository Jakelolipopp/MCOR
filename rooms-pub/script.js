let chat;
let chatcount = -1;

let roomname = sha256(prompt('Whats the room name?'));
let uname = prompt("Whats your name?");

send({action: "getChat", name: roomname});
log("Sent getChat req.");

function handle(res) {
    log("Got res of type " + res.type + "! :D");
    switch (res.type) {
        case "fuck":
          alert("shit");
        break;
        
        case "chat":
          chat = JSON.parse(res.data).chat;
          rerenderChatbox();
          log("Got chat!");
          send({action: "chatCount", name: roomname});
          log("Sent chatcount");
          break;
        
        case "chatcount":
          if (!res.fail) {
            if(res.chatcount != chatcount) {
				log("Counter update");
              	chatcount = res.chatcount;
              	send({action: "getChat", name: roomname});
            } else {
				log("No counter update: " + res.chatcount);
				send({action: "chatCount", name: roomname});
			}
          } else {
			log("fail")
		  }
          break;
        default:
            break;
    }
}



function rerenderChatbox() {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = "";
    chat.forEach(element => {
        const messageElement = document.createElement('p');
        messageElement.textContent = element.name + ": " + element.content;
        messageElement.classList.add('user');
        messageElement.classList.add('message');
        chatBox.appendChild(messageElement);
    });
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

function btnclck() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    const chatBox = document.getElementById('chat-box');

    if (message) {
        log("Sendin msg: " + message);
        send({action: "msg", uname: uname, name:roomname, message:message});
        input.value = ''; // Clear input field
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    }
};

async function send(data) {
    const options = {
        method:"POST",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(data)
    }   
    const response = await fetch('/roomsapi', options);
    const json = await response.json();
    handle(json);
}

function sha256(ascii) {
	function rightRotate(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};
	
	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length'
	var i, j;
	var result = ''

	var words = [];
	var asciiBitLength = ascii[lengthProperty]*8;
	var hash = sha256.h = sha256.h || [];
	var k = sha256.k = sha256.k || [];
	var primeCounter = k[lengthProperty];

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
			k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
		}
	}
	
	ascii += '\x80'
	while (ascii[lengthProperty]%64 - 56) ascii += '\x00'
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j>>8) return;
		words[i>>2] |= j << ((3 - i)%4)*8;
	}
	words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
	words[words[lengthProperty]] = (asciiBitLength)
	
	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16);
		var oldHash = hash;
		hash = hash.slice(0, 8);
		
		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			var w15 = w[i - 15], w2 = w[i - 2];

			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
				+ ((e&hash[5])^((~e)&hash[6]))
				+ k[i]
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3))
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10))
					)|0
				);
			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
				+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
			
			hash = [(temp1 + temp2)|0].concat(hash);
			hash[4] = (hash[4] + temp1)|0;
		}
		
		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i])|0;
		}
	}
	
	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i]>>(j*8))&255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}
	return result;
}

function log(text) {
  document.getElementById("console").innerText += "\n" + text;
  console.log(text)
}