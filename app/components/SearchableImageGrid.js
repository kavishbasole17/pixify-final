"use client";
import React from "react";

export default function SearchableImageGrid({ images = [], loading }) {
  if (loading) return <p className="text-gray-400 text-center">Loading images...</p>;
  if (!images.length) return <p className="text-gray-500 text-center mt-8">No images found.</p>;

  return (
    <div className="masonry">
      {images.map((item, i) => (
        <div key={i} className="masonry-item">
          <div className="image-wrapper">
            <img src={item.url} alt={`image-${i}`} className="masonry-image" />
            <div className="overlay">
              <div className="tags">{(item.tags || []).slice(0, 5).join(", ")}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
