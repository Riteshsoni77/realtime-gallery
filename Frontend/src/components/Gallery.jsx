import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchImages, searchImages } from "../api/unsplash";
import ImageModal from "./ImageModal";
import { db } from "../instantdb";
import { useUserStore } from "../store/userStore";
import { FaRegHeart, FaHeart, FaRegComment } from "react-icons/fa";

const Gallery = ({ loader }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [focusComment, setFocusComment] = useState(false);
  const [search, setSearch] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // Track current page
  const [hasMore, setHasMore] = useState(true);

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
          user, 
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
        db.tx.feed[crypto.randomUUID()].update({
          type: "unlike",
          imageId,
          user,
          createdAt: Date.now(),
        }),
      ]);
    } else {
      db.transact([
        db.tx.likes[crypto.randomUUID()].update({
          imageId,
          user,
          createdAt: Date.now(),
        }),
        db.tx.feed[crypto.randomUUID()].update({
          type: "like",
          imageId,
          user,
          createdAt: Date.now(),
        }),
      ]);
    }
  };

  
  const isUserSet = !!user && user.trim().length > 0;

  // Fetch images on mount or when search changes
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      let imgs = [];
      if (search.trim() === "") {
        imgs = await fetchImages(page);
      } else {
        imgs = await searchImages(search, page);
      }
      setImages(prev =>
        page === 1 ? imgs : [...prev, ...imgs]
      );
      setHasMore(imgs.length > 0);
    } catch (e) {
      setHasMore(false);
    }
    setLoading(false);
  }, [search, page]);

  
  useEffect(() => {
    setPage(1);
  }, [search]);

  
  useEffect(() => {
    loadImages();
    
  }, [page, search]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loader || !loader.current || !hasMore || loading) return;
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [loader, hasMore, loading]);

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-center py-8 text-slate-800">
        Realtime Gallery
      </h1>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Search images by keyword..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="max-w-7xl mx-auto grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
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
              className={`group cursor-pointer ${!isUserSet ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => isUserSet && setSelectedImage(img)}
            >
              <div className="overflow-hidden rounded-xl shadow-md">
                <img
                  src={img.urls.small}
                  alt={img.alt_description || "Gallery image"}
                  className="w-full h-auto aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <p className="mt-2 text-sm text-gray-700 text-center truncate">
                {img.alt_description || img.description || img.user?.name || ""}
              </p>
              <div
                className="flex justify-center gap-4 mt-1"
                onClick={e => e.stopPropagation()}
              >
                {/* Like button */}
                <button
                  className="flex items-center gap-1 text-xl transition-colors"
                  onClick={() => handleLike(img.id)}
                  disabled={!isUserSet}
                  title={!isUserSet ? "Enter your name to like" : ""}
                >
                  {userLiked ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-500" />
                  )}
                  <span className="text-sm font-bold">{likeCount}</span>
                </button>
                {/* Comment button */}
                <button
                  className="flex items-center text-xl text-gray-700 gap-1"
                  onClick={() => {
                    setSelectedImage(img);
                    setFocusComment(true);
                  }}
                  disabled={!isUserSet}
                  title={!isUserSet ? "Enter your name to comment" : ""}
                >
                  <FaRegComment />
                  <span className="text-sm font-bold">{commentCount}</span>
                </button>
                {/* Other emojis */}
                {Object.entries(imgReactions)
                  .map(([emoji, arr]) => (
                    <button
                      key={emoji}
                      className="text-xl hover:scale-125 transition-transform relative"
                      onClick={() => handleGridReact(img.id, emoji)}
                      disabled={!isUserSet}
                      title={!isUserSet ? "Enter your name to react" : ""}
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

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => {
            setSelectedImage(null);
            setFocusComment(false);
          }}
          user={user}
          focusComment={focusComment}
        />
      )}

      {loading && (
        <div className="text-center py-6 text-gray-500">Loading...</div>
      )}

      <div ref={loader} className="h-10" />
    </div>
  );
};

export default Gallery;
