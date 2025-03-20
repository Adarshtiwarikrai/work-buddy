export class Shape{
   constructor(name,x,y,color,width,height,scale,selected,src){
    this.name=name,
    this.x=x;
    this.y=y,
    this.color=color;
    this.width=width;
    this.height=height;
    this.scale=scale;
    this.selected=selected;
    this.src=src;
    this.handlesize=12;
   }
   draw(ctx){
       if(this.name=='shape'){
        ctx.fillStyle=this.color;
        ctx.fillRect(this.x,this.y,this.width,this.height);
        ctx.strokeStyle='black';
        ctx.setLineDash([5,5])
        ctx.lineWidth=2;
        ctx.strokeRect(this.x,this.y,this.width,this.height);
        console.log("hiiii")
        ctx.setLineDash([])
        ctx.fillStyle='white'
        ctx.strokeStyle='black';
        ctx.fillRect(this.x+this.width-this.handlesize/2,this.y+this.height-this.handlesize/2,this.handlesize,this.handlesize);
        ctx.strokeRect(this.x+this.width-this.handlesize/2,this.y+this.height-this.handlesize/2,this.handlesize,this.handlesize);
       }
       if(this.name=='images'){
        const img=new Image();
        img.src=this.src;
        console.log(this.src)
        img.onload=()=>{
            ctx.drawImage(img,this.x,this.y,this.width,this.height);
        }
       }
   }
   check(mousex,mousey){
    if(mousex>=this.x&&mousex<=this.x+this.width&&mousey>=this.y&&mousey<=this.y+this.height){
        return true
    }
   }
   isoverhandle(mousex, mousey) {
//     if(mousex>=this.x+this.width-this.handlesize/2&&mousex<=this.x+this.width+this.handlesize/2&&mousey>=this.y+this.height-this.handlesize/2&&mousey<=this.y+this.height+this.handlesize/2){
//         return true
    
//    }
// return (
//     mousex >= this.x + this.width - this.handlesize &&
//     mousex <= this.x + this.width &&
//     mousey >= this.y + this.height - this.handlesize &&
//     mousey <= this.y + this.height
//   );
if (
    mousex >= this.x + this.width - this.handlesize / 2 &&
    mousex <= this.x + this.width + this.handlesize / 2 &&
    mousey >= this.y + this.height - this.handlesize / 2 &&
    mousey <= this.y + this.height + this.handlesize / 2
  ) {
    return true;
  }
  
}
}