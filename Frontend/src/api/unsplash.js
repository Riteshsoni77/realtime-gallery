const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export const fetchImages = async (page = 1, perPage = 12) => {
  const url = `https://api.unsplash.com/photos?page=${page}&per_page=${perPage}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error('Failed to fetch images');
  return data;
};


export const searchImages = async (query, page = 1, perPage = 12) => {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error('Failed to search images');
  return data.results; // Unsplash returns { results: [...] }
};
