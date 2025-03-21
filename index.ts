//@ts-nocheck
import { WebSocketServer, WebSocket } from "ws";
import { createCanvas, loadImage } from "canvas";
import {User}from './user.js';
import { Project } from "./project";
import * as mediasoup from 'mediasoup'
const wss = new WebSocketServer({ port: 8080,host: '0.0.0.0' });

let worker
let project
wss.on('listening', async () => {
    worker = await mediasoup.createWorker({
        rtcMinPort: 10000,
        rtcMaxPort: 20000
    });
    console.log('Mediasoup worker ready');
    project=new Project(worker);
});

wss.on("connection", async (ws: WebSocket) => {
    console.log("hii")
    const user=new User(ws,Date.now()+"adarshtiwari7799@gmail.com");
    project.draw(user);
    user.socket.send(JSON.stringify({type:"hii"}));
})
console.log('')