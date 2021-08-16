const socket = io()
var peer = new Peer(/*undefined,{
   path:'/peerjs',host:'localhost',port:9000 //443
}*/)

const $videoContainer = document.querySelector('#video-grid')
let myStreamToPassToRemote
let localStream


navigator.mediaDevices
    .getUserMedia({video: true, audio: true})
    .then((stream) => {
        myStreamToPassToRemote = stream
        /*const */localStream = stream.clone()

        //making local stream audio and video disabled
        //local stream is used to show user his/her own video preview
        //so for local stream audio will always be off otherwise we will hear our own voice
        //and video state of local stream will be same as remote stream (which we're
        //passing to other users).Means if user clicks of start video  btn
        // then user will be able to see his/her preview

        localStream.getAudioTracks()[0].enabled = false;
        localStream.getVideoTracks()[0].enabled = false;
        initVideoStream(localStream,prepareVideoElement())

        //mute the audio and stop the video (means other users neither hear your voice not see you)
        mute()
        stopVideo()
        //initVideoStream(localStream,prepareVideoElement())

        //Provide your own stream if you're a new joiner (when someone calls for your stream)
        peer.on('call', function(call) {
            console.log('Got call for stream : ',call.message)
            //stopVideo()
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
            const videoElement = prepareVideoElement()
            call.on('stream', function(remoteStream) {
                console.log('call.on(stream) 2: ',remoteStream)
                // Show stream in some video/canvas element.
                initVideoStream(remoteStream,videoElement)
            });
        })
    })




peer.on('open',(peerId) => {
    socket.emit('new-user',peerId,room)
})

const initVideoStream = (stream, video) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    $videoContainer.append(video)
}

const removeParticipantsVideoOnLeft = () => {

}

const muteUnmute = () => {
    const enabled = myStreamToPassToRemote.getAudioTracks()[0].enabled;
    if (enabled) {
        myStreamToPassToRemote.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myStreamToPassToRemote.getAudioTracks()[0].enabled = true;
    }
}

const mute = () => {
    const enabled = myStreamToPassToRemote.getAudioTracks()[0].enabled;
    if (enabled) {
        myStreamToPassToRemote.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
}

const playStop = () => {
    //console.log('object')
    let enabled = myStreamToPassToRemote.getVideoTracks()[0].enabled;
    if (enabled) {
        myStreamToPassToRemote.getVideoTracks()[0].enabled = false;
        localStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myStreamToPassToRemote.getVideoTracks()[0].enabled = true;
        localStream.getVideoTracks()[0].enabled = true;
    }
}

const stopVideo = () => {
    let enabled = myStreamToPassToRemote.getVideoTracks()[0].enabled;
    if (enabled) {
        myStreamToPassToRemote.getVideoTracks()[0].enabled = false;
        setPlayVideo()
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

const prepareVideoElement = () => document.createElement('video')

