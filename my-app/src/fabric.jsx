import React, { useRef, useState, useEffect } from "react";
import Headers from './components/navbar.jsx';
import { UseSocket } from './usestate';
import { Shape } from './lib/shape.js';
import Video from "./video.jsx";
import Join from "./components/join.jsx";
import {SketchPicker}from 'react-color';
import {Stage,Image,Layer,Transformer,Line,Text,Rect} from 'react-konva'
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import useImage from "use-image";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const Base = () => {
  const canvasRef = useRef(null);
  const { socket, sendmessage, message } = UseSocket();
  const [shapes, setShapes] = useState([]);
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [textItems, setTextItems] = useState([]);
  const [activeTextId, setActiveTextId] = useState(null);
  const [play,setplay]=useState(false);
  const [pass,setpass]=useState({});
  const [join,setjoin]=useState(false);
  const [imageurl,setimageurl]=useState('');
  const [colour,setcolour]=useState('')
  const [Line,setLine]=useState()
  const [image,setimage]=useState([])
  
  const drag = useRef({
    isdrag: false,
    isresize: false,
    currentid: null,
    offsetX: 0,
    offsetY: 0,
    startWidth: 0,
    startHeight: 0,
  });
const drawshape = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set common text styles
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";

  // Draw all saved text items
  textItems.forEach((item) => {
    ctx.fillText(item.text, item.x, item.y);

    // Highlight if selected
    if (item.id === activeTextId) {
      const width = ctx.measureText(item.text).width;
      const height = 24; // 20px * 1.2
      ctx.strokeStyle = "#4285f4";
      ctx.lineWidth = 2;
      ctx.strokeRect(item.x - 5, item.y - height + 5, width + 10, height + 5);
    }
  });

  // Draw typing text with cursor
  if (textMode && textInput) {
    ctx.fillText(textInput, textPosition.x, textPosition.y);

    const width = ctx.measureText(textInput).width;
    const cursorX = textPosition.x + width;
    ctx.beginPath();
    ctx.moveTo(cursorX, textPosition.y - 15);
    ctx.lineTo(cursorX, textPosition.y + 5);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw all shapes
  shapes.forEach((shape) => shape.draw(ctx));
};
  const getcondinates = (clientX, clientY) => {
    const can = canvasRef.current;
    const re = can.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (clientX - re.left) * (can.width / re.width),
      y: (clientY - re.top) * (can.height / re.height)
    };
  };

  const drawtext=(ctx ,text,x,y,maxwidth,drawcursor)=>{
    const words= text.split(' ')
    let line='';
    const lethight=24;
    const canwid=ctx.canvas.width;
    const effmaxwidth=maxwidth?Math.min(maxwidth,canwid-x):canwid-x;
    if(drawcursor){
      const metrics = ctx.measureText(text);
      const textWidth = Math.min(metrics.width, effmaxwidth);
      ctx.fillStyle="blue"
      ctx.fillRect(x-2, y-2 , textWidth+4, y);

    }

    ctx.fillStyle="black"
    for(let n=0;n<words.length;n++){
      const testline=line+words[n]+' ';
      const metrics=ctx.measureText(testline);
      if(metrics.width>effmaxwidth){
        ctx.fillText(line,x,y);
        line=words[n]+' ';
       y+=lethight
      }else{
        line=testline
      }
    }
    ctx.fillText(line,x,y);
  }
  const handleMouseDown = (e) => {
    const pos = getcondinates(e.clientX, e.clientY);

    if (textMode) {
      // Check if clicked on existing text
      const clickedTextIndex = textItems.findIndex(item => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.font = "20px Arial";
        const metrics = ctx.measureText(item.text);
        const textHeight = 20 * 1.2;

        return (
          pos.x >= item.x &&
          pos.x <= item.x + metrics.width &&
          pos.y >= item.y - textHeight &&
          pos.y <= item.y + 5
        );
      });

      if (clickedTextIndex !== -1) {
        // Select existing text
        const selectedText = textItems[clickedTextIndex];
        setActiveTextId(selectedText.id);
        setTextInput(selectedText.text);
        setTextPosition({ x: selectedText.x, y: selectedText.y });
        
        // Remove the text item while editing
        setTextItems(prev => prev.filter((_, index) => index !== clickedTextIndex));
      } else {
        // Start new text at click position
        setTextPosition(pos);
        setTextInput("");
        setActiveTextId(null);
      }
      return;
    }

    // Reset active text when clicking in non-text mode
    setActiveTextId(null);

    // Shape manipulation mode
    const shapesCopy = shapes.map(shape =>
      new Shape(
        shape.type,
        shape.x,
        shape.y,
        shape.width,
        shape.height,
        shape.color,
        false, // Deselect all first
        shape.id
      )
    );

    const selectedIndex = shapesCopy.findIndex(shape => shape.check(pos.x, pos.y));
    if (selectedIndex === -1) return;

    const selectedShape = shapesCopy[selectedIndex];
    shapesCopy[selectedIndex] = new Shape(
      selectedShape.type,
      selectedShape.x,
      selectedShape.y,
      selectedShape.width,
      selectedShape.height,
      selectedShape.color,
      true, // Set selected
      selectedShape.id
    );
    
    setShapes(shapesCopy);
    
    requestAnimationFrame(() => {
      const updatedShape = shapesCopy[selectedIndex];
      if (updatedShape.isoverhandle(pos.x, pos.y)) {
        drag.current = {
          isresize: true,
          isdrag: false,
          currentid: updatedShape.id,
          startX: pos.x,
          startY: pos.y,
          startWidth: updatedShape.width,
          startHeight: updatedShape.height
        };
      } else {
        drag.current = {
          isdrag: true,
          isresize: false,
          currentid: updatedShape.id,
          offsetX: pos.x - updatedShape.x,
          offsetY: pos.y - updatedShape.y
        };
        console.log("answer1",updatedShape.x, updatedShape.y,pos.x,pos.y)
      }
    });
  };

  const handleMouseMove = (e) => {
    if (!drag.current.isdrag && !drag.current.isresize) return;
    
    const pos = getcondinates(e.clientX, e.clientY);
    
    setShapes(prev => prev.map(shape => {
      if (shape.id !== drag.current.currentid) return shape;

      if (drag.current.isresize) {
        const newWidth = Math.max(1, pos.x - shape.x);
        const newHeight = Math.max(1, pos.y - shape.y);
        console.log("asdfasdfasdf",pos.x,pos.y,shape.x,shape.y)
        return new Shape(
          shape.type,
          shape.x,
          shape.y,
          newWidth,
          newHeight,
          shape.color,
          true,
          shape.id
        );
      }

      if (drag.current.isdrag) {
        const newX = pos.x - drag.current.offsetX;
        const newY = pos.y - drag.current.offsetY;
        console.log("answer2",newX, newY)
        return new Shape(
          shape.type,
          newX,
          newY,
          shape.width,
          shape.height,
          shape.color,
          true,
          shape.id
        );
      }

      return shape;
    }));
  };

  const handleMouseUp = () => {
    drag.current = {
      isdrag: false,
      isresize: false,
      currentid: null,
      offsetX: 0,
      offsetY: 0,
      startWidth: 0,
      startHeight: 0
    };
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  const handleKeyDown = (e) => {
   // if (!textMode) return;
    
    // Handle Escape to cancel text input
    
    if (e.key === 'Escape') {
      setTextMode(false);
      setTextInput("");
      setActiveTextId(null);
      return;
    }
    
    // Handle Enter to save text
    if (e.key === 'Enter') {
      if (textInput.trim() !== "") {
        const newTextId = Date.now();
        setTextItems(prev => [...prev, {
          id: newTextId,
          text: textInput,
          x: textPosition.x,
          y: textPosition.y
        }]);
      }
      setTextInput("");
      setActiveTextId(null);
      return;
    }
    
    // Handle Backspace
    if (e.key === 'Backspace') {
      setTextInput(prev => prev.slice(0, -1));
      return;
    }
    
    // Ignore control keys and only add printable characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setTextInput(prev => prev + e.key);
    }
  };

  const addshape = () => {
    const newshape = new Shape("rect", 100, 100, 100, 100, colour, false, Date.now());
    setShapes(prev => [...prev, newshape]);
  };

  const toggleTextMode = () => {
    // If leaving text mode and there's unsaved text, save it
    if (textMode && textInput.trim() !== "") {
      const newTextId = Date.now();
      setTextItems(prev => [...prev, {
        id: newTextId,
        text: textInput,
        x: textPosition.x,
        y: textPosition.y
      }]);
      setTextInput("");
    }
    
    setTextMode(!textMode);
    setActiveTextId(null);
  };
  const DraggableImage = ({ imageURL }) => {
    const [image] = useImage(imageURL);
    return <Image image={image} draggable />;
  };
  const handleuploadpdf=async (e)=>{
    const file=e.target.files[0];
    if(file){
      console.log(file)
      const a=URL.createObjectURL(file)
      const canvas=canvasRef.current;
      const ctx=canvas.getContext("2d");
      const pdf = pdfjsLib.getDocument(a);
      const task=await pdf.promise
      const page=await task.getPage(1)
      console.log(page)
      const viewport=page.getViewport({scale:1.5})
      const render={
        canvasContext:ctx,
        viewport:viewport
      }
      await page.render(render).promise
    }
  }
  const handlecolour=(e)=>{
    setcolour(e.hex)
  }
  const handleupload=(e)=>{
   const file=e.target.files[0];
   if(file){
    const a=URL.createObjectURL(file);
    const canvas=canvasRef.current;
    const ctx=canvas.getContext("2d");
    const img=new window.Image();
    img.src=a;
    img.onload=()=>{
      ctx.drawImage(img,10,10,50,50);
    }
     setimageurl(a)
   }
  }
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 1080 * dpr;
    canvas.height = 1080 * dpr;
    
    // Add keyboard event listeners for text input
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [textMode, textInput, textPosition]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawshape();
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawshape();
  }, [shapes, textItems, textInput, activeTextId]);
const handlevideo=()=>{
//  console.log(play)
  const v=!play
  setplay(v);
  console.log(play)
  if(play==false){
  
  setpass({type:'createroom',create:'room1',sender:'producer'})
  }
}
const handlejoin=()=>{
  setjoin(!join)
  if(join==false)
  setpass({type:'joinroom',create:'room1',sender:'producer'})
}
  return (
    <>
      <Headers onDraw={drawshape}></Headers>
      <div className="canvas-controls" style={{ marginBottom: "10px" }}>
        <button onClick={addshape} style={{ marginRight: "10px" }}>Add Shape</button>
        <button 
          onClick={toggleTextMode} 
          style={{ 
            marginRight: "10px",
            backgroundColor: textMode ? "#4CAF50" : "#f1f1f1" 
          }}
        >
          {textMode ? "Text Mode ON" : "Text Mode OFF"}
        </button>
        <button onClick={handlevideo}>add video</button>
        
        {play&&<Video pass = {pass} />}
        <button onClick={handlejoin}>join room</button>
        {join&& <Join/>}
       
      </div>
      <SketchPicker color={colour} onChange={(e)=>handlecolour(e)}/>
      <input type='file' accept="image/*" onChange={(e)=>handleupload(e)} className="bg-green-600"/>
      <input type='file' accept="application/pdf" onChange={(e)=>handleuploadpdf(e)} className="bg-green-600"/>
      <Stage width={600} height={600} style={{ border: "1px solid black" }}>
        <Layer>{imageurl && <DraggableImage imageURL={imageurl} />}</Layer>
      </Stage>
      <div className="flex justify-center items-center">
        
        <canvas
          width={720}
          height={720}
          ref={canvasRef}
          style={{ 
            width: "1080px",
            height: "1080px",
            border: "1px solid black",
            backgroundColor: "white",
            cursor: textMode ? "text" : "default"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          tabIndex={0}
        />
      </div>
      {textMode && (
        <div style={{ marginTop: "10px" }}>
          <p>
            Click on the canvas to place text. Type your text and press Enter to save.
            Press Escape to cancel. Click on existing text to edit it.
          </p>
        </div>
      )}
    </>
  );
};

export default Base;