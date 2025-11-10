"use client";

import React, { useEffect, useState } from "react";
import Uploader from "./components/Uploader";
import SearchableImageGrid from "./components/SearchableImageGrid";

export default function Home() {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchGallery(q = "") {
    setLoading(true);
    try {
      const url = q ? `/api/search?q=${encodeURIComponent(q)}` : `/api/gallery`;
      const res = await fetch(url);
      const data = await res.json();
      setImages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <div className="content">
      <div className="search-container">
        <input
          className="search-box"
          placeholder="Search your uploaded images..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchGallery(query)}
        />
        <button className="btn" onClick={() => fetchGallery(query)}>Search</button>
      </div>

      <Uploader onDone={() => fetchGallery(query)} />

      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading...</p>
      ) : images.length > 0 ? (
        <SearchableImageGrid items={images} />
      ) : (
        <p style={{ color: "#6b7280" }}>No images yet. Try uploading one!</p>
      )}
    </div>
  );
}
