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
    <div className="p-8 max-w-6xl mx-auto">
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns:
            "repeat(auto-fill, minmax(250px, 1fr))",
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="relative group overflow-hidden rounded-xl bg-[#111] shadow-md hover:shadow-blue-500/20 transition-all duration-300"
          >
            <img
              src={img.url}
              alt={`Image ${i}`}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ borderRadius: "0.75rem" }}
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex flex-wrap justify-center gap-2 p-3">
                {img.tags && img.tags.length > 0 ? (
                  img.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium"
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
