const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export const fetchImages = async (page = 1, perPage = 12) => {
  const url = `https://api.unsplash.com/photos?page=${page}&per_page=${perPage}`;
  console.log("Fetching:", url);
  console.log("Access Key:", UNSPLASH_ACCESS_KEY);
  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Unsplash error:", data);
    throw new Error('Failed to fetch images');
  }
  return data;
};