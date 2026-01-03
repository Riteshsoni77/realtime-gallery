import React from "react";
import { db } from "../instantdb";

const Feed = ({ images }) => {
  const { data } = db.useQuery({
    feed: {},
  });

  const feed = (data?.feed || []).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="w-full max-w-lg mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Live Feed</h2>
      <div className="space-y-2">
        {feed.map((item) => {
          const img = images.find(img => img.id === item.imageId);
          if (item.type === "reaction") {
            return (
              <div key={item.id} className="bg-white rounded shadow px-4 py-2">
                <b>{item.user}</b> reacted <span className="text-xl">{item.emoji}</span> to <span className="font-mono">{img?.description || "an image"}</span>
                <span className="ml-2 text-xs text-gray-400">{new Date(item.createdAt).toLocaleTimeString()}</span>
              </div>
            );
          }
          if (item.type === "comment") {
            return (
              <div key={item.id} className="bg-white rounded shadow px-4 py-2">
                <b>{item.user}</b> commented on <span className="font-mono">{img?.description || "an image"}</span>: "{item.text}"
                <span className="ml-2 text-xs text-gray-400">{new Date(item.createdAt).toLocaleTimeString()}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Feed;