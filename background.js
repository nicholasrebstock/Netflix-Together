let ws
let openNetflixTabs = new Set()
function onNewUrl(tabId, changeInfo, tabInfo) {
    if (tabInfo.url.includes("netflix")) {
        chrome.pageAction.show(tabId)
        openNetflixTabs.add(tabId)
    }
    console.log(tabInfo.url)
}

function connectToSocket() {
    let HOST = "wss://quiet-meadow-89993.herokuapp.com/"
    ws = new WebSocket(HOST);
    
    console.log("connected started")
    
    ws.onmessage = (event) => {
        const messageFromServer = event.data.toString()
        if (messageFromServer == "ping") {
            console.log(messageFromServer)
        } else if (messageFromServer == "play" || messageFromServer == "pause" || messageFromServer.includes("seek")) {
            openNetflixTabs.forEach( tab => chrome.tabs.sendMessage(tab, {message: messageFromServer}) )
            console.log("asking controller to " + messageFromServer)
        }
    };
}


function disconnectFromSocket() {
    ws.close()
    console.log("connected closed")
}


function broadcastPause() {
    ws.send("pause")
    console.log("pause")
}


function broadcastPlay() {
    ws.send("play")
    console.log("play")
}


function broadcastSeek(time) {
    ws.send(time)
    console.log(time)
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {    
    if (message == "connect") {
        connectToSocket()
    } else if (message == "disconnect") {
        disconnectFromSocket()
    } else if (message == "broadcastpause") {
        broadcastPause()
    } else if (message == "broadcastplay") {
        broadcastPlay()
    } else if (message.includes("broadcastseek")) {
        broadcastSeek(message.slice(message.indexOf("broadcastseek") + 6, message.length))
    }
});

chrome.tabs.onUpdated.addListener(onNewUrl)