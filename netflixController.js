function main() {
  console.log("it worked")

    window.addEventListener('message', function(event) {
    console.log(event)
    if (event.data.text == "pause") {
      pause()
    } else if (event.data.text == "play") {
      play()
    } else if (event.data.text.includes("seek")) {
      seek(event.data.text.slice(event.data.text.indexOf("seek") + 6, event.data.text.length))
    }
  });

  function pause() {
      console.log("pausing...")
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
      player.seek(parseInt(time, 10) * 1000)
  }

}

var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ main +')();'));
(document.body || document.head || document.documentElement).appendChild(script);


  
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {    
  if (message.message == "pause") {
    window.postMessage({ type: 'control',
                       text: 'pause'},
                     '*' /* targetOrigin: any */ );
  } else if (message.message == "play") {
    window.postMessage({ type: 'control',
                       text: 'play'},
                     '*' /* targetOrigin: any */ );
  } else if (message.includes("seek")) {
    window.postMessage({ type: 'control',
                       text: message.slice(message.indexOf("seek") + 6, message.length)},
                     '*' /* targetOrigin: any */ );
  }
});