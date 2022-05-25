// HTML elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

const serverBox = document.getElementById('servers');
const localInfoBox = document.getElementById('localInfo');
const remoteInfoBox = document.getElementById('remoteInfo');
const chatBox = document.getElementById('chat');

const initButton = document.getElementById('init');
const startButton = document.getElementById('start');
const listenButton = document.getElementById('listen');
const connectButton = document.getElementById('connect');
const sendButton = document.getElementById('send');

const logLabel = document.getElementById('log');
function log(message) {
  logLabel.value += message + " \n";
  console.log(message);
}

let servers = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turns:staticauth.openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    }
  ],
  iceCandidatePoolSize: 10,
};

let lc = new RTCPeerConnection(servers);

serverBox.value = JSON.stringify(servers, null, 2);
initButton.onclick = async () => {
  try {
    servers = JSON.parse(serverBox.value);
    lc = new RTCPeerConnection(servers);
    log("Initialized");
  } catch (e) {
    log("Error: " + e);
  }
};

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

