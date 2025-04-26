import React, { useEffect, useRef } from "react";
import ReactFlow, { Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

// ✅ Custom node component using Canvas API
const CanvasNode = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a blue circle
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(50, 50, 30, 0, 2 * Math.PI);
    ctx.fill();

    // Draw text inside the circle (Check if data.label exists)
    if (data?.label) {
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(data.label, 50, 55); // Centered text
    }
  }, [data]); // Re-run when `data` changes

  return (
    <div style={{ width: "100px", height: "100px", position: "relative" }}>
      <canvas ref={canvasRef} width={100} height={100} />
      {/* Handles for connecting edges */}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

// ✅ Move nodeTypes outside the component to avoid re-creation
const nodeTypes = { canvasNode: CanvasNode };

const FlowWithCanvasNodes = () => {
  const nodes = [
    {
      id: "1",
      type: "canvasNode", // Uses our custom node
      position: { x: 100, y: 100 }, // Initial position
      data: { label: "Node 1" }, // Data passed to CanvasNode
    },
    {
      id: "2",
      type: "canvasNode",
      position: { x: 300, y: 100 },
      data: { label: "Node 2" },
    },
  ];

  const edges = [
    { id: "e1-2", source: "1", target: "2", animated: true }, // Connects Node 1 → Node 2
  ];

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges}  />
    </div>
  );
};

export default FlowWithCanvasNodes;
