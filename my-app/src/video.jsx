import { UseSocket } from "./usestate";
import React, { useEffect, useRef, useState ,useMemo} from "react";
import { Device } from "mediasoup-client";

const Video=React.memo(({pass})=>{
    const { socket, sendmessage, message } = UseSocket();
    const [transport,setransport]=useState();
    const [word,setword]=useState(0)
    const videoref=useRef(new Map());
    const [device,setdevice]=useState();
    const transportref=useRef([]);
    const [watch,setwatch]=useState(new Map());
    const ownref=useRef();
    const getvideo=async ()=>{
       const video= await navigator.mediaDevices.getUserMedia({ video: true })
       return {video};
    }
    const getscreen=async()=>{
      console.log("screen")
      const screen=await navigator.mediaDevices.getDisplayMedia({video:true})
      return {screen}
    }
    useEffect(()=>{
        if(!socket)
            return ;

        if(pass.type=='createroom'){
            console.log(pass)
            sendmessage(pass)
        }
        if(pass.type=='joinroom'){

            sendmessage(pass)

        }
    },[pass,socket])
    // This function handles new messages when they arrive
    const handleNewMessage = async (msg) => {
        if(!msg)
            return;

        console.log('New message received:', msg.type);

        if(msg.type=='roomcreated'||msg.type=='roomjoined'){
            const dev=new Device();
            await dev.load({ routerRtpCapabilities: msg.rtpCapabilities })
            setdevice(dev)
            console.log('Room created/joined, setting up transports for:', pass.create)
            sendmessage({type:'webrtctransport',consumer:'sender',create:pass.create})
            sendmessage({type:'webrtctransport',consumer:'recevier',create:pass.create})
        }
        if(msg.type=='transportcreated'){
            if(msg.consumer=='sender'){
                console.log('Sender transport created')
                const producertransport=device.createSendTransport(msg.params);
                producertransport.on('connect',async ({dtlsParameters},callback,reject)=>{
                    sendmessage({type:'connect-transport',consumer:msg.consumer,transportId:producertransport.id,dtlsParameters:dtlsParameters,params:msg.params,create:msg.create})
                    callback()
                })
                producertransport.on('produce',async ({kind,rtpParameters},callback,reject)=>{
                    sendmessage({type:'produce-transport',consumer:msg.consumer,transportId:producertransport.id,kind:kind,rtpParameters:rtpParameters,params:msg.params,create:msg.create})
                    callback({id:msg.id})
                })
                const {video}=await getvideo()
                video.getTracks().forEach(async (track)=>{
                    await producertransport.produce({track})
                })
                if(pass.screen){
                    console.log("Setting up screen sharing")
                    const {screen}=await getscreen()
                    screen.getTracks().forEach(async (track)=>{
                        await producertransport.produce({track})
                    })
                }
            }
            else if(msg.consumer=='recevier'){
                console.log('Receiver transport created')
                const consumertransport=device.createRecvTransport(msg.params)
                consumertransport.on('connect',async ({dtlsParameters},callback,reject)=>{
                    sendmessage({type:'connect-transport',consumer:msg.consumer,transportId:consumertransport.id,dtlsParameters:dtlsParameters,params:msg.params,create:msg.create})
                    callback()
                })
                transportref.current.push({
                    id:consumertransport.id,
                    transport:consumertransport,
                    consumer:msg.consumer
                })
                console.log("Setting up consumer transport")
                sendmessage({
                    type:'consume',
                    rtpParameters:device.rtpCapabilities,
                    transportId:consumertransport.id,
                    paused:true,
                    create:msg.create
                })
            }
        }
        if(msg.type=='consumercreated'){
            console.log("Consumer created, setting up video stream")
            const transportdata=transportref.current.find((transport)=>transport.id===msg.transportId)
            const recvtransport=await transportdata.transport.consume({
                id:msg.id,
                producerId:msg.producerId,
                kind:msg.kind,
                rtpParameters:msg.rtpParameters,
                transportId:msg.transportId,
            })
            const stream=new MediaStream()
            stream.addTrack(recvtransport.track)
            console.log('Stream tracks:', stream.getTracks())
            console.log('Producer ID:', msg.producerId)
            if(videoref.current.has(msg.producerId))
                console.log("Producer ID already exists in video references")
            videoref.current.set(msg.producerId,stream)
            setwatch(prevmap=>new Map(prevmap.set(msg.producerId,stream)))
            setword(word+1)
            console.log('Updated video references:', videoref.current)
        }
        if(msg.type=='newproducer'){
            console.log('New producer detected:', msg)
            const t=transportref.current[0];
            console.log('Using transport:', t)
            sendmessage({
                type:'consume',
                rtpParameters:device.rtpCapabilities,
                transportId:t.id,
                paused:false,
                create:msg.create,
                from:"new-producer-handler"
            })
        }
    };

    // This useEffect runs whenever a new message arrives
    useEffect(()=>{
        if (message) {
            handleNewMessage(message);
        }
    },[socket, message])
    const handlePlay = () => {
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        video.play().catch((error) => console.error("Play failed:", error));
      });
    };
    const handlecustom=async ()=>{
      console.log("adfsasdfasfd")
       const track=await getvideo()
       ownref.current.srcObject=track;
       console.log("Stream Tracks:", track.getTracks());
       await ownref.current.play();

    }
    const renderVideo = (key, stream) => {
      return (
          <video
              key={key}
              ref={(el) => {
                  if (!el || !stream || el.srcObject === stream) return;

                  el.srcObject = stream;

                  // Detailed logging for video track and playback
                  console.log("Stream received:", stream);
                  const tracks = stream.getTracks();
                  console.log("Stream Tracks:", tracks);

                  tracks.forEach(track => {
                      console.log(`Track Details:
                          - Kind: ${track.kind}
                          - Enabled: ${track.enabled}
                          - Muted: ${track.muted}
                          - Ready State: ${track.readyState}
                      `);
                  });

                  el.onloadedmetadata = async () => {
                      console.log("Metadata loaded, attempting to play...");
                      try {
                          await el.play().then(console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaVideo playing successfully"));
                          //console.log("Video playing successfully");
                      } catch (error) {
                          console.error("Detailed Play Error:", {
                              name: error.name,
                              message: error.message,
                              stack: error.stack
                          });

                          // Check browser autoplay policies
                          if (error.name === 'NotAllowedError') {
                              console.warn("Autoplay blocked. User interaction might be required.");
                          }
                      }
                  };
              }}
              autoPlay
              playsInline
              muted
              style={{
                  width: 300,
                  height: 200,
                  borderRadius: "10px",
                  border: "2px solid #ccc",
                  background: "#000",
              }}
          />
      );
  };

   return (
    <div>
       <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
  {Array.from(watch.entries()).map(([key, stream]) => (
   <video
   key={key}
   ref={(el) => {
     if (!el) return;

     el.srcObject = stream;
     console.log(`Setting srcObject for key ${key}:`, stream);

     const tracks = stream.getVideoTracks();
     tracks.forEach((track) => {
       console.log(`Track for key ${key} - Kind: ${track.kind}, Enabled: ${track.enabled}, ReadyState: ${track.readyState}`);
     });

     el.onloadedmetadata = () => {
       console.log(`Metadata loaded for key ${key}, trying to play...`);
       el.play()
         .then(() => console.log(`Video playing successfully for key ${key}`))
         .catch((error) => {
           console.error(`Play failed for key ${key}:`, error);
           if (error.name === "NotAllowedError") {
             console.warn("Autoplay blocked. User interaction may be required.");
           }
         });
     };
   }}
   autoPlay
   playsInline
   controls
   muted
   style={{
     width: 300,
     height: 200,
     borderRadius: "10px",
     border: "2px solid #ccc",
     background: "#000",
   }}
 />

  ))}
</div>
<button onClick={handlePlay} className="bg-red-500">Start Video Playback</button>

    </div>
   )
})
Video.displayName='Video'
export default Video
//// Download the helper library from https://www.twilio.com/docs/node/install
// const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

// // Find your Account SID and Auth Token at twilio.com/console
// // and set the environment variables. See http://twil.io/secure
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);

// async function createToken() {
//   const token = await client.tokens.create();

//   console.log(token.accountSid);
// }

// createToken();