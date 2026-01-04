import React from "react";
import { db } from "../instantdb";

const Feed = ({ images, onFocusImage }) => {
  const { data } = db.useQuery({
    feed: {},
  });

  const feed = (data?.feed || []).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="w-full max-w-lg mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Live Feed</h2>
      <div className="space-y-2">
        {feed.map((item) => {
          const img = images.find((img) => img.id === item.imageId);
          return (
            <div
              key={item.id}
              className="bg-white rounded shadow px-4 py-2 cursor-pointer hover:bg-blue-50"
              onClick={() => onFocusImage && onFocusImage(item.imageId)}
            >
              {item.type === "reaction" ? (
                <>
                  <b>{item.user}</b> reacted{" "}
                  <span className="text-xl">{item.emoji}</span> to{" "}
                  <span className="font-mono">
                    {img?.description || "an image"}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </>
              ) : (
                <>
                  <b>{item.user}</b> commented on{" "}
                  <span className="font-mono">
                    {img?.description || "an image"}
                  </span>
                  : "{item.text}"
                  <span className="ml-2 text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Feed;