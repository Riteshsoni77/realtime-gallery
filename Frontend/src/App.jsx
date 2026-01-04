import React, { useState, useCallback, useEffect, useRef } from 'react';
import './index.css';
import Gallery from './components/Gallery';
import Feed from './components/Feed';
import { fetchImages } from './api/unsplash';

function App() {
  const [focusedImageId, setFocusedImageId] = useState(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loader = useRef(null);

  // Fetch images with pagination
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
    <div className="flex min-h-screen">
      <div className="w-[75%] border-r border-gray-200">
       
        <Gallery
          images={images}
          loading={loading}
          focusedImageId={focusedImageId}
          setFocusedImageId={setFocusedImageId}
          loader={loader}
        />
      </div>
      <div className="w-[25%]">
        <Feed
          images={images}
          onFocusImage={setFocusedImageId}
        />
      </div>
      <div ref={loader} className="h-10" />
    </div>
  );
}

export default App;
