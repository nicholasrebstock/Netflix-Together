document.addEventListener("DOMContentLoaded", setup)

let connected

let mSwitch = document.getElementById("onOffButton")
let mStatus = document.getElementById("connectionStatus")
let mValue = document.getElementById("pingValue")

mSwitch.addEventListener("click", function() {
    if (connected) {
        chrome.runtime.sendMessage("disconnect");
    } else {
        chrome.runtime.sendMessage("connect");
    }
})

function setup() {
    chrome.runtime.sendMessage("setupPopup");
}



chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {    
    let mes = message.toString().split(",")
    console.log(mes[0])
    if (mes[0] == "pingValue") {
        mValue.innerText = `ping: ${mes[1]}`;
    } else if (mes[0] == "connectionChange") {
        console.log(mes[1])
        if (mes[1] == "connected") {
            mSwitch.src = "on.png"
            connected = true
        } else {
            mSwitch.src = "off.png"
            mValue.innerText = ""
            connected = false
        }
        mStatus.innerText = `Status: ${mes[1]}`;
    }
});