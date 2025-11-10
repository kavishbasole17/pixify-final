"use client";
import { useState } from "react";

export default function Uploader({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const onUploadClick = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setUploading(true);

    try {
      const res = await fetch("/api/generate-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      const { uploadUrl, key } = await res.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      await fetch("/api/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      alert("✅ Image uploaded successfully!");
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("❌ Upload failed!");
    } finally {
      setUploading(false);
      setFile(null);
      document.getElementById("file-input").value = null;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-3">
        <input
          id="file-input"
          type="file"
          accept="image/png, image/jpeg"
          onChange={onFileChange}
          className="hidden"
        />
        <label
          htmlFor="file-input"
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium"
        >
          Choose File
        </label>
        <button
          onClick={onUploadClick}
          disabled={uploading || !file}
          className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      <span className="text-sm text-gray-400">
        {file ? file.name : "No file chosen"}
      </span>
    </div>
  );
}
