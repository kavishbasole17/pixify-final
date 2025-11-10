"use client";
import { useState, useEffect, useCallback } from "react";
import SearchableImageGrid from "./components/SearchableImageGrid";
import Uploader from "./components/Uploader";

export default function Home() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchImages = useCallback(async (query = "") => {
    try {
      setLoading(true);
      // Choose endpoint based on whether there is a search query
      const endpoint = query
        ? `/api/search?query=${encodeURIComponent(query)}`
        : "/api/gallery";

      const res = await fetch(endpoint);
      const data = await res.json();
      setImages(data || []);
    } catch (err) {
      console.error("Error fetching images:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchImages(searchQuery);
  };

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-[#0b0b0b]/90 backdrop-blur-md border-b border-gray-800 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => { setSearchQuery(""); fetchImages(""); }}
          >
            <span className="text-2xl">🖼️</span>
            <h1 className="text-xl font-bold tracking-tight">Pixify</h1>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative w-full md:w-[600px]">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-full leading-5 placeholder-gray-500 focus:outline-none focus:bg-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all duration-200"
                placeholder="Search your photos (e.g., 'sunset', 'dog')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Uploader */}
          <div className="flex-shrink-0">
            <Uploader onUploadSuccess={() => fetchImages(searchQuery)} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-400 animate-pulse">Loading your memories...</p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="mb-6 text-gray-400 text-sm">
                Showing results for <span className="text-white font-semibold">"{searchQuery}"</span>
                {images.length === 0 && " (No matches found)"}
              </div>
            )}
            <SearchableImageGrid images={images} />
          </>
        )}
      </div>
    </main>
  );
}
