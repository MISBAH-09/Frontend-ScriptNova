// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// const api = axios.create({ baseURL: API_BASE });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("userToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// function handleError(error) {
//   if (error.response) {
//     const d = error.response.data;
//     throw new Error(d?.message || d?.detail || d?.error || `Server Error (${error.response.status})`);
//   } else if (error.request) {
//     throw new Error("No response from server. Check your connection.");
//   } else {
//     throw new Error(error.message);
//   }
// }

// export const generateKeywords = async (title) => {
//   try {
//     const r = await api.post("/generate-keywords/", { title }, { timeout: 150000 });
//     if (!r.data || r.data.success === false) throw new Error(r.data?.message || "Keyword generation failed");
//     return r.data.data || [];
//   } catch (e) { handleError(e); }
// };

// export const generateBlog = async ({ prompt, keywords, tone, length }) => {
//   try {
//     const r = await api.post("/generate-blog/", { prompt, keywords, tone, length }, { timeout: 30000000 });
//     if (!r.data || r.data.success === false) throw new Error(r.data?.message || "Blog generation failed");
//     return r.data.data || r.data;
//   } catch (e) { handleError(e); }
// };

// export const regenerateTitle = async ({ prompt, article_content, keywords }) => {
//   try {
//     const r = await api.post("/generate-title/", { prompt, article_content, keywords }, { timeout: 30000 });
//     if (!r.data || r.data.success === false) throw new Error(r.data?.message || "Title regeneration failed");
//     return r.data.data?.suggested_title || "";
//   } catch (e) { handleError(e); }
// };

// export const rephraseBlog = async ({ article_content, mode, prompt, keywords, tone, length }) => {
//   try {
//     const r = await api.post("/rephrase-blog/", { article_content, mode, prompt, keywords, tone, length }, { timeout: 30000000 });
//     if (!r.data || r.data.success === false) throw new Error(r.data?.message || "Operation failed");
//     return r.data.data?.content || "";
//   } catch (e) { handleError(e); }
// };

// export const saveBlog = async (blog) => {
//   try {
//     const r = await api.post("/blogs/", blog);
//     return r.data.data || r.data;
//   } catch (e) { handleError(e); }
// };

// // ?limit=N  &favourite=true
// export const getUserBlogs = async ({ limit, favourite } = {}) => {
//   try {
//     const params = {};
//     if (limit)     params.limit     = limit;
//     if (favourite) params.favourite = "true";
//     const r    = await api.get("/blogs/", { params });
//     const data = r.data.data || r.data;
//     return Array.isArray(data) ? data : [];
//   } catch (e) { handleError(e); }
// };

// export const getBlog = async (id) => {
//   try {
//     const r = await api.get(`/blogs/${id}/`);
//     return r.data.data || r.data;
//   } catch (e) { handleError(e); }
// };
// export const getBlogById = getBlog;

// export const getBlogBySlug = async (slug) => {
//   try {
//     const r = await api.get(`/blogs/slug/${slug}/`);
//     return r.data.data || r.data;
//   } catch (e) { handleError(e); }
// };

// export const updateBlog = async (id, updates) => {
//   try {
//     const r = await api.patch(`/blogs/${id}/`, updates);
//     return r.data.data || r.data;
//   } catch (e) { handleError(e); }
// };

// export const deleteBlog = async (id) => {
//   try { await api.delete(`/blogs/${id}/`); return true; }
//   catch (e) { handleError(e); }
// };

// // Toggles favourite field: "normal" ↔ "favourite"
// // Returns { success, id, favourite, is_favourite }
// export const toggleFavourite = async (id) => {
//   try {
//     const r = await api.post(`/blogs/${id}/favourite/`);
//     return r.data;
//   } catch (e) { handleError(e); }
// };

// export const getBlogStats = async () => {
//   try {
//     const r = await api.get("/blogs/stats/");
//     return r.data.data || r.data;
//   } catch (e) { handleError(e); }
// };



