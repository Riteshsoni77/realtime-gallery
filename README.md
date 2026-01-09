# Realtime Gallery

A real-time, multi-user image gallery built with React, Tailwind CSS, Unsplash API, and InstantDB.

## Features

- **Infinite Gallery:** Browse Unsplash images with infinite scroll.
- **User Authentication:** Username required before accessing the gallery.
- **Live Feed:** Real-time updates for likes, reactions, and comments.
- **Emoji Reactions & Likes:** React to images with emojis and likes.
- **Comments:** Add and delete comments on images.
- **Optimistic UI:** Instant feedback for user actions.
- **Responsive Design:** Works seamlessly on desktop and mobile.

## Tech Stack

- **React** (functional components & hooks)
- **Tailwind CSS** (utility-first styling)
- **InstantDB** (real-time backend)
- **Unsplash API** (image source)
- **Vercel (deployment)

## Getting Started

### 1. Clone the repository

```sh
from the ritesh branch
git clone https://github.com/Riteshsoni77/realtime-gallery.git
cd realtime-gallery
```

### 2. Install dependencies

```sh
npm install
```


### 3. Configure Unsplash API

- Get a free API key from [Unsplash Developers](https://unsplash.com/developers).
- Create a `.env` file in your project root and add:
  ```
  VITE_UNSPLASH_ACCESS_KEY=YOUR_UNSPLASH_ACCESS_KEY
  ```
- In your code, access the key using:
  ```js
  const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  ```
- **Restart your dev server** after changing the `.env` file.
  ```

### 4. Configure InstantDB

- Create a project at [InstantDB](https://instantdb.com/).
- Copy your App ID and update `src/instantdb.js`:
  ```js
  export const db = init({
    appId: "YOUR_APP_ID",
    schema,
  });
  ```

### 5. Set Permissions in InstantDB

- Go to the Permissions tab in your InstantDB dashboard.
- Paste this into `rules.json` and save:
  ```json
  {
    "images": "true",
    "reactions": "true",
    "comments": "true",
    "feed": "true",
    "likes": "true"
  }
  ```

### 6. Start the development server

```sh
npm run dev
```

## Deployment

- **Vercel:**  
  Push to GitHub, import your repo on [Vercel](https://vercel.com), and deploy.


**Make sure to add your deployed domain as an allowed origin in your InstantDB project settings.**

