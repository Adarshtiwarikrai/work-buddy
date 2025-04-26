import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  
  const handleCreateCanvas = () => {
    navigate('/square');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-6 px-8 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">CollabDraw</h1>
          <button 
            onClick={handleCreateCanvas}
            className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors"
          >
            + New Canvas
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Your Collaborative Whiteboard</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Draw, sketch, upload images, and collaborate in real-time with integrated video calling.
          </p>
        </div>

        {/* Canvas Creation CTA */}
        <div className="flex justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Start Creating</h3>
            <p className="text-gray-600 mb-6">
              Create a new canvas to begin drawing, collaborating, and sharing your ideas.
            </p>
            <button
              onClick={handleCreateCanvas}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-md transition-colors w-full"
            >
              Create New Canvas
            </button>
          </div>
        </div>

        {/* Recent Canvases (optional) */}
        {/* You can add this section later when you implement canvas storage */}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} CollabDraw - All rights reserved</p>
      </footer>
    </div>
  );
};

export default Home;