"use client";
import { useState, useRef } from "react";

export default function Uploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      // 1. Get presigned URL
      const presign = await fetch("/api/generate-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      const { uploadUrl, key } = await presign.json();

      // 2. Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      // 3. Process Image
      const process = await fetch("/api/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const res = await process.json();
      if (!process.ok) throw new Error(res.error || "Processing failed");

      // Success
      if (onUploadSuccess) await onUploadSuccess();
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!file ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Upload</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-gray-800 rounded-full pl-4 pr-1 py-1 border border-gray-700">
          <span className="text-sm text-gray-300 max-w-[100px] truncate">
            {file.name}
          </span>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${uploading
                ? "bg-gray-600 text-gray-400 cursor-wait"
                : "bg-green-600 hover:bg-green-500 text-white"
              }`}
          >
            {uploading ? "..." : "Post"}
          </button>
          <button
            onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            className="p-1.5 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}