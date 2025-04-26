import { useState,useEffect,useRef,useMemo } from "react";
import { ReactFlow } from '@xyflow/react';
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
    const [linewidth,setlinewidth]=useState(10)
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
   const [isScreenSharing, setIsScreenSharing] = useState(false);
   const [name,setname]=useState("")
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
        sendmessage({type:'shape',name:name,shape:sha})
       // setShapes([...shapes,sha])
       setShapes(prev => [...prev, sha])
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
        sendmessage({type:'shape',name:name,shape:s})
        setShapes(prev => [...prev, s]);
    }
    useEffect(() => {
        const work = async () => {
            if (!message) return;
            
            console.log("Received message:", message); // Debug log
            
            switch (message.type) {
                case 'pathcreate':
                    const newPath = message.data.data;
                    setpath(prev => [...prev, newPath]);
                    break;
                
                case 'shapecreate':
                    const newShape = message.shape;
                    setShapes(prev => [...prev, newShape]);
                    break;
                    
                case 'textcreate':
                    const { text, textpos } = message;
                    setalltext(prev => [...prev, { text, textpos }]);
                    break;
                    
                default:
                    console.log("Unhandled message type:", message.type);
            }
        };
    
        try {
            work();
        } catch (error) {
            console.error("Error processing message:", error);
        }
    }, [message]);
    
   const Mousedown=(e)=>{
       const pos=getcondinates(e.clientX,e.clientY)
       if(textmode){
        if(text!=undefined){
            sendmessage({type:'text',name:name,text,textpos})
            setalltext(prev=>[...prev,{text,textpos}])
            setText()
            settextpos({x:0,y:0})

        }
       setText('')
       settextpos(pos)
       console.log("asdfasdfhere")
        return ;
      }
      if(drawmode){
        console.log('currpath')
       
        setcurrpath(prev=>[pos])
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
    if(currpath.length>0)
    sendmessage({type:'path',name:name,data:currpath})    
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
     ctx.lineWidth = linewidth;
     ctx.lineCap = "round";

     path.forEach((p,i)=>{
        console.log("p",p)
         if(i==0)
            ctx.moveTo(p.x,p.y)
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
    setname(name)
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
        // if(alltext.length==0){
        //     return ;
        // }
        console.log('alltext',alltext)
        console.log('drawing each')
        draweach();
       console.log("asdfasdfasdf seracrching bloc")
    },[shapes,alltext,text,path,currpath])

    const handleScreenShare = () => {
       setIsScreenSharing(!isScreenSharing);
       setpass({type:'createroom',create:name,sender:'producer',screen:true})

    }
    
    return (
        <div className="flex h-screen w-screen bg-gray-100">
            {/* Left Sidebar - Tools */}
            <div className="flex flex-col items-center w-16 bg-white shadow-lg">
                <div className="flex flex-col items-center justify-start h-full py-4 space-y-6">
                    {/* Create Meeting Button */}
                    <button 
                        onClick={() => {setjoin(false); setcreate(!create); setactive('create')}} 
                        className={`p-2 rounded-lg ${create ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Create Meeting"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>

                    {/* Join Meeting Button */}
                    <button 
                        onClick={() => {setcreate(false); setjoin(!join); setactive('join')}} 
                        className={`p-2 rounded-lg ${join ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Join Meeting"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </button>

                    <div className="border-t border-gray-200 w-8 mx-auto my-2"></div>

                    {/* Shape Tool */}
                    <button 
                        onClick={addshape} 
                        className="p-2 rounded-lg hover:bg-gray-100"
                        title="Add Shape"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>

                    {/* Text Tool */}
                    <button 
                        onClick={handletext} 
                        className={`p-2 rounded-lg ${textmode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Add Text"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>

                    <button
                    onClick={handleScreenShare}
                    className={`p-2 rounded-lg ${isScreenSharing ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                    title="Screen Share"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    </button>

                    {/* Drawing Tool */}
                    <button 
                        onClick={handledraw} 
                        className={`p-2 rounded-lg ${drawmode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Freehand Draw"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>

                    {/* Image Upload */}
                    <label className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer" title="Upload Image">
                        <input type="file" accept="image/*" className="hidden" onChange={handleupload} />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </label>

                    {/* Color Picker */}
                    <div className="relative">
                        <button 
                            onClick={handlepen} 
                            className="p-2 rounded-lg hover:bg-gray-100"
                            title="Color Picker"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </button>
                        {changecolour && (
                            <div className="absolute left-16 top-0 z-10 shadow-xl">
                                <SketchPicker color={color} onChange={handlecolour} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Video/Chat */}
            <div className="flex flex-col w-64 bg-white shadow-lg">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => {setislivemessage(false); setisvideo(!isvideo)}} 
                            className={`px-4 py-2 rounded-lg ${isvideo ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        >
                            Video
                        </button>
                        <button 
                            onClick={() => {setisvideo(false); setislivemessage(!islivemessage)}} 
                            className={`px-4 py-2 rounded-lg ${islivemessage ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        >
                            Chat
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    {startvideo && <Video pass={pass} />}
                    {/* Add chat/message component here if needed */}
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-800">Collaborative Whiteboard</h1>
                </div>
                <div className="flex-1 relative overflow-hidden">
                    <canvas 
                        ref={canvasref} 
                        width={1080} 
                        height={1080}
                        className="absolute inset-0 w-full h-full bg-white border border-gray-200 shadow-inner"
                        onMouseDown={Mousedown}
                        onMouseMove={Mousemove}
                        onMouseUp={Mouseup}
                        onKeyDown={handlekeydown}
                        onCopy={handlecopy}
                        tabIndex={0}
                    />
                </div>
            </div>

            {/* Modal for Create/Join */}
            {active && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setactive(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {active === "create" && <Create onCreate={handlevideoname} />}
                        {active === "join" && <Join />}
                    </div>
                </div>
            )}
        </div>
    );
}
export default Square; 