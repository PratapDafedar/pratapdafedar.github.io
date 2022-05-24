// HTML elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const localInfoBox = document.getElementById('localInfo');
const remoteInfoBox = document.getElementById('remoteInfo');
const chatBox = document.getElementById('chat');

const startButton = document.getElementById('start');
const listenButton = document.getElementById('listen');
const connectButton = document.getElementById('connect');
const sendButton = document.getElementById('send');

const logLabel = document.getElementById('log');
function log(message) {
  logLabel.textContent += message + "   <br/>";
  console.log(message);
}

const servers = {
  iceServers: [
    {
      urls: "stun:openrelay.metered.ca:80",
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

const lc = new RTCPeerConnection(servers);

startButton.onclick = async () => {
  
  const dc = lc.createDataChannel("channel");
  lc.dc = dc;

  dc.onmessage = e => log("msg: " + e.data);
  dc.onopen = e => {
    log("connection opened");
  }
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
      log("msg: " + e.data);
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
  lc.ondatachannel = e => {
    lc.dc = e.channel;
    lc.dc.onopen = e => log("local desc created successfully!")
    lc.dc.onmessage = e => {
      log("msg: " + e.data);
    }
  }
}


sendButton.onclick = async () => {
  var msg = chatBox.value;
  lc.dc.send(msg);
}

