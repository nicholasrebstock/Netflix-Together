// create global webserver variable
let ws

// store of all netflix tab ids in set
let openNetflixTabs = new Set()

// stores ping times
let pingTimes = []

// lets extension know which ping happened when
let pingNumber = 0

// reference to setInterval object
let pingInterval

let ping = 0

// how server identifies this client
let connectionId = ''

let timeCompensation = 0

// activate button for any new url that matches pattern
function onNewUrl(tabId, changeInfo, tabInfo) {
    if (tabInfo.url.includes("netflix")) {
        chrome.pageAction.show(tabId)
        openNetflixTabs.add(tabId)
    }
}


// function called by connect button
function connectToSocket() {
    // connect only if currently not connected
    if (connectionId == '') {
        
        // connect
        let HOST = "wss://quiet-meadow-89993.herokuapp.com/"
        ws = new WebSocket(HOST);
        // log connection
        console.log("connected started")
        
        // set listener for when connection is closed
        ws.onclose = (event) => {
            // remove id
            connectionId = ''
            // stop pinging
            clearInterval(pingInterval)
            // log in browser
            console.log("connected ID reset")
        };

        // define response to server messages
        ws.onmessage = (event) => {

            const messageFromServer = event.data.toString()
            
            // if it is pinging message
            if (messageFromServer.includes("pong")) {
                let num = parseInt(messageFromServer.split(',')[1])
                ping = Date.now() - pingTimes[num]
                console.log(ping)
            }
            
            // if it is a control broadcast message
            else if (messageFromServer == "play" || messageFromServer == "pause" || messageFromServer.includes("seek")) {
                // relay message to each netflix tab's content script
                openNetflixTabs.forEach( tab => chrome.tabs.sendMessage(tab, {message: messageFromServer}) )
                // log attempt
                console.log("asking controller to " + messageFromServer)
            }

            // if it is welcome message
            else if (messageFromServer.includes("welcome")) {
                let data = messageFromServer.split(",")
                // get id from message
                connectionId = data[1]
                syncWithServer()
            } else if (messageFromServer.includes("sync")) {
                let num = parseInt(messageFromServer.split(',')[1])
                ping = Date.now() - pingTimes[num]
                let sTime = messageFromServer.split(',')[2] - ping/2
                let lTime = Date.now() - ping/2
                
                timeCompensation = sTime - lTime
                // add to local time to get server time.
                console.log("Time compensation: " + timeCompensation.toString())
            }
        };
        
        // set pinger
        pingInterval = setInterval(() => {
            pingServer()
        }, 1000);
        
    }
}


// create ping function
function pingServer() {
    if (connectionId != '') {
        console.log("pinged")
        // ping with connection id and number
        ws.send("ping," + connectionId + "," + pingNumber.toString())
        pingTimes[pingNumber] = Date.now()
        pingNumber = (pingNumber + 1) % 20
    }
}

function syncWithServer() {
    // ping with connection id and number
    ws.send("sync," + connectionId + "," + pingNumber.toString())
    pingTimes[pingNumber] = Date.now()
    pingNumber = (pingNumber + 1) % 20
}

// self explanatory
function disconnectFromSocket() {
    ws.close()
    console.log("connected closed")
}

// TODO: replace with one function "broadcast(message)" and use enum or something 

// send to server so server can relay to other clients
function broadcastPause() {
    ws.send("pause")
    console.log("pause")
}

// send to server so server can relay to other clients
function broadcastPlay() {
    ws.send("play")
    console.log("play")
}

// send to server so server can relay to other clients
function broadcastSeek(time) {
    ws.send(time)
    console.log(time)
}


// set listener so script can recieve information from other parts of the extension
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

// set listener for tab url change
chrome.tabs.onUpdated.addListener(onNewUrl)