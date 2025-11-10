"use client";
import { useState } from "react";
import Uploader from "./components/Uploader";
import SearchableImageGrid from "./components/SearchableImageGrid";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // trigger refresh when an image uploads successfully
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen py-10 px-5">
      <h1 className="text-4xl font-bold text-white mb-10">Pixify</h1>

      <Uploader onUploadSuccess={handleUploadSuccess} />

      <div className="mt-10 w-full max-w-6xl">
        <SearchableImageGrid key={refreshKey} />
      </div>
    </main>
  );
}
