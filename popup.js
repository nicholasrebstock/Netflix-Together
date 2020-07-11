document.getElementById("connect").addEventListener(("click"),function(){
    chrome.runtime.sendMessage("connect"); 
});

document.getElementById("disconnect").addEventListener(("click"),function(){
    chrome.runtime.sendMessage("disconnect"); 
});

document.getElementById("pause").addEventListener(("click"),function(){
    chrome.runtime.sendMessage("broadcastpause"); 
});

document.getElementById("play").addEventListener(("click"),function(){
    chrome.runtime.sendMessage("broadcastplay"); 
});

document.getElementById("seek").addEventListener(("click"),function(){
    let time = document.getElementById("seektime").value
    document.getElementById("seektime").value = ""
    chrome.runtime.sendMessage("broadcastseek: " + time); 
});