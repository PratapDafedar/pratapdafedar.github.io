
const servers = {
  iceServers: [
    {
      //urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302', 'stun:stun.gmx.net:3478', 'stun:stun.l.google.com:19302', 'stun:stun3.l.google.com:19302', 'stun:openrelay.metered.ca:80'],
      urls: ['stun:stun1.l.google.com:19302', 'stun:openrelay.metered.ca:80'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global State
const pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;

let localData = null;
let remoteData = null;

// HTML elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const localInfoBox = document.getElementById('localInfo');
const remoteInfoBox = document.getElementById('remoteInfo');
const startButton = document.getElementById('start');
const connectButton = document.getElementById('connect');
const logLabel = document.getElementById('log');

// 1. Setup media sources
startButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
  remoteStream = new MediaStream();

  localVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  // Push tracks from local stream to peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Pull tracks from remote stream, add to video stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  
  // Get candidates for caller, save to db
  pc.onicecandidate = (event) => {
    if(event.candidate != null)
    {
      localData = event.candidate.toJSON();
      localInfoBox.value += JSON.stringify(localData);
    }
  };
  
  // Create offer
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);
  
  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };


  connectButton.disabled = false;
};


  
//   //await callDoc.set({ offer });
//   await setDoc(callDoc, offer, { merge: true });

//   // Listen for remote answer
//   callDoc.onSnapshot((snapshot) => {
//     const data = snapshot.data();
//     if (!pc.currentRemoteDescription && data?.answer) {
//       const answerDescription = new RTCSessionDescription(data.answer);
//       pc.setRemoteDescription(answerDescription);
//     }
//   });

//   // When answered, add candidate to peer connection
//   answerCandidates.onSnapshot((snapshot) => {
//     snapshot.docChanges().forEach((change) => {
//       if (change.type === 'added') {
//         const candidate = new RTCIceCandidate(change.doc.data());
//         pc.addIceCandidate(candidate);
//       }
//     });
//   });

//   hangupButton.disabled = false;
// };

// // 3. Answer the call with the unique ID
// answerButton.onclick = async () => {
//   const callId = callInput.value;
//   const callDoc = firestore.collection('calls').doc(callId);
//   const answerCandidates = callDoc.collection('answerCandidates');
//   const offerCandidates = callDoc.collection('offerCandidates');

//   pc.onicecandidate = (event) => {
//     event.candidate && answerCandidates.add(event.candidate.toJSON());
//   };

//   const callData = (await callDoc.get()).data();

//   const offerDescription = callData.offer;
//   await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

//   const answerDescription = await pc.createAnswer();
//   await pc.setLocalDescription(answerDescription);

//   const answer = {
//     type: answerDescription.type,
//     sdp: answerDescription.sdp,
//   };

//   await callDoc.update({ answer });

//   offerCandidates.onSnapshot((snapshot) => {
//     snapshot.docChanges().forEach((change) => {
//       console.log(change);
//       if (change.type === 'added') {
//         let data = change.doc.data();
//         pc.addIceCandidate(new RTCIceCandidate(data));
//       }
//     });
//   });
// };
