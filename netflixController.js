function main() {

    // controller are handled here
    window.addEventListener('message', function(event) {
        
        if (event.data.text != null) {
            let message = event.data.text.split(",")
            let action = message[0]
            let data = message[1]
            if (action == "pause") {
                console.log("told to pause " + data)
                pause(parseFloat(data))
                console.log(event)
            } else if (action == "play") {
                console.log("told to unpause " + data)
                play(parseFloat(data))
                console.log(event)
            }
        }
    });
    

    // helper functions
    function getNetflixPlayer() {
        const videoPlayer = netflix
        .appContext
        .state
        .playerApp
        .getAPI()
        .videoPlayer
        
        // Getting player id
        const playerSessionId = videoPlayer.getAllPlayerSessionIds()[0]
        
        return videoPlayer.getVideoPlayerBySessionId(playerSessionId)
    }

    function pause(position) {
        // pause, seek
        const player = getNetflixPlayer()
        player.pause()
        player.seek(position * 1000)
        console.log(position * 1000)
    }
    
    function play(timePositionConstant) {
        // seek, play after timeout to sync
        const player = getNetflixPlayer()
        player.play()
    }

}

// for injecting above into page
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ main +')()'));
(document.body || document.head || document.documentElement).appendChild(script);

let video

// receive messages from bg script and respond
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {    
    let mes = message.message.split(",")
    let action = mes[0]
    let data = mes[1]
    console.log(`${action}: ${data}`)
    if (action == "pause" || action == "play") {
        window.postMessage({ type: 'control', text: `${action},${data}`}, '*' /* targetOrigin: any */ );
    } else if (action == "connect") {
        console.log("Netflix Controller: Connected and Initialized")
        
        video = document.querySelector('video');

        video.addEventListener('pause', (event) => {
            console.log("local paused");
            setTimeout(userPaused, 10)
        });
        video.addEventListener('play', (event) => {
            console.log("local unpaused");
            setTimeout(userUnpaused, 10)
        });
    } 
});

function userPaused() {
    let pos = video.currentTime
    chrome.runtime.sendMessage({broadcastRequest: ["pause", pos]});
}

function userUnpaused() {
    let pos = video.currentTime
    chrome.runtime.sendMessage({broadcastRequest: ["play", pos]});
}
