"use client";
import { useState } from "react";

export default function Uploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e?.preventDefault?.();
    if (!file) return alert("Please choose a file first!");
    setUploading(true);

    try {
      const presign = await fetch("/api/generate-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      const { uploadUrl, key } = await presign.json();
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      const process = await fetch("/api/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const res = await process.json();
      if (!process.ok) throw new Error(res.error || "Processing failed");

      alert(`Upload successful! Tags: ${res.tags.join(", ")}`);
      if (onUploadSuccess) await onUploadSuccess();

      setFile(null);
      document.getElementById("file-input").value = null;
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="uploader-container">
      <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden-input" />
      <label htmlFor="file-input" className="upload-btn choose">Choose File</label>
      <button type="button" onClick={handleUpload} disabled={uploading || !file} className="upload-btn action">
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {file && <span className="file-name">{file.name}</span>}
    </div>
  );
}
