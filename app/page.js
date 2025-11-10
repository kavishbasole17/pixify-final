"use client";
import { useState } from "react";
import Uploader from "./components/Uploader";
import SearchableImageGrid from "./components/SearchableImageGrid";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  // called after upload completes successfully
  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Pixify
      </h1>

      <Uploader onUploadSuccess={handleUploadSuccess} />

      <div className="mt-10 w-full">
        <SearchableImageGrid key={refreshKey} />
      </div>
    </main>
  );
}
