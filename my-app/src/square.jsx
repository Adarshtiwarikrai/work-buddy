import { useState,useEffect,useRef } from "react";
import { Shape } from "./lib/shape2";
import { SketchPicker } from "react-color";
import Join from "./components/join";
import Create from  './components/create'
import Video from "./video";
import { UseSocket } from "./usestate";
const Square =()=>{
    const canvasref=useRef(null)
    const [shapes,setShapes]=useState([])
    const [text,setText]=useState()
    const [textmode,settextmode]=useState(false)
    const [textpos,settextpos]=useState({x:0,y:0})
    const [alltext,setalltext]=useState([])
    const [path,setpath]=useState([])
    const [currpath,setcurrpath]=useState([])
    const [drawmode,setdrawmode]=useState(false)
    const [font,setfont]=useState(24)
    const [fonttext,setfonttext]=useState("Arial")
    const [color,setColor]=useState("#000000")
   const [changecolour,setchangecolour]=useState(false)
   const [isvideo,setisvideo]=useState(false)
   const [islivemessage,setislivemessage]=useState(false)
   const [create,setcreate]=useState(false)
   const [join,setjoin]=useState(false)
   const [active,setactive]=useState(null)
   const [videoname,setvideoname]=useState("")
   const [startvideo,setstartvideo]=useState(false)
   const { socket, sendmessage, message } = UseSocket();
   const [pass,setpass]=useState({})
    const drag=useRef({
        drag:false,
        resize:false,
        offsetx:0,
        offsety:0,
        startx:0,
        starty:0,
    })
    const getcondinates = (clientX, clientY) => {
        const can = canvasref.current;
        const re = can.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        return {
          x: (clientX - re.left) * (can.width / re.width),
          y: (clientY - re.top) * (can.height / re.height)
        };
      };
      
    const addshape=(e)=>{
        const canv=canvasref.current
        if(!canv)
            return ;
        const ctx=canv.getContext('2d')
        console.log("asdfdlk")
        const sha=new Shape('shape',10,10,color,150,150,1.5,false,'')
       // setShapes([...shapes,sha])
       setShapes(prev => [...prev, sha]); 
    }
    const handleupload=(e)=>{
        const file=e.target.files[0];
        const canv=canvasref.current
        if(!canv)
            return ;
        if(!file)
            return ;
        const ctx=canv.getContext('2d')
        const a=URL.createObjectURL(file)
        const s=new Shape('images',10,10,color,150,150,1.5,false,a)
        setShapes(prev => [...prev, s]);
    }
   const Mousedown=(e)=>{
       const pos=getcondinates(e.clientX,e.clientY)
       if(textmode){
        if(text!=undefined){
            setalltext(prev=>[...prev,{text,textpos}])
            setText()
            settextpos({x:0,y:0})

        }
       setText('')
       settextpos(pos)
       console.log("asdfasdfhere")

      }
      if(drawmode){
        console.log('currpath')
        setcurrpath(prev=>[...prev,pos])
        return ;
      }
       console.log(pos)
       const newshape=shapes.map(shape=>
           new Shape(
            shape.name,
            shape.x,
            shape.y,
            shape.color,
            shape.width,
            shape.height,
            shape.scale,
            false,
            shape.src
           )
       )
       console.log(newshape)
       const shapecopy=newshape.findIndex((shape)=>shape.check(pos.x,pos.y))
       if(shapecopy==-1)
        return ;
      
       const shapechange=newshape[shapecopy]
       console.log(shapechange,"shapechange")
       newshape[shapecopy]=new Shape(
            shapechange.name,
            shapechange.x,
            shapechange.y,
            shapechange.color,
            shapechange.width,
            shapechange.height,
            shapechange.scale,
            true,
            shapechange.src

       )
       console.log("asdf")
       setShapes(newshape);
       if(newshape[shapecopy].isoverhandle(pos.x,pos.y)){
           drag.current={drag:false,resize:true,startx:pos.x,starty:pos.y,startwidth:newshape[shapecopy].width,startheight:newshape[shapecopy].height}
           console.log(pos.x-shapechange.x,pos.y-shapechange.y,pos.x,pos.y,shapechange.x,shapechange.y)
       }
       else
       drag.current={drag:true,resize:false,offsetx:pos.x-shapechange.x,offsety:pos.y-shapechange.y}
       console.log(pos.x-shapechange.x,pos.y-shapechange.y,pos.x,pos.y,shapechange.x,shapechange.y)
   }
   const handletext=()=>{
    console.log("handle")
    settextmode(!textmode)
   }
   const handlekeydown =(e)=>{
    console.log(e.key,"asdfasdfasdfasdfasdfasdfasdfasf")
    if(!textmode)
        return 
    console.log("haidfasidfiasdf")
    if(e.key=="Backspace"){
        setText(prev=>prev.slice(0,-1))
    }
    if(e.key=="Enter"){
        setText(prev=>prev+"\n")
    }
    if(e.key.length==1&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){
         setText(prev=>prev+e.key)
    }
}
   const Mousemove=(e)=>{
      const pos=getcondinates(e.clientX,e.clientY)
      if(drawmode){
        setcurrpath(prev=>[...prev,pos])
      }
     console.log(drag.current.resize==true)
      setShapes(prev=>prev.map(shape=>{
        if(!shape.selected)
            return shape;
        if(drag.current.drag){
            return new Shape(
                shape.name,
                pos.x-drag.current.offsetx,
                pos.y-drag.current.offsety,
                shape.color,
                shape.width,
                shape.height,
                shape.scale,
                true,
                shape.src
            )
        }
        if(drag.current.resize){
            return  new Shape(
                shape.name,
                shape.x,
                shape.y,
                shape.colour,
                pos.x-shape.x,
                pos.y-shape.y,
                shape.scale,
                true,
                shape.src
            )
        }
        return shape
      }))
   }
   const Mouseup=()=>{
    drag.current={drag:false,resize:false,offsetx:0,offsety:0,startx:0,starty:0}
    console.log('here for drawing thing',text)
    setpath(prev=>[...prev,currpath])
    setcurrpath([])
    
    // setText()
    // textpos(prev=>({x:0,y:0}))
   }
   const handlekeyup=()=>{
    console.log(alltext)
    setText()
    settextpos({x:0,y:0})
   }
   const redrawtext=()=>{
    const canv=canvasref.current
    if(!canv)
        return ;
    const ctx=canv.getContext("2d")
    drawactive(ctx)

   }
   const draweach= ()=>{
    const canv=canvasref.current
    if(!canv)
        return ;
    const ctx=canv.getContext("2d")
    alltext.forEach((t)=>{
        drawactivebetter(ctx,t)
    })
   }
   const drawactive=async (ctx)=>{
    if(!textmode)
        return 
    ctx.font = `${font}px Arial`;
    ctx.fillStyle = color;
    ctx.textBaseline='top'
    await draweach()
    const line=text.split("\n")
    console.log('line',line)
    line.forEach((l,i)=>{
        ctx.fillText(l,textpos.x,textpos.y+(i*1.2*20))
    })
   }
   const drawactivebetter= (ctx,element)=>{
    if(!textmode)
        return 
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textBaseline='top'
    
    const line=element.text.split("\n")
    console.log('line',line)
    line.forEach((l,i)=>{
        ctx.fillText(l,element.textpos.x,element.textpos.y+(i*1.2*20))
    })
   }
   const handledraw=()=>{
    setdrawmode(!drawmode)
   }
   const handlepath=(ctx)=>{
    if(path==undefined)
        return ;
    path.forEach(p=>{
        handlecurrpath(ctx,p)
    })
   }
   const handlecurrpath=(ctx,path)=>{
    if(path==undefined)
        return ;
     console.log(path)
     ctx.beginPath()
     ctx.strokeStyle = color;
     ctx.lineWidth = 2;
     ctx.lineCap = "round";

     path.forEach((p,i)=>{
         if(i==0)ctx.moveTo(p.x,p.y)
        else ctx.lineTo(p.x,p.y)
     })
     ctx.stroke()
   }
   const handlecolour=(e)=>{
    setColor(e.hex)
   }
   const handlepen=()=>{
    setchangecolour(!changecolour)
   }
   const handlecopy=()=>{
    
   }
   const handlevideoname=(name)=>{
    setvideoname(name)
    console.log("asdfasdfasdfasdfasdfasdfasdfasdf",name)
    setactive()
    setstartvideo(!startvideo)
    setpass({type:'createroom',create:name,sender:'producer'})
    //setpass({type:'createroom',create:'room1',sender:'producer'})
   }
    useEffect(()=>{
        if(!canvasref.current)
            return ;

        const canv=canvasref.current
        const dpr = window.devicePixelRatio || 1;
        canv.width = 1080 * dpr;
        canv.height = 1080 * dpr;
        if(!canvasref.current)
            return ;
        const ctx=canvasref.current.getContext('2d')
        
        shapes.forEach(shape=>{
            shape.draw(ctx)
        })
        console.log(shapes)
        handlepath(ctx)
        handlecurrpath(ctx)
        redrawtext()
        if(alltext.length==0){
            return ;
        }
        console.log('alltext',alltext)
        console.log('drawing each')
        draweach();
        

    },[shapes,alltext,text,path,currpath])
    
 return (
 <>
 <div className="flex  items-center justify-center h-screen w-screen">
    <div className="flex flex-col items-center justify-center h-screen w-[5%] border border-black ">
        <div className="flex flex-col items-center justify-evenly h-[30%] w-[65%] border border-black rounded-lg shadow-xl">
        <button onClick={(e)=>{setjoin(false) ,setcreate(!create),setactive('create')}} className= {`border border-black insert-0 rounded-md py-3 ${create? 'bg-blue-200':'bg-white'}` }>
        <img src='https://png.pngtree.com/png-clipart/20200224/original/pngtree-video-icon-in-flat-style-png-image_5244725.jpg' alt='text icon' className='h-5 w-5 rounded-full '/>
        meet
       
        </button>
        <button onClick={(e)=>{setcreate(false) ,setjoin(!join),setactive('join')}} className= {`border border-black rounded-md py-3 ${join? 'bg-blue-200':'bg-white'}` }> 
        <img src='https://creazilla-store.fra1.digitaloceanspaces.com/icons/3204078/user-plus-icon-md.png' alt='text icon' className='h-5 w-5 rounded-full '/>
        join
       
        </button>
        </div>
        {active && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            {/* Close Button */}
            <button
              onClick={() => setactive(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
            >
              ✖
            </button>
            {active === "create" && <Create onCreate={handlevideoname} />}
            {active === "join" && <Join />}
          </div>
        </div>
      )}
      
    </div>
    <div className="flex flex-col items-center h-screen w-[25%] border overflow-auto border-red-600">
        <div className='flex justify-evenly items-center w-[13%] h-[8%] gap-5 shadow-lg fixed top-5 bg-white border rounded-lg'>
            <button  onClick={(e)=>{setislivemessage(false) ,setisvideo(!isvideo)}} className= {`border border-black rounded-md px-3 py-3 ${isvideo? 'bg-blue-200':'bg-white'}` }>video</button>
            <button onClick={(e)=>{setisvideo(false) ,setislivemessage(!islivemessage)}} className= {`border border-black rounded-md px-3 py-3 ${islivemessage? 'bg-blue-200':'bg-white'}` }>message</button>
        </div>
        {startvideo&&<Video pass={pass}/>}
            <p>Item 6</p>
            <p>Item 7</p>
            <p>Item 8</p>
            <p>Item 9</p>
            <p>Item 10</p>
            <p>Item 11</p>
            <p>Item 12</p>
            <p>Item 13</p>
            <p>Item 1</p>
            <p>Item 2</p>
            <p>Item 3</p>
            <p>Item 4</p>
            <p>Item 5</p>
            <p>Item 6</p>
            <p>Item 7</p>
            <p>Item 8</p>
            <p>Item 9</p>
            <p>Item 10</p>
            <p>Item 11</p>
            <p>Item 12</p>
            <p>Item 13</p> <p>Item 1</p>
            <p>Item 2</p>
            <p>Item 3</p>
            <p>Item 4</p>
            <p>Item 5</p>
            <p>Item 6</p>
            <p>Item 7</p>
            <p>Item 8</p>
            <p>Item 9</p>
            <p>Item 10</p>
            <p>Item 11</p>
            <p>Item 12</p>
            <p>Item 13</p>

            </div>
  <div className=" flex flex-col items-center justify-center h-screen w-[70%] border border-black">
  <div className="flex justify-evenly items-center border  border-black rounded-lg w-[20%] h-[5%]  shadow-lg fixed top-5">
  <button onClick={(e)=>addshape(e)} className='h-5 w-5 items-center justify-center  rounded-full bg-red-600'>
  <img src="https://i.etsystatic.com/34041246/r/il/46eceb/5805044759/il_fullxfull.5805044759_bp4y.jpg" alt="icon" className="w-5 h-5    rounded-full"/>
   
    </button>
  <br/>

  <button onClick={(e)=>handletext(e)} className='h-5 w-5 items-center rounded-full active: border-black'>
    <img src='https://clipground.com/images/text-icon-png-8.png' alt='text icon' className='h-5 w-5 rounded-full '/>
    </button>

  <br/>

  <button onClick={(e)=>handledraw(e)} className="h-5 w-5 items-center rounded-full">
  <img src='https://static.vecteezy.com/system/resources/previews/000/554/962/original/fancy-ballpoint-pen-vector-icon.jpg' alt='text icon' className='h-5 w-5 rounded-full'/>

  </button>
 
  <label className="flex items-center justify-center w-6 h-6 text-white rounded-full cursor-pointer">
  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleupload(e)} />
  <img src='https://static.vecteezy.com/system/resources/previews/000/581/925/original/file-icon-vector-illustration.jpg' alt='text icon' className='h-5 w-5 rounded-full'/>
</label>
<button onClick={(e)=>handlepen(e)}>
<img src='https://cdn-icons-png.flaticon.com/512/551/551119.png' alt='text icon' className='h-5 w-5 rounded-full'/>

{changecolour&&
<SketchPicker color={color} onChange={(e)=>handlecolour(e)}/>
}
 </button>
</div>
    <canvas ref={canvasref} width={1080} height={1080} 
    className="h-screen w-[90%] border border-black "
    onMouseDown={Mousedown}
    onMouseMove={Mousemove}
    onMouseUp={Mouseup}
    onKeyDown={handlekeydown}
    onCopy={handlecopy}
    tabIndex={0}
    ></canvas>
   
  </div>
  </div>
  </>
 )
}
export default Square; 