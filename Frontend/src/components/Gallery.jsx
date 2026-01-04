import React, { useState, useEffect, useRef } from "react";
import ImageModal from "./ImageModal";
import { fetchImages } from "../api/unsplash";
import { db } from "../instantdb";
import { useUserStore } from "../store/userStore";
import { FaRegHeart, FaHeart, FaRegComment } from "react-icons/fa";

const Gallery = ({ images, loading, focusedImageId, setFocusedImageId, loader }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Real-time reactions
  const { data: reactionsData } = db.useQuery({ reactions: {} });
  const reactions = reactionsData?.reactions || [];

  // Real-time comments
  const { data: commentsData } = db.useQuery({ comments: {} });
  const comments = commentsData?.comments || [];

  const { data: likesData } = db.useQuery({ likes: {} });
  const likes = likesData?.likes || [];

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // Emoji reaction handler
  const handleGridReact = (imageId, emoji) => {
    const existing = reactions.find(
      r => r.imageId === imageId && r.emoji === emoji
    );
    if (existing) {
      db.transact([
        db.tx.reactions[existing.id].count.increment(1),
      ]);
    } else {
      const reactionId = crypto.randomUUID();
      db.transact([
        db.tx.reactions[reactionId].update({
          imageId,
          emoji,
          count: 1,
          user, // use from Zustand
          createdAt: Date.now(),
        }),
      ]);
    }
  };

  // Like handler
  const handleLike = (imageId) => {
    const existing = likes.find(like => like.imageId === imageId && like.user === user);
    if (existing) {
      db.transact([
        db.tx.likes[existing.id].delete(),
      ]);
    } else {
      db.transact([
        db.tx.likes[crypto.randomUUID()].update({
          imageId,
          user,
          createdAt: Date.now(),
        }),
      ]);
    }
  };

  // Open modal when focusedImageId changes
  useEffect(() => {
    if (focusedImageId) {
      const img = images.find(i => i.id === focusedImageId);
      if (img) setSelectedImage(img);
      setFocusedImageId(null); // Reset after focusing
    }
  }, [focusedImageId, images, setFocusedImageId]);

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-center py-8 text-slate-800">
        Realtime Gallery
      </h1>

      <input
        className="border px-2 py-1 rounded mb-4"
        value={user}
        onChange={e => setUser(e.target.value)}
        placeholder="Enter your name"
      />

      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {images.map((img) => {
          // Get reactions for this image, grouped by emoji
          const imgReactions = reactions
            .filter(r => r.imageId === img.id)
            .reduce((acc, r) => {
              acc[r.emoji] = acc[r.emoji] || [];
              acc[r.emoji].push(r);
              return acc;
            }, {});

          // Like logic
          const imageLikes = likes.filter(like => like.imageId === img.id);
          const likeCount = imageLikes.length;
          const userLiked = imageLikes.some(like => like.user === user);

          // Comment count
          const commentCount = comments.filter(c => c.imageId === img.id).length;

          return (
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
              <p className="mt-2 text-sm text-gray-700 text-center truncate">
                {img.alt_description || img.description || "Untitled"}
              </p>
              <div
                className="flex justify-center gap-4 mt-1"
                onClick={e => e.stopPropagation()}
              >
                {/* Like button */}
                <button
                  className="flex items-center gap-1 text-xl transition-colors"
                  onClick={() => handleLike(img.id)}
                >
                  {userLiked ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-500" />
                  )}
                  <span className="text-sm font-bold">{likeCount}</span>
                </button>
                {/* Comment button */}
                <span className="flex items-center text-xl text-gray-700 gap-1">
                  <FaRegComment />
                  <span className="text-sm font-bold">{commentCount}</span>
                </span>
                {/* Other emojis */}
                {Object.entries(imgReactions)
                  .filter(([emoji]) => emoji !== "❤️")
                  .map(([emoji, arr]) => (
                    <button
                      key={emoji}
                      className="text-xl hover:scale-125 transition-transform relative"
                      onClick={() => handleGridReact(img.id, emoji)}
                    >
                      {emoji}
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                        {arr.reduce((sum, r) => sum + r.count, 0)}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          user={user}
        />
      )}

      {/* LOADING & ERROR */}
      {loading && (
        <div className="text-center py-6 text-gray-500">Loading...</div>
      )}

      {/* OBSERVER */}
      <div ref={loader} className="h-10" />
    </div>
  );
};

export default Gallery;
