import React, { useState, useEffect, useRef, useCallback } from "react";
import ImageModal from "./ImageModal";
import { fetchImages } from "../api/unsplash";

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const loader = useRef(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const newImages = await fetchImages(page, 12);
      setImages((prev) => {
        const map = new Map();
        [...prev, ...newImages].forEach((img) => map.set(img.id, img));
        return Array.from(map.values());
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-center py-8 text-slate-800">
        Realtime Gallery
      </h1>
    


      {/* 🔥 GRID LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="group cursor-pointer"
            onClick={() => setSelectedImage(img)}
          >
            <div className="overflow-hidden rounded-xl shadow-md">
              <img
                src={img.urls.small}
                alt={img.alt_description || "Gallery image"}
                className="w-full h-48 object-cover transform group-hover:scale-110 transition duration-300"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600 text-center truncate">
              {img.alt_description || "Untitled"}
            </p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* LOADING */}
      {loading && (
        <div className="text-center py-6 text-gray-500">Loading...</div>
      )}

      {/* OBSERVER */}
      <div ref={loader} className="h-10" />
    </div>
  );
};

export default Gallery;
