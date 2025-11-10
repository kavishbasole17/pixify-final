"use client";
import React, { useState } from "react";

const FALLBACK_URL = "https://via.placeholder.com/400x600?text=No+Image";

export default function SearchableImageGrid({ images = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <p className="text-gray-500 text-center mt-8">
        No images found. Try uploading one!
      </p>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {images.map((image, index) => (
          <div
            key={image.key || image.url || index}
            className="masonry-item group relative overflow-hidden rounded-xl cursor-zoom-in"
            onClick={() => setSelectedImage(image)}
          >
            {/* ✅ Natural aspect ratio */}
            <img
              src={image.url || FALLBACK_URL}
              alt={image.tags?.join(", ") || "Uploaded Image"}
              className="w-full h-auto rounded-xl transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* ✅ Visible Tag Overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t 
              from-black/90 via-black/60 to-transparent opacity-0 
              group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {image.tags?.slice(0, 5).map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-md font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative max-w-7xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url || FALLBACK_URL}
              alt={selectedImage.tags?.join(", ")}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Tags in Modal */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {selectedImage.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-800 text-gray-200 rounded-full text-sm border border-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
