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
       return video;
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
    useEffect(()=>{
        const handletransport=async()=>{
        if(!message)
            return ;
       if(message.type=='roomcreated'||message.type=='roomjoined'){
           const dev=new Device();
           await dev.load({ routerRtpCapabilities: message.rtpCapabilities })
           setdevice(dev)
           console.log('asdfasdfasdfsdfasdfasdfsadfa this is the we are looking for now ',pass.create)
           sendmessage({type:'webrtctransport',consumer:'sender',create:pass.create})
           sendmessage({type:'webrtctransport',consumer:'recevier',create:pass.create})
       }
       if(message.type=='transportcreated'){
         if(message.consumer=='sender'){
            console.log(message)
            const producertransport=device.createSendTransport(message.params);
            producertransport.on('connect',async ({dtlsParameters},callback,reject)=>{
                sendmessage({type:'connect-transport',consumer:message.consumer,transportId:producertransport.id,dtlsParameters:dtlsParameters,params:message.params,create:message.create})
                callback()
            })
            producertransport.on('produce',async ({kind,rtpParameters},callback,reject)=>{
                sendmessage({type:'produce-transport',consumer:message.consumer,transportId:producertransport.id,kind:kind,rtpParameters:rtpParameters,params:message.params,create:message.create})
                callback({id:message.id})
            })
            
            const tracks=await getvideo()
            
            tracks.getTracks().forEach(async (track)=>{
              await    producertransport.produce({track})
            })
            

         }
         else if(message.consumer=='recevier'){
                                           //createRecvTransport(message.params)
            const consumertransport=device.createRecvTransport(message.params)
            consumertransport.on('connect',async ({dtlsParameters},callback,reject)=>{
                sendmessage({type:'connect-transport',consumer:message.consumer,transportId:consumertransport.id,dtlsParameters:dtlsParameters,params:message.params,create:message.create})
                callback()
            })
            transportref.current.push({
                id:consumertransport.id,
                transport:consumertransport,
                consumer:message.consumer
            })
            console.log("aasdfasdfasdfasdfasdfasdf")
              sendmessage({
                type:'consume',
                rtpParameters:device.rtpCapabilities,
                transportId:consumertransport.id,
                paused:true,
                create:message.create
              })
         }
       }
       if(message.type=='consumercreated'){
        console.log("sushma")
           const transportdata=transportref.current.find((transport)=>transport.id===message.transportId)
          const recvtransport=await transportdata.transport.consume({
            id:message.id,
            producerId:message.producerId,
            
            kind:message.kind,
            rtpParameters:message.rtpParameters,
            transportId:message.transportId,
          })
          const stream=new MediaStream()
          stream.addTrack(recvtransport.track)
          console.log(stream.getTracks())
          console.log(message.producerId,stream.getTracks())
          if(videoref.current.has(message.producerId))
            console.log("asjldkffffffffffffffffffffffffffffffffffakdjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")
          videoref.current.set(message.producerId,stream)
          setwatch(prevmap=>new Map(prevmap.set(message.producerId,stream)))
          setword(word+1)
          console.log(videoref.current)
       }
       if(message.type=='newproducer'){
         const t=transportref.current[0];
         console.log('thisiissssssssssssssssssssssssssssssss',message,t,transportref.current)
         sendmessage({
            type:'consume',
            rtpParameters:device.rtpCapabilities,
            transportId:t.id,
            paused:false,
            create:message.create,
            from:"thissssssssss"
          })
       }
    }
    handletransport()
    },[socket,message])
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