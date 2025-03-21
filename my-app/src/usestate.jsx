import { useState, useEffect, useRef } from "react";

export const UseSocket = () => {
  const [message, setMessage] = useState(null); // Use useState for message
  const socketRef = useRef(null); // Use useRef for WebSocket

  useEffect(() => {
    // Create WebSocket connection only once
    if (!socketRef.current) {
      const ws = new WebSocket(' ws://localhost:8080');

      ws.onopen = () => {
        console.log('connected');
      };

      ws.onmessage = (event) => {
        const newMessage = JSON.parse(event.data.toString());
        setMessage(newMessage); // Update state to trigger re-render
      };

      socketRef.current = ws; // Store WebSocket in ref
    }

    // Cleanup function
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  const sendmessage = (voice) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'adarsh' }));
      socketRef.current.send(JSON.stringify(voice));
    }
  };

  return { socket: socketRef.current, sendmessage, message }; // Return socket and message
};