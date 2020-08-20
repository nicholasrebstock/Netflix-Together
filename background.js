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
let timeMinusPosition = 0

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
        // add listeners in content script
        openNetflixTabs.forEach( tab => chrome.tabs.sendMessage(tab, {message: "connect"}) )
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

            const messageFromServer = event.data.toString().split(",")
            let action = messageFromServer[0]
            let data = messageFromServer[1]
            // if it is pinging message
            if (action == "pong") {
                let num = parseInt(data)
                ping = Date.now() - pingTimes[num]
                console.log(ping)
            }
            
            // if it is a control broadcast message
            else if (action == "play") {
                
                data = (parseFloat(data) - timeCompensation).toString()
                // relay message to each netflix tab's content script
                openNetflixTabs.forEach( tab => chrome.tabs.sendMessage(tab, {message: `${action},${data}`}) )
                // log attempt
                console.log(`asking controller to ${action} at time-pos = ${data}`)
            } else if (action == "pause") {
                // relay message to each netflix tab's content script
                openNetflixTabs.forEach( tab => chrome.tabs.sendMessage(tab, {message: `${action},${data}`}) )
                // log attempt
                console.log(`asking controller to ${action} at pos = ${data}`)
            }
            // if it is welcome message
            else if (action == "welcome") {
                connectionId = data
                syncWithServer()
            } else if (action == "sync") {
                let num = messageFromServer[2]
                ping = Date.now() - pingTimes[parseInt(num)]
                let sTime = parseFloat(data) + ping/2
                let lTime = Date.now()
                
                timeCompensation = sTime - lTime
                // add to local time to get server time.
                console.log("Time compensation: " + timeCompensation.toString())
            }
        };

        // set pinger
        pingInterval = setInterval(() => {
            pingServer()
        }, 5000);
        
    }
}

// create ping function
function pingServer() {
    if (connectionId != '') {
        console.log("pinged")
        // ping with connection id and number
        ws.send(`${connectionId},ping,${pingNumber.toString()}`)
        pingTimes[pingNumber] = Date.now()
        pingNumber = (pingNumber + 1) % 20
    }
}

function syncWithServer() {
    // ping with connection id and number
    ws.send(`${connectionId},sync,${pingNumber.toString()}`)
    pingTimes[pingNumber] = Date.now()
    pingNumber = (pingNumber + 1) % 20
}

// self explanatory
function disconnectFromSocket() {
    ws.close()
    console.log("connection closed")
}

// send to server so server can relay to other clients
function broadcast(action, pos) {
    if (action == "play") {
        timeMinusPosition = Date.now() + timeCompensation - parseFloat(pos)
        console.log(Date.now())
        console.log(timeCompensation)
        console.log(parseFloat(pos))
        ws.send(`${connectionId},${action},${timeMinusPosition}`)
    } else if (action == "pause") {
        ws.send(`${connectionId},${action},${pos}`)
    }
}


// set listener so script can recieve information from other parts of the extension
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {    
    if (message == "connect") {
        connectToSocket()
    } else if (message.broadcastRequest) {
        broadcast(message.broadcastRequest[0], message.broadcastRequest[1])
    }
});

// set listener for tab url change
chrome.tabs.onUpdated.addListener(onNewUrl)