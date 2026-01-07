import React, { useState, useMemo } from "react";
import { db } from '../instantdb';
import Picker from '@emoji-mart/react';
import { FaRegHeart, FaHeart } from "react-icons/fa";

const DEFAULT_EMOJIS = ['👍', '❤️', '😃', '😢', '🙏', '👎', '😡'];
const MAX_EMOJIS = 7;

const ImageModal = ({ image, onClose, user }) => {
  const [comment, setComment] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [emojiBar, setEmojiBar] = useState(DEFAULT_EMOJIS);
  const [pendingComments, setPendingComments] = useState([]);

  const { data } = db.useQuery({
    reactions: {},
    comments: {},
  });

  const { data: likesData } = db.useQuery({ likes: {} });
  const likes = likesData?.likes || [];
  const imageLikes = likes.filter(like => like.imageId === image.id);
  const likeCount = imageLikes.length;
  const userLiked = imageLikes.some(like => like.user === user);

  const reactions = useMemo(
    () => (data?.reactions || []).filter(r => r.imageId === image?.id),
    [data, image]
  );
  const comments = useMemo(
    () => (data?.comments || []).filter(c => c.imageId === image?.id),
    [data, image]
  );

  if (!image || !image.id || !image.urls) return null;

  // Find if the current user has reacted with this emoji
  const userReaction = (emoji) =>
    reactions.find(r => r.emoji === emoji && r.user === user);

  // Add or remove reaction
  const handleReact = (emojiObj) => {
    const emojiValue = emojiObj.native || emojiObj; // emoji-mart returns an object
    const existing = reactions.find(r => r.emoji === emojiValue && r.user === user);

    if (existing) {
      // Remove reaction
      db.transact([
        db.tx.reactions[existing.id].delete(),
        db.tx.feed[crypto.randomUUID()].update({
          type: "reaction-removed",
          imageId: image.id,
          emoji: emojiValue,
          user,
          createdAt: Date.now(),
        }),
      ]);
    } else {
      // Add reaction
      db.transact([
        db.tx.reactions[crypto.randomUUID()].update({
          imageId: image.id,
          emoji: emojiValue,
          count: 1,
          user,
          createdAt: Date.now(),
        }),
        db.tx.feed[crypto.randomUUID()].update({
          type: "reaction",
          imageId: image.id,
          emoji: emojiValue,
          user,
          createdAt: Date.now(),
        }),
      ]);

      // Add emoji to bar if not present, replace least-used if full
      setEmojiBar((prev) => {
        if (prev.includes(emojiValue)) return prev;
        if (prev.length < MAX_EMOJIS) return [...prev, emojiValue];
        // Replace least-used emoji (find emoji with lowest count)
        const counts = prev.map(e =>
          reactions.filter(r => r.emoji === e).reduce((sum, r) => sum + r.count, 0)
        );
        const minIdx = counts.indexOf(Math.min(...counts));
        const newBar = [...prev];
        newBar[minIdx] = emojiValue;
        return newBar;
      });
    }

    setShowPicker(false);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    // 1. Optimistically add to pendingComments
    const tempId = crypto.randomUUID();
    setPendingComments((prev) => [
      ...prev,
      {
        id: tempId,
        imageId: image.id,
        text: comment,
        user,
        createdAt: Date.now(),
        pending: true,
      },
    ]);

    // 2. Send to InstantDB
    db.transact([
      db.tx.comments[tempId].update({
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

  // Like button logic
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

  // Merge pendingComments and real comments, filter out duplicates
  const allComments = [
    ...pendingComments.filter(
      (pc) => !comments.some((c) => c.id === pc.id)
    ),
    ...comments,
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] p-4 sm:p-8 relative overflow-auto">
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
        
        {/* Horizontal emoji bar with + button */}
        <div className="flex items-center gap-2 justify-center bg-pink-100 rounded-full px-4 py-2 mb-4 shadow">
          {emojiBar.map((emoji) => {
            const r = reactions.filter(x => x.emoji === emoji);
            const reacted = !!userReaction(emoji);
            return (
              <button
                key={emoji}
                className={`text-2xl hover:scale-125 transition-transform relative ${reacted ? "ring-2 ring-blue-400" : ""}`}
                onClick={() => handleReact({ native: emoji })}
                title={reacted ? "Remove your reaction" : "React"}
              >
                {emoji}
                {r.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {r.reduce((sum, rr) => sum + rr.count, 0)}
                  </span>
                )}
              </button>
            );
          })}
          {/* + button to open emoji picker */}
          <button
            className="text-2xl px-2 hover:bg-pink-200 rounded-full"
            onClick={() => setShowPicker((v) => !v)}
            aria-label="Pick Emoji"
          >
            +
          </button>
        </div>

        {/* Emoji Picker */}
        {showPicker && (
          <div className="flex justify-center">
            <Picker
              onEmojiSelect={handleReact}
              theme="light"
              style={{ width: '100%', height: '350px' }}
            />
          </div>
        )}

        {/* Like button */}
        <div className="flex justify-center mb-4">
          <button
            className="flex items-center gap-1 text-2xl transition-colors"
            onClick={() => handleLike(image.id)}
          >
            {userLiked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-500" />
            )}
            <span className="text-base font-bold">{likeCount}</span>
          </button>
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
            {allComments.length === 0 && (
              <div className="text-gray-400 text-sm">No comments yet.</div>
            )}
            {allComments.map((c, i) => (
              <div
                key={c.id || i}
                className={`bg-gray-100 rounded px-3 py-2 text-gray-800 flex items-center justify-between ${c.pending ? "opacity-50" : ""}`}
              >
                <span>
                  <b>{c.user}</b>: {c.text}
                  <span className="ml-2 text-xs text-gray-400">
                    {c.createdAt ? new Date(c.createdAt).toLocaleTimeString() : ""}
                  </span>
                </span>
                {c.user === user && (
                  <button
                    className="ml-2 text-xs text-gray-400 hover:text-red-500"
                    onClick={() => {
                      db.transact([
                        db.tx.comments[c.id].delete(),
                        db.tx.feed[crypto.randomUUID()].update({
                          type: "comment-removed",
                          imageId: image.id,
                          text: c.text,
                          user,
                          createdAt: Date.now(),
                        }),
                      ]);
                    }}
                    title="Delete your comment"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;

