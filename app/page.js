"use client";
import { useState, useEffect, useCallback } from "react";
import Uploader from "./components/Uploader";
import SearchableImageGrid from "./components/SearchableImageGrid";

export default function Home() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery", { cache: "no-store" });
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching images:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUploadSuccess = async () => {
    await new Promise((r) => setTimeout(r, 1500));
    fetchImages();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchImages();

    try {
      setLoading(true);
      const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center justify-start p-6">
      <h1 className="text-4xl font-bold mt-10 mb-6 text-center">Pixify</h1>

      <div className="flex flex-col items-center justify-center w-full max-w-2xl space-y-4">
        <form onSubmit={handleSearch} className="search-bar flex w-full items-center justify-center">
          <input type="text" placeholder="Search your uploaded images..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
          <button type="submit" className="search-btn">Search</button>
        </form>
        <Uploader onUploadSuccess={handleUploadSuccess} />
      </div>

      <div className="w-full max-w-7xl mt-8">
        <SearchableImageGrid images={images} loading={loading} />
      </div>

      <footer className="text-gray-500 text-sm py-8 text-center">© 2025 Kavish Basole</footer>
    </main>
  );
}
