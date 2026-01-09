import React, { useEffect, useRef, useState } from "react";
import { db } from "../instantdb";
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";

const Feed = ({ images, onFocusImage }) => {
  
  const { data: feedData, isLoading, error } = db.useQuery({ feed: {} });
  const feed = (feedData?.feed || []).sort((a, b) => b.createdAt - a.createdAt);

  // Track IDs of newly added feed items
  const [animatedIds, setAnimatedIds] = useState([]);
  const prevFeedLength = useRef(feed.length);

  useEffect(() => {
    if (feed.length > prevFeedLength.current) {
      // New items added at the top
      const newIds = feed
        .slice(0, feed.length - prevFeedLength.current)
        .map((f) => f.id);
      setAnimatedIds((ids) => [...newIds, ...ids]);
      
      setTimeout(() => {
        setAnimatedIds((ids) => ids.filter((id) => !newIds.includes(id)));
      }, 1000);
    }
    prevFeedLength.current = feed.length;
  }, [feed]);

  
  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-400 animate-pulse">
        Loading feed...
      </div>
    );
  }

 
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load feed. Please try again later.
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">No activity yet...</div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-8 px-2 sm:px-4">
      <h2 className="text-xl font-bold mb-4 text-center sm:text-left">Live Feed</h2>
      <div className="w-full space-y-4">
        {feed.map((item) => {
          const img = images.find((img) => img.id === item.imageId);
          if (!img) return null;

          // Deleted comment
          if (item.type === "comment_deleted") {
            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-2 border-l-4 border-gray-300">
                {img?.urls?.thumb && (
                  <img src={img.urls.thumb} alt="thumb" className="w-14 h-14 sm:w-10 sm:h-10 rounded object-cover border mx-auto sm:mx-0" />
                )}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-blue-700 break-all">{item.user}</b>
                    <span>deleted a comment on</span>
                    <span className="font-mono text-xs text-gray-500 break-all">
                      {img?.name || img?.title || img?.description || img?.alt_description || img?.fileName || "an image"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          }

          // Removed reaction
          if (item.type === "reaction_removed") {
            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-2 border-l-4 border-orange-300">
                {img?.urls?.thumb && (
                  <img src={img.urls.thumb} alt="thumb" className="w-14 h-14 sm:w-10 sm:h-10 rounded object-cover border mx-auto sm:mx-0" />
                )}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-blue-700 break-all">{item.user}</b>
                    <span>removed reaction</span>
                    <span className="text-xl">{item.emoji}</span>
                    <span>on</span>
                    <span className="font-mono text-xs text-gray-500 break-all">
                      {img?.name || img?.title || img?.description || img?.alt_description || img?.fileName || "an image"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          }

          // Like
          if (item.type === "like") {
            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-2 border-l-4 border-red-400">
                {img?.urls?.thumb && (
                  <img src={img.urls.thumb} alt="thumb" className="w-14 h-14 sm:w-10 sm:h-10 rounded object-cover border mx-auto sm:mx-0" />
                )}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-blue-700 break-all">{item.user}</b>
                    <span>liked</span>
                    <span>on</span>
                    <span className="font-mono text-xs text-gray-500 break-all">
                      {img?.name || img?.title || img?.description || img?.alt_description || img?.fileName || "an image"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          }

          // Unlike
          if (item.type === "unlike") {
            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-2 border-l-4 border-gray-400">
                {img?.urls?.thumb && (
                  <img src={img.urls.thumb} alt="thumb" className="w-14 h-14 sm:w-10 sm:h-10 rounded object-cover border mx-auto sm:mx-0" />
                )}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-blue-700 break-all">{item.user}</b>
                    <span>unliked</span>
                    <span>on</span>
                    <span className="font-mono text-xs text-gray-500 break-all">
                      {img?.name || img?.title || img?.description || img?.alt_description || img?.fileName || "an image"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          }

          // Reaction
          if (item.type === "reaction") {
            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-2 border-l-4 border-yellow-400">
                {img?.urls?.thumb && (
                  <img src={img.urls.thumb} alt="thumb" className="w-14 h-14 sm:w-10 sm:h-10 rounded object-cover border mx-auto sm:mx-0" />
                )}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-blue-700 break-all">{item.user}</b>
                    <span>reacted</span>
                    <span className="text-xl">{item.emoji}</span>
                    <span>on</span>
                    <span className="font-mono text-xs text-gray-500 break-all">
                      {img?.name || img?.title || img?.description || img?.alt_description || img?.fileName || "an image"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          }

          // Comment
          if (item.type === "comment" && item.text) {
            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-2 border-l-4 border-blue-400">
                {img?.urls?.thumb && (
                  <img src={img.urls.thumb} alt="thumb" className="w-14 h-14 sm:w-10 sm:h-10 rounded object-cover border mx-auto sm:mx-0" />
                )}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="text-blue-700 break-all">{item.user}</b>
                    <span>commented</span>
                    <span>on</span>
                    <span className="font-mono text-xs text-gray-500 break-all">
                      {img?.name || img?.title || img?.description || img?.alt_description || img?.fileName || "an image"}
                    </span>
                  </div>
                  <div className="text-gray-700 text-sm mt-1 break-words">
                    "{item.text}"
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          }

        
          return null;
        })}
      </div>
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(16px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in {
            animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Feed;