import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function handleError(error) {
  if (error.response) {
    const d = error.response.data;
    throw new Error(d?.message || d?.detail || d?.error || `Server Error (${error.response.status})`);
  } else if (error.request) {
    throw new Error("No response from server. Check your connection.");
  } else {
    throw new Error(error.message);
  }
}

export const generateKeywords = async (title) => {
  try {
    const r = await api.post("/generate-keywords/", { title }, { timeout: 150000 });
    if (!r.data || r.data.success === false) throw new Error(r.data?.message || "Keyword generation failed");
    return r.data.data || [];
  } catch (e) { handleError(e); }
};

export const generateBlog = async ({ prompt, keywords, tone, length }) => {
  try {
    const r = await api.post("/generate-blog/", { prompt, keywords, tone, length }, { timeout: 30000000 });
    if (!r.data || r.data.success === false) throw new Error(r.data?.message || "Blog generation failed");
    return r.data.data || r.data;
  } catch (e) { handleError(e); }
};

export const regenerateTitle = async ({ prompt, article_content, keywords }) => {
  try {
    const r = await api.post("/generate-title/", { prompt, article_content, keywords }, { timeout: 30000 });
    if (!r.data || r.data.success === false) throw new Error(r.data?.message || "Title regeneration failed");
    return r.data.data?.suggested_title || "";
  } catch (e) { handleError(e); }
};

export const rephraseBlog = async ({ article_content, mode, prompt, keywords, tone, length }) => {
  try {
    const r = await api.post("/rephrase-blog/", { article_content, mode, prompt, keywords, tone, length }, { timeout: 30000000 });
    if (!r.data || r.data.success === false) throw new Error(r.data?.message || "Operation failed");
    return r.data.data?.content || "";
  } catch (e) { handleError(e); }
};

// =========================  HUMANIZE
// blog_id is optional — if provided, result is saved to DB
export const humanizeBlog = async ({ content, style = "natural", blog_id = null }) => {
  try {
    const r = await api.post("/humanize/", { content, style, blog_id }, { timeout: 30000000 });
    if (!r.data || r.data.success === false) throw new Error(r.data?.message || "Humanize failed");
    return r.data.data?.humanized_content || "";
  } catch (e) { handleError(e); }
};

export const saveBlog = async (blog) => {
  try {
    const r = await api.post("/blogs/", blog);
    return r.data.data || r.data;
  } catch (e) { handleError(e); }
};

export const getUserBlogs = async ({ limit, favourite } = {}) => {
  try {
    const params = {};
    if (limit)     params.limit     = limit;
    if (favourite) params.favourite = "true";
    const r    = await api.get("/blogs/", { params });
    const data = r.data.data || r.data;
    return Array.isArray(data) ? data : [];
  } catch (e) { handleError(e); }
};

export const getBlog = async (id) => {
  try {
    const r = await api.get(`/blogs/${id}/`);
    return r.data.data || r.data;
  } catch (e) { handleError(e); }
};
export const getBlogById = getBlog;

export const getBlogBySlug = async (slug) => {
  try {
    const r = await api.get(`/blogs/slug/${slug}/`);
    return r.data.data || r.data;
  } catch (e) { handleError(e); }
};

export const updateBlog = async (id, updates) => {
  try {
    const r = await api.patch(`/blogs/${id}/`, updates);
    return r.data.data || r.data;
  } catch (e) { handleError(e); }
};

export const deleteBlog = async (id) => {
  try { await api.delete(`/blogs/${id}/`); return true; }
  catch (e) { handleError(e); }
};

export const toggleFavourite = async (id) => {
  try {
    const r = await api.post(`/blogs/${id}/favourite/`);
    return r.data;
  } catch (e) { handleError(e); }
};

export const getBlogStats = async () => {
  try {
    const r = await api.get("/blogs/stats/");
    return r.data.data || r.data;
  } catch (e) { handleError(e); }
};
