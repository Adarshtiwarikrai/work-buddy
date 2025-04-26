import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!username.trim()) {
      alert('Please enter your name');
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`/room/${newRoomId}`, { state: { username } });
  };

  const handleJoinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      alert('Please enter both room ID and your name');
      return;
    }
    navigate(`/room/${roomId}`, { state: { username } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-8 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">CollabDraw</h1>
        <p className="text-xl opacity-90">Real-time collaborative whiteboard with video calling</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">✏️</div>
            <h3 className="text-xl font-semibold text-indigo-700 mb-2">Draw & Sketch</h3>
            <p className="text-gray-600">Create shapes, freehand drawings, and add text to your collaborative canvas.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold text-indigo-700 mb-2">Upload Images</h3>
            <p className="text-gray-600">Add images to your whiteboard to enhance your collaboration.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-semibold text-indigo-700 mb-2">Video Call</h3>
            <p className="text-gray-600">Communicate in real-time with integrated video calling functionality.</p>
          </div>
        </div>

        {/* Action Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Join Room */}
            <div className="flex-1 w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Join a Room</h2>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="text"
                placeholder="Room ID"
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button 
                onClick={handleJoinRoom}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Join Room
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 md:my-0">
              <div className="absolute inset-0 flex items-center md:block">
                <div className="w-full border-t border-gray-300 md:hidden"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-gray-500 font-medium md:px-0 md:py-2">
                  OR
                </span>
              </div>
            </div>

            {/* Create Room */}
            <div className="flex-1 w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Room</h2>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button 
                onClick={handleCreateRoom}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} CollabDraw - A collaborative whiteboard tool</p>
      </footer>
    </div>
  );
};

export default HomePage;