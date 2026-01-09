import { i, init } from "@instantdb/react";

const APP_ID = "a7d639dd-3aa8-4e30-9496-0830934ee5e6"; // Replace with your actual App ID

export const schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    images: i.entity({
      url: i.string(),
      description: i.string(),
    }),
    reactions: i.entity({
      imageId: i.string().optional(),
      emoji: i.string().optional(),
      count: i.number().optional(),
      user: i.string().optional(),
      createdAt: i.number().optional(),
    }),
    comments: i.entity({
      imageId: i.string().optional(),
      text: i.string().optional(),
      user: i.string().optional(),
      createdAt: i.number().optional(),
    }),
    feed: i.entity({
      type: i.string().optional(),
      imageId: i.string().optional(),
      emoji: i.string().optional(),
      text: i.string().optional(),
      user: i.string().optional(),
      createdAt: i.number().optional(),
    }),
    likes: i.entity({
      imageId: i.string().optional(),
      user: i.string().optional(),
      createdAt: i.number().optional(),
    }),
  },
});

export const db = init({
  appId: APP_ID,
  schema,
});

