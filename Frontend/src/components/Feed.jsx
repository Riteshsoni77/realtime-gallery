import React from "react";
import { db } from "../instantdb";
import { FaHeart, FaRegHeart, FaRegComment, FaSmile } from "react-icons/fa";

const Feed = ({ images, onFocusImage }) => {
  const { data, isLoading, isError, error } = db.useQuery({ feed: {} });
  const feed = (data?.feed || []).sort((a, b) => b.createdAt - a.createdAt);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Loading feed...</div>;
  }
  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading feed: {error?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Live Feed</h2>
      <div className="space-y-2">
        {feed.map((item) => {
          const img = images.find((img) => img.id === item.imageId);
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white rounded shadow px-4 py-2 cursor-pointer hover:bg-blue-50 animate-fadeIn border-l-4"
              style={{
                borderColor:
                  item.type === "like"
                    ? "#ef4444"
                    : item.type === "unlike"
                    ? "#9ca3af"
                    : item.type === "reaction"
                    ? "#f59e42"
                    : "#3b82f6",
              }}
              onClick={() => onFocusImage && onFocusImage(item.imageId)}
            >
              {/* Optional: Show image thumbnail */}
              {img?.urls?.thumb && (
                <img
                  src={img.urls.thumb}
                  alt="thumb"
                  className="w-10 h-10 rounded object-cover border"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <b className="text-blue-700">{item.user}</b>
                  {item.type === "reaction" && (
                    <>
                      <span>reacted</span>
                      <span className="text-xl">{item.emoji}</span>
                    </>
                  )}
                  {item.type === "like" && (
                    <>
                      <span>liked</span>
                      <FaHeart className="text-red-500" />
                    </>
                  )}
                  {item.type === "unlike" && (
                    <>
                      <span>unliked</span>
                      <FaRegHeart className="text-gray-400" />
                    </>
                  )}
                  {item.type === "comment" && (
                    <>
                      <span>commented</span>
                      <FaRegComment className="text-blue-400" />
                    </>
                  )}
                  <span>on</span>
                  <span className="font-mono text-xs text-gray-500">
                    {img?.description || "an image"}
                  </span>
                </div>
                {item.type === "comment" && (
                  <div className="text-gray-700 text-sm mt-1">
                    "{item.text}"
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(item.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Feed;