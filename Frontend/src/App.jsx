import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import Gallery from './components/Gallery';
import Feed from './components/Feed';
import { fetchImages } from './api/unsplash';
import { useUserStore } from "./store/userStore";

function App() {
  const { user, setUser } = useUserStore();
  const [showPrompt, setShowPrompt] = useState(!user);
  const [focusedImageId, setFocusedImageId] = useState(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loader = useRef(null);

  useEffect(() => {
    setShowPrompt(!user);
  }, [user]);

  
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const newImages = await fetchImages(page, 12);
      setImages((prev) => {
        const map = new Map();
        [...prev, ...newImages].forEach((img) => map.set(img.id, img));
        return Array.from(map.values());
      });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadImages();
  }, [page, loadImages]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loader.current) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen relative">
      <div className="w-[75%] border-r border-gray-200 relative">
     
        {showPrompt && (
          <div className="absolute left-1/2 top-8 -translate-x-1/2 z-50">
            <div className="bg-white border border-gray-200 shadow-lg rounded px-6 py-4 flex flex-col items-center">
              <h2 className="text-base font-semibold mb-2">Please enter your name to access the gallery.</h2>
             
              <input
                className="border px-2 py-1 rounded w-48 mb-2"
                placeholder="Please enter your name to access the gallery"
                autoFocus
                onKeyDown={e => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    setUser(e.target.value.trim());
                    setShowPrompt(false);
                  }
                }}
              />
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
                onClick={e => {
                  const input = e.target.parentNode.querySelector("input");
                  if (input.value.trim()) {
                    setUser(input.value.trim());
                    setShowPrompt(false);
                  }
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        <Gallery
          images={images}
          loading={loading}
          focusedImageId={focusedImageId}
          setFocusedImageId={setFocusedImageId}
          loader={loader}
        />
        <div ref={loader} className="h-10" />
      </div>
      <div className="w-[25%]">
        <Feed
          images={images}
          onFocusImage={setFocusedImageId}
        />
      </div>
    </div>
  );
}

export default App;
