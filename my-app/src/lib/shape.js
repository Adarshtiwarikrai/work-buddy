export class Shape{
    constructor(type,x, y, width, height, color,selected,id){
        this.id=id,
        this.type=type,
        this.x=x,
        this.y=y,
        this.width=width,
        this.height=height,
        this.color=color,
        this.selected=selected;
        this.handlesize=8;
    }
    draw(ctx) {
        ctx.fillStyle = this.selected ? "#ff000055" : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    
        if (this.selected) {
          ctx.fillStyle = "white";
          ctx.strokeStyle = "black";
          ctx.setLineDash([5,5])
          ctx.lineWidth = 3;
          ctx.strokeRect(this.x, this.y, this.width, this.height);
          ctx.setLineDash([]); // Reset to solid line

          // Draw resize handle
          ctx.fillStyle = "white";
          ctx.strokeStyle = "black";
          
          ctx.lineWidth = 1;
          ctx.fillRect(
            this.x + this.width - this.handlesize/2,
            this.y + this.height - this.handlesize/2,
            this.handlesize,
            this.handlesize
          );
          ctx.strokeRect(
            this.x + this.width - this.handlesize/2,
            this.y + this.height - this.handlesize/2,
            this.handlesize,
            this.handlesize
          );
        }
      }
    
    check(mouseX,mouseY){
         console.log(this.x,this.y,this.width,this.height)
        if(this.type==="rect"){
            if(mouseX>this.x && mouseX<this.x+this.width && mouseY>this.y && mouseY<this.y+this.height){
                return true
            }
            else{
                return false
            }
        }
        else if(this.type==="circle"){
            const distance = Math.sqrt(
                (mouseX - this.x) ** 2 + (mouseY - this.y) ** 2
              );
              return distance <= this.width / 2;
        }
        return ;
    }
    
    isoverhandle(mouseX, mouseY) {
        return (
          mouseX >= this.x + this.width - this.handlesize &&
          mouseX <= this.x + this.width &&
          mouseY >= this.y + this.height - this.handlesize &&
          mouseY <= this.y + this.height
        );
      }
    
    move(mouseX, mouseY) {
        this.x = mouseX - this.width / 2;
        this.y = mouseY - this.height / 2;
      }
    

}