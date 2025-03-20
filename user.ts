//@ts-nocheck
import {WebSocket} from "ws";
export class User{
   public socket:WebSocket;
   public name:string;
   constructor(socket:WebSocket,name:string){
       this.socket = socket;
       this.name = name;
   }
}