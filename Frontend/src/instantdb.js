import { i, init } from "@instantdb/react";

export const schema = i.schema({
  entities: {
    images: i.entity({
      url: i.string(),
      description: i.string(),
    }),
    reactions: i.entity({
      imageId: i.string(),
      emoji: i.string(),
      count: i.number(),
      user: i.string(),
      createdAt: i.number(),
    }),
    comments: i.entity({
      imageId: i.string(),
      text: i.string(),
      user: i.string(),
      createdAt: i.number(),
    }),
    feed: i.entity({
      type: i.string(),
      imageId: i.string(),
      emoji: i.string(),
      text: i.string(),
      user: i.string(),
      createdAt: i.number(),
    }),
    likes: i.entity({
      imageId: i.string(),
      user: i.string(),
      createdAt: i.number(),
    }),
  },
});

export const db = init({
  appId: "    a7d639dd-3aa8-4e30-9496-0830934ee5e6 ",
  schema,
});

