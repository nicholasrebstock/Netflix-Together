document.getElementById("connect").addEventListener(("click"),function(){
    chrome.runtime.sendMessage("connect"); 
});

document.getElementById("disconnect").addEventListener(("click"),function(){
    chrome.runtime.sendMessage("disconnect"); 
});
