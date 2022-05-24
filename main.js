// HTML elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const localInfoBox = document.getElementById('localInfo');
const remoteInfoBox = document.getElementById('remoteInfo');

const startButton = document.getElementById('start');
const listenButton = document.getElementById('listen');
const connectButton = document.getElementById('connect');

const logLabel = document.getElementById('log');
function log(message) {
  logLabel.textContent += message + "   <br/>";
  console.log(message);
}

const servers = {
  iceServers: [
    {
      //urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302', 'stun:stun.gmx.net:3478', 'stun:stun.l.google.com:19302', 'stun:stun3.l.google.com:19302', 'stun:openrelay.metered.ca:80'],
      urls: ['stun:stun1.l.google.com:19302', 'stun:openrelay.metered.ca:80'],
    },
  ],
  iceCandidatePoolSize: 10,
};

const lc = new RTCPeerConnection(servers);

startButton.onclick = async () => {
  
  const dc = lc.createDataChannel("channel");
  dc.onmessage = e => log("received" + e.data);
  dc.onopen = e => log("connection opened");
  lc.onicecandidate = e => {
    var newCandidate = JSON.stringify(lc.localDescription);
    localInfoBox.value = newCandidate;
  }
  lc.createOffer()
    .then(o => lc.setLocalDescription(o))
    .then(a=> log("local desc created successfully!"));

};


listenButton.onclick = async () => {
  
  lc.onicecandidate = e => {
    var newCandidate = JSON.stringify(lc.localDescription);
    localInfoBox.value = newCandidate;
  }
  lc.ondatachannel = e => {
    lc.dc = e.channel;
    lc.dc.onopen = e => log("local desc created successfully!")
    lc.dc.onmessage = e => {
      console.log("new message from client: " + e.data);
    }
  }
  
  var offer = JSON.parse(remoteInfoBox.value);
  lc.setRemoteDescription(offer).then(a => log("offer set!"))
  
  lc.createAnswer()
  .then(a => lc.setLocalDescription(a))
  .then(a => {
    log("answer created!")
  }); 
}


connectButton.onclick = async () => {
  var answer = JSON.parse(remoteInfoBox.value);
  lc.setRemoteDescription(answer);
}
