"use client";
import React from "react";

export default function SearchableImageGrid({ items = [] }) {
  return (
    <div className="masonry">
      {items.map((item, index) => (
        <div key={index} className="masonry-item">
          <div className="image-wrapper">
            <img
              src={item.url}
              alt={`image-${index}`}
              className="masonry-image"
            />
            <div className="overlay">
              <div className="tags">
                {(item.tags || []).slice(0, 5).join(", ")}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
