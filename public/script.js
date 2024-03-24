async function send(type,send) {
    var datas = {input:send,type:type};
    const options = {
        method:"POST",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(datas)
    }   
    const response = await fetch('/api', options);
    const json = await response.json();
    handle(json);
}

var serverStart = 0;

function time() {
    var date = "";
    var now = Date.now() + "";
    for (let i1 = 0; i1 < 5; i1++) {
        date += now[i1];
    }
    return date;
}

function handle(data) {
    if(frameLoaded) resizeIframe(iframe);
    switch (data.data) {
        case "pong":
            ping(data);
			var ccount = parseInt(data.add);
			if(ccount != chatcount) {
				msgs();
                permMsgs();
				chatcount = ccount;
			}
            break;
        
        case "loginfailed":
			alert("login failed");
            break;

        case "loginrand":
            rand = data.add;
            console.log("rand is set! (" + rand + " (" + data.add + "))");
			pass = sha256(sha256(pass + username) + rand);
			username = "";
			alert("oke");
            document.getElementById("msgbuttons").hidden = false;
        break;
        
		case "fst":
			serverStart = data.add;
			break;
			
        default:
			console.log(data.data);
            break;
    }
}

var last = Date.now();
var pings = new Array();
var avgl = 50;
var username = "";
var pass;
var rand;
var devmode = false;
var setHidden = true;
var setMHidden = true;
var setUHidden = true;
var chatcount = 0;
var iframe;
var frameLoaded = false;

send("ping");

function ping() {
    pings[pings.length] = Date.now() - last;
    if (pings.length > avgl) {
        var added = 10;
        for (let i1 = 0; i1 < avgl; i1++) {
            added += pings[(pings.length-1) - i1];
        }
        added /= avgl;
    } else {
        var added = 10;
        for (let i1 = 0; i1 < pings.length; i1++) {
            added += pings[i1];
        }
        added /= pings.length;
    }
    var cping = (Date.now() - last);
    let plus = "";
    if (cping < 100) {
        plus += "0"
    }
    if (cping < 10) {
        plus += "0";
    }

    cping = plus + cping;

    document.getElementById("ping").innerText = "Ping: " + Math.round(added);
    setTimeout(() => {
        last = Date.now();
        send("ping");
    }, 500);
}

function msg(message) {
    var content = pass + "-" + message;
    send("msg",{"type":"txt","content":content});
}

function pMsg(message) {
    var content = pass + "-" + message;
    send("permMsg",{"type":"txt","content":content});
}

function iframe(url,xsize,ysize) {
	var content = pass + "-" + url;
	send("msg",{"type":"iframe","content":content,"xsize":xsize,"ysize":ysize});
}

function image(url,xsize,ysize) {
	var content = pass + "-" + url;
	send("msg",{"type":"img","content":content,"xsize":xsize,"ysize":ysize});
}

function video(url,xsize,ysize) {
	var content = pass + "-" + url;
	send("msg",{"type":"vid","content":content,"xsize":xsize,"ysize":ysize});
}

function nick(nickname) {
	var content = pass;
	send("nick",{"content":content, "name":nickname});
}

function loginreq() {
    var name = prompt("Name");
    if (name.includes(";") | name.includes("$")) {
        alert("The name includes one or multiple illegal caracters!");
        setTimeout(() => {
            login();
        }, 1000);
        return;
    }
    username = name;
    pass = sha256(prompt("Password"));
	if(devmode)
		console.log(sha256(pass + name));
    console.log("Sending login request... (" + sha256(sha256(pass + name) + time()) + ")");
    send('loginreq',sha256(sha256(pass + name) + time()));
}

function gen() {
    var name = prompt("Name");
    if (name.includes(";") | name.includes("$")) {
        alert("The name includes one or multiple illegal caracters!");
        setTimeout(() => {
            gen();
        }, 1000);
        return;
    }
    username = name;
    pass = sha256(prompt("Password"));
    console.log("Your hash:");
    console.log(sha256(pass + name));
}

var sha256 = function sha256(ascii) {
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
};

async function msgs() {
    var datas = {type:"msgs"};
    const options = {
        method:"POST",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(datas)
    }   
    const response = await fetch('/api', options);
    const json = await response.json();
    document.getElementById("chat").innerHTML = "<p>Chat:</p>" + json.data;
	console.log(json.data);
}

async function permMsgs() {
    var datas = {type:"permMsgs"};
    const options = {
        method:"POST",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(datas)
    }   
    const response = await fetch('/api', options);
    const json = await response.json();
    document.getElementById("permChat").innerHTML = "<p>Permanent Chat:</p>" + json.data;
	console.log(json.data);
}

function gene() {
	var name = prompt("Name");
    if (name.includes(";") | name.includes("$")) {
        alert("The name includes one or multiple illegal caracters!");
        setTimeout(() => {
            gene();
        }, 1000);
        return;
    }
	alert(sha256(sha256(prompt("Password")) + name) + "$" + name + ";");
}

msgs();
permMsgs();

function settings() {
	setHidden = !setHidden;
    visibility = 'visible'
    if (setHidden) {
        visibility = 'hidden'
    }
	document.getElementById("settings").style.visibility = visibility;
    document.getElementById("settings").hidden = setHidden;
}

function more() {
	setMHidden = !setMHidden;
    visibility = 'visible'
    if (setMHidden) {
        visibility = 'hidden'
    }
	document.getElementById("more").style.visibility = visibility;
    document.getElementById("more").hidden = setMHidden;
}

function showUpload(){
	setUHidden = !setUHidden;
    visibility = 'visible'
    if (setUHidden) {
        visibility = 'hidden';
    }
	document.getElementById("upload").style.visibility = visibility;
    document.getElementById("upload").hidden = setUHidden;
}


function resizeIframe(iframe) {
    iframe.height = iframe.contentWindow.document.documentElement.scrollHeight + "px";
  }
  
send("fst");

document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth*1.5 < window.innerHeight) {
        let elements = document.querySelectorAll('h1');
        elements.forEach(function(el) {
            style = el.style
            style.textAlign = 'center';
            style.transform = 'scale(3)';
        });

        elements = document.getElementsByClassName('button');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.transformOrigin = 'top left';
            elements[i].style.width = '40%';
            elements[i].style.height = '4em';
            elements[i].innerHTML = '<h2 >' + elements[i].innerHTML + '</h2>';
        }
    }
});
