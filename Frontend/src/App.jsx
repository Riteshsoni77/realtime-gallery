import React from 'react';
import './index.css';
import Gallery from './components/Gallery';

function App() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-red-500">Realtime Gallery</h1>
      <Gallery />
    </div>
  );
}

export default App;
