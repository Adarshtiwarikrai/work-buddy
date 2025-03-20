import React, { useRef, useState, useEffect } from "react";

const TextCanvas = () => {
  const canvasRef = useRef(null);
  const [textElements, setTextElements] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [fontSettings, setFontSettings] = useState({
    size: 24,
    family: "Arial",
    color: "#000000",
    align: "left"
  });

  // Canvas setup and drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High DPI setup
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    redrawCanvas();
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [textElements, fontSettings, currentText, isEditing]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw existing text elements
    textElements.forEach(element => {
      drawTextElement(ctx, element);
    });

    // Draw active text input
    if (isEditing) {
      drawActiveText(ctx);
    }
  };

  const drawTextElement = (ctx, element) => {
    ctx.save();
    ctx.font = `${element.size}px ${element.family}`;
    ctx.fillStyle = element.color;
    ctx.textAlign = element.align;
    ctx.textBaseline = "top";
    
    const lines = element.text.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        element.x,
        element.y + (index * element.size * 1.2)
      );
    });
    
    ctx.restore();
  };

  const drawActiveText = (ctx) => {
    ctx.save();
    ctx.font = `${fontSettings.size}px ${fontSettings.family}`;
    ctx.fillStyle = fontSettings.color;
    ctx.textAlign = fontSettings.align;
    ctx.textBaseline = "top";

    // Draw text input
    const lines = currentText.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        cursorPosition.x,
        cursorPosition.y + (index * fontSettings.size * 1.2)
      );
    });

    // Draw cursor
    const metrics = ctx.measureText(currentText);
    ctx.strokeStyle = fontSettings.color;
    ctx.beginPath();
    ctx.moveTo(
      cursorPosition.x + (fontSettings.align === "right" ? -metrics.width : 0),
      cursorPosition.y + (lines.length * fontSettings.size * 1.2) + 2
    );
    ctx.lineTo(
      cursorPosition.x + (fontSettings.align === "right" ? -metrics.width : 0),
      cursorPosition.y + (lines.length * fontSettings.size * 1.2) - fontSettings.size
    );
    ctx.stroke();
    
    ctx.restore();
  };

  const getCanvasCoordinates = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * window.devicePixelRatio,
      y: (clientY - rect.top) * window.devicePixelRatio
    };
  };

  const handleCanvasClick = (e) => {
    if (!isEditing) return;

    const pos = getCanvasCoordinates(e.clientX, e.clientY);
    const clickedElement = textElements.find(element => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.save();
      ctx.font = `${element.size}px ${element.family}`;
      const metrics = ctx.measureText(element.text);
      ctx.restore();
      
      return pos.x >= element.x - (element.align === "right" ? metrics.width : 0) &&
             pos.x <= element.x + (element.align === "left" ? metrics.width : 0) &&
             pos.y >= element.y &&
             pos.y <= element.y + (element.text.split('\n').length * element.size * 1.2);
    });

    if (clickedElement) {
      setCurrentText(clickedElement.text);
      setCursorPosition({ x: clickedElement.x, y: clickedElement.y });
      setSelectedTextId(clickedElement.id);
    } else {
      setCurrentText("");
      setCursorPosition(pos);
      setSelectedTextId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (!isEditing) return;

    switch (e.key) {
      case "Enter":
        if (currentText.trim()) {
          const newElement = {
            id: selectedTextId || Date.now(),
            text: currentText,
            x: cursorPosition.x,
            y: cursorPosition.y,
            ...fontSettings
          };
          
          setTextElements(prev => 
            selectedTextId 
              ? prev.map(el => el.id === selectedTextId ? newElement : el)
              : [...prev, newElement]
          );
        }
        setIsEditing(false);
        break;

      case "Escape":
        setIsEditing(false);
        setCurrentText("");
        setSelectedTextId(null);
        break;

      case "Backspace":
        setCurrentText(prev => prev.slice(0, -1));
        break;

      case "ArrowLeft":
      case "ArrowRight":
      case "ArrowUp":
      case "ArrowDown":
        // Implement cursor movement
        break;

      default:
        if (e.key.length === 1 && !e.ctrlKey) {
          setCurrentText(prev => prev + e.key);
        }
    }
  };

  return (
    <div>
      <div className="toolbar">
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Finish Editing" : "Add Text"}
        </button>

        <input
          type="color"
          value={fontSettings.color}
          onChange={e => setFontSettings(p => ({ ...p, color: e.target.value }))}
        />

        <input
          type="number"
          value={fontSettings.size}
          min="8"
          max="72"
          onChange={e => setFontSettings(p => ({ ...p, size: e.target.value }))}
        />

        <select
          value={fontSettings.family}
          onChange={e => setFontSettings(p => ({ ...p, family: e.target.value }))}
        >
          <option>Arial</option>
          <option>Times New Roman</option>
          <option>Courier New</option>
        </select>

        <select
          value={fontSettings.align}
          onChange={e => setFontSettings(p => ({ ...p, align: e.target.value }))}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onKeyDown={handleKeyDown}
        tabIndex="0"
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid #ccc",
          cursor: isEditing ? "text" : "default"
        }}
      />
    </div>
  );
};

export default TextCanvas;