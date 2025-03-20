//@ts-nocheck
import {User} from "./user.js";
import { Canvas ,CanvasRenderingContext2D } from "canvas";
import * as mediasoup from 'mediasoup';
const mediaCodecs = [
    {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
    },
    {
        kind: "video",
        mimeType: "video/H264",
        clockRate: 90000,
        parameters: {
            "packetization-mode": 1,
            "profile-level-id": "42e01f",
            "level-asymmetry-allowed": 1,
        },
    },
];
export class Project {
    public user:User;
    public can:Canvas;
    public ctx:CanvasRenderingContext2D;
    public worker=[];
    public room :Map<string,{router:mediasoup.types.Router,peers:Set<User>}>=new Map<string,{router:mediasoup.types.Router,peers:Set<User>}>()
    public peer:Map<string,User>=new Map<string,User>()
    public transports:Map<User,[]>=new Map<User,[]>()
    public workers:mediasoup.types.Worker;
    public producer:Map<string,[]>=new Map<string,[]>()
    public mess:Map<string,[]>=new Map<string,[]>()
    constructor  (worker:mediasoup.types.Worker) {
      this.workers=worker
      console.log(this.workers)
    }
    public  draw(user:User){
        this.user = user;
        // const h=window.innerHeight;
        // const w=window.innerWidth;
        this.can = new Canvas(1920,1080);
        this.ctx=this.can.getContext('2d')
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.can.width, this.can.height);
        
        this.handle(user)
    }
    public async handle(user:User){

        user.socket.on('message', async (message:any)=>{
           const data=JSON.parse(message.toString());
            if(data.type=='canvas'){

                user.socket.send(JSON.stringify({type:'canvas-back',data:this.can.toBuffer()})
                )
            }
            if(data.type=='createroom'){
                 await this.createmeeting(data.create,user)
                const roomname=this.room.get(data.create);
                
                this.user.socket.send(JSON.stringify({type:'roomcreated',  rtpCapabilities: roomname!.router.rtpCapabilities}))
            }
            if(data.type=='joinroom'){
                await this.joinmeeting(data.create,user)
                const roomname=this.room.get(data.create);
                this.user.socket.send(JSON.stringify({type:'roomjoined',  rtpCapabilities: roomname!.router.rtpCapabilities}))

            }
            if(data.type=='webrtctransport'){
                const roomname=this.room.get(data.create)
                console.log(data)
                await this.transportcreate(data.create,user,data)
            }
            if(data.type=='connect-transport'){
                this.connectransport(user,data)
            }
            if(data.type=='produce-transport'){
              this.transportproduce(user,data)
            }
            if(data.type=='consume'){
               // console.log('consumeconsumeconsumeconsume')
              this.transportconsume(user,data)
            }
        })
    }
    public async createmeeting(word:string,user:User){
       
        if(!this.room.has(word)){
           
        const router=await this.workers.createRouter({mediaCodecs});
        //console.log(this.user,"hiiiiiiiiiiiiiiiiii",router)
        this.room.set(word,{router,peers:new Set()})
        }
       this.room.get(word)!.peers.add(user);
    }
    public async joinmeeting(word:string,user:User){
        if(!this.room.has(word))
            return ;
        //@ts-ignore
        this.room.get(word)!.peers.add(user);
    }
    public async createwebrtctransport(router:mediasoup.types.Router,user:User){
         const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        enableSctp: true
    });
    console.log(`Transport created with ID: ${transport.id}`);
    return transport;
    }
    public async transportcreate(word:string,user:User,message: { consumer: any; create: any; }){
       if(!this.room.has(word)){
        return ;
       }
       const router=this.room.get(word)!.router;
     const transport =await this.createwebrtctransport(router);
     this.user.socket.send(JSON.stringify({
        type: 'transportcreated',
        params:{
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
        },
        consumer:message.consumer,
        create:message.create
     }))
    // console.log(message.consumer,transport.id)
     if(this.transports.has(user)){
        this.transports.get(user)!.push(transport)
     }
     else
     this.transports.set(user,[transport])
    // console.log(this.transports.get(user).length)
    }
    public async connectransport(user:User,data){
        const {dtlsParameters,transportId}=data;
        //console.log("asdfafdskkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
        //console.log(data)
        let transport
        const arr=this.transports.get(user)!;
        arr.forEach((letter)=>{
            if(letter.id===transportId){
                transport=letter;
            }
        })
        //console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwconnect",transport.id,transportId)
        await transport.connect({dtlsParameters})
        user.socket.send(JSON.stringify({
            type: "transportconnected",
            params:data.params,
            transportId:transportId
        })
        )
    }
    public async transportproduce(user:User,data:{kind:string,rtpParameters:any,params:any,transportId:string,create:string}){
        const {kind, rtpParameters, params,transportId}=data; 
        const arr=this.transports.get(user)!;
        let transport
        arr.forEach((letter)=>{
            if(letter.id===transportId){
                transport=letter;
            }
        })
        const newproducer=  await  transport.produce({kind, rtpParameters})
       // console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwproduce",transport.id,transportId)
        user.socket.send(JSON.stringify({
            type: "producerconnected",
            producerId:newproducer.id,
            kind:kind,
            rtpParameters:rtpParameters,
            transportId:transportId
        })
        )
        const part=this.room.get(data.create)!.peers
        part.forEach((person)=>{
            console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",person.name)
            person.socket.send(JSON.stringify({
                type: "newproducer",
                producerId:newproducer.id,
                kind:kind,
                rtpParameters:rtpParameters,
                transportId:transportId,
                create:data.create
            }))
        })
      

        if(!this.producer.has(data.create))
        {
            this.producer.set(data.create,[newproducer])
        }
        else{
            this.producer.get(data.create)!.push(newproducer)
    }
    const arr2=this.producer.get(data.create)!;
   // console.log("asdfasdfasdfwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwqwefghjkjhgfdsadfghnmnhgfdszzx",arr2,data.create)
}
    public async transportconsume(user:User,data){
        const {paused,rtpParameters,transportId}=data;
       // console.log("transportconsume")
       // console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",data)
        const arr=this.transports.get(user)!;
        if(data.from)
            console.log(data.from)
        let transport
        arr.forEach((letter)=>{
            console.log(transportId,letter.id)
            if(letter.id===transportId){
                transport=letter;
            }
        })
        const arr2=this.producer.get(data.create)!;
        console.log(arr2)
        if(!arr2)
            return ;
        //console.log("asdfasdfasdfwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwqwefghjkjhgfdsadfghnmnhgfdszzxconsume",transportId,transport,data.create)
        for (const producer of arr2) {
            try {
                const consumer = await transport.consume({
                    producerId: producer.id,
                    rtpCapabilities: rtpParameters,
                    paused
                });
               // console.log('done be wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwtttttttttttttttttttttttt' producer)
                user.socket.send(JSON.stringify({
                    type: "consumercreated",
                    id: consumer.id,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    producerId: producer.id,
                    transportId: transportId,
                    consumerId: consumer.id
                }));
            } catch (err) {
                console.error(`Failed to create consumer for producer ${producer.id}:`, err);
            }
        }
    }
    
}