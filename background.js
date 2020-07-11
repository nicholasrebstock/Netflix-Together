let ws

function onNewUrl(tabId, changeInfo, tabInfo) {
  if (tabInfo.url.includes("netflix")) {
    chrome.pageAction.show(tabId)
  }
  console.log(tabInfo.url)
}

function connectToSocket() {
  let HOST = "wss://quiet-meadow-89993.herokuapp.com/"

  ws = new WebSocket(HOST);
  console.log("connected started")
  ws.onmessage = (event) => {
    if (event.data.toString() == "play") {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "play"});
      });
      console.log("asking controller to play")
    } else if (event.data.toString() == "pause") {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "pause"});
      });
      console.log("asking controller to pause")
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
  ws.sendMessage(time)
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
    broadcastSeek(message.slice(message.indexOf("broadcastseek") + 15, message.length))
  }
});

chrome.tabs.onUpdated.addListener(onNewUrl)