import React, { useState } from "react";
import { db } from '../instantdb';

const EMOJIS = ['👍', '❤️', '😂', '🔥', '😍', '👏', '😮', '😢'];

const ImageModal = ({ image, onClose, user }) => {
  const [comment, setComment] = useState("");
  const { data } = db.useQuery({
    reactions: {},
    comments: {},
  });

  const reactions = (data?.reactions || []).filter(r => r.imageId === image?.id);
  const comments = (data?.comments || []).filter(c => c.imageId === image?.id);

  if (!image || !image.id || !image.urls) return null;

  const handleReact = (emoji) => {
    const existing = reactions.find(r => r.emoji === emoji);
    if (existing) {
      db.transact([
        db.tx.reactions[existing.id].count.increment(1),
        db.tx.feed[crypto.randomUUID()].update({
          type: "reaction",
          imageId: image.id,
          emoji,
          user,
          createdAt: Date.now(),
        }),
      ]);
    } else {
      const reactionId = crypto.randomUUID();
      db.transact([
        db.tx.reactions[reactionId].update({
          imageId: image.id,
          emoji,
          count: 1,
          user,
          createdAt: Date.now(),
        }),
        db.tx.feed[crypto.randomUUID()].update({
          type: "reaction",
          imageId: image.id,
          emoji,
          user,
          createdAt: Date.now(),
        }),
      ]);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const commentId = crypto.randomUUID();
    db.transact([
      db.tx.comments[commentId].update({
        imageId: image.id,
        text: comment,
        user,
        createdAt: Date.now(),
      }),
      db.tx.feed[crypto.randomUUID()].update({
        type: "comment",
        imageId: image.id,
        text: comment,
        user,
        createdAt: Date.now(),
      }),
    ]);
    setComment("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] p-8 relative overflow-auto">
        <button
          className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-700 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <img
          src={image.urls.regular}
          alt={image.alt_description}
          className="w-full max-h-[60vh] object-contain rounded-xl mb-6 shadow"
        />
        <h2 className="text-xl font-bold mb-3 text-gray-800">{image.description || 'Untitled'}</h2>
        <div className="flex gap-2 flex-wrap justify-center bg-gray-50 p-2 rounded shadow">
          {EMOJIS.map((emoji) => {
            const r = reactions.find(x => x.emoji === emoji);
            return (
              <button
                key={emoji}
                className="text-2xl hover:scale-125 transition-transform relative"
                onClick={() => handleReact(emoji)}
              >
                {emoji}
                {r && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {r.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-8 w-full">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Comments</h3>
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-1 border border-gray-300 bg-gray-50 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400"
              placeholder="Add a comment..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Post
            </button>
          </form>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {comments.length === 0 && (
              <div className="text-gray-400 text-sm">No comments yet.</div>
            )}
            {comments.map((c, i) => (
              <div key={i} className="bg-gray-100 rounded px-3 py-2 text-gray-800">
                <b>{c.user}</b>: {c.text}
                <span className="ml-2 text-xs text-gray-400">
                  {c.createdAt ? new Date(c.createdAt).toLocaleTimeString() : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

