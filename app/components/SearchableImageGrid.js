"use client";
import { useEffect, useState } from "react";

export default function SearchableImageGrid() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        setImages(data);
      } catch (err) {
        console.error("Error loading gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  if (loading)
    return <p className="text-center mt-10 text-gray-400">Loading images...</p>;

  if (!images.length)
    return (
      <p className="text-center mt-10 text-gray-400">
        No images yet. Try uploading one!
      </p>
    );

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto">
      {/* Masonry layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative mb-4 break-inside-avoid overflow-hidden rounded-xl bg-[#111] shadow-md hover:shadow-blue-600/30 transition-all duration-300 group"
          >
            <img
              src={img.url}
              alt={`Image ${i}`}
              className="w-full rounded-xl transition-transform duration-500 group-hover:scale-105"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex flex-wrap justify-center gap-2 p-3 max-w-[90%]">
                {img.tags?.length > 0 ? (
                  img.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-600/80 text-white px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-300 italic text-sm">
                    No tags
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
