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

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading images...</p>;
  if (!images.length) return <p className="text-center mt-10 text-gray-400">No images yet. Try uploading one!</p>;

  return (
    <div className="p-6">
      <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative mb-4 group overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <img
              src={img.url}
              alt={`Image ${i}`}
              className="w-full rounded-xl transition-transform duration-500 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="text-white text-sm p-3 text-center">
                {img.tags && img.tags.length > 0 ? (
                  img.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-600 text-white px-2 py-1 m-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-300 italic">No tags</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
