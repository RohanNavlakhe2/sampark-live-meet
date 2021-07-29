const socket = io()
var peer = new Peer(/*undefined,{
   path:'/peerjs',host:'localhost',port:9000 //443
}*/)

const $videoContainer = document.querySelector('#video-grid')
let myVideoStream

navigator.mediaDevices
    .getUserMedia({video: true/*, audio: true*/})
    .then((stream) => {
        myVideoStream = stream
        /*const newVideoElement = document.createElement('video')
        newVideoElement.style.margin = '20px'*/
        initVideoStream(stream,prepareVideoElement())

        //Provide your own stream if you're a new joiner (when someone calls for your stream)
        peer.on('call', function(call) {
            console.log('Got call for stream : ',call.message)
            call.answer(stream); // Answer the call with an A/V stream.
           /* const newVideoElement = document.createElement('video')
            newVideoElement.style.margin = '20px'*/
            const videoElement = prepareVideoElement()
            call.on('stream', function(remoteStream) {
                console.log('call.on(stream) 1: ',remoteStream)
                //const newVideoElement = document.createElement('video')
                // Show stream in some video/canvas element.
                initVideoStream(remoteStream,videoElement)
            });
        });

        //Get stream from new joiner
        socket.on('message',(newJoinerId) => {
            console.log("A user has joined the conference : ",newJoinerId)
            var call = peer.call(newJoinerId,stream);
           /* const newVideoElement = document.createElement('video')
            newVideoElement.style.margin = '20px'*/
            const videoElement = prepareVideoElement()
            call.on('stream', function(remoteStream) {
                console.log('call.on(stream) 2: ',remoteStream)
                //const newVideoElement = document.createElement('video')
                // Show stream in some video/canvas element.
                initVideoStream(remoteStream,videoElement)
            });
        })
    })




peer.on('open',(peerId) => {
    socket.emit('new-user',peerId)
})

const initVideoStream = (stream, video) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    $videoContainer.append(video)
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const prepareVideoElement = () => {
    const newVideoElement = document.createElement('video')
    newVideoElement.style.margin = '20px'
    newVideoElement.style.width = '300px'
    newVideoElement.style.height = '300px'
    return newVideoElement
}

