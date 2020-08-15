function main() {
    window.addEventListener('message', function(event) {
        if (event.data.text.includes("pause")) {
            let position = event.data.text.split(",")[2]
            pause(parseInt(position))
            console.log(event)
        } else if (event.data.text.includes("play")) {
            let timeMinusPosition = event.data.text.split(",")[2]
            play(parseInt(timeMinusPosition))
            console.log(event)
        } else if (event.data.text.includes("seek")) {
            seek(event.data.text.slice(event.data.text.indexOf("seek") + 6, event.data.text.length))
            console.log(event)
        }
    });
    
    function pause() {
        const videoPlayer = netflix
        .appContext
        .state
        .playerApp
        .getAPI()
        .videoPlayer
        
        // Getting player id
        const playerSessionId = videoPlayer.getAllPlayerSessionIds()[0]
        
        const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId)
        player.pause()
    }
    
    
    function play() {
        const videoPlayer = netflix
        .appContext
        .state
        .playerApp
        .getAPI()
        .videoPlayer
        
        // Getting player id
        const playerSessionId = videoPlayer.getAllPlayerSessionIds()[0]
        
        const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId)
        player.play()
    }
    
    
    function seek(time) {
        const videoPlayer = netflix
        .appContext
        .state
        .playerApp
        .getAPI()
        .videoPlayer
        
        // Getting player id
        const playerSessionId = videoPlayer.getAllPlayerSessionIds()[0]
        const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId)
        player.seek(parseInt(time, 10) * 1000)
    }

    function getPosition() {
        const videoPlayer = netflix
        .appContext
        .state
        .playerApp
        .getAPI()
        .videoPlayer
        
        // Getting player id
        const playerSessionId = videoPlayer.getAllPlayerSessionIds()[0]
        const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId)
        player.getCurrentTime()
    }
    
}

var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ main +')();'));
(document.body || document.head || document.documentElement).appendChild(script);



chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {    
    if (message.message == "pause" || message.message == "play" || message.message.includes("seek")) {
        window.postMessage({ type: 'control',
        text: message.message},
        '*' /* targetOrigin: any */ );
    }
});