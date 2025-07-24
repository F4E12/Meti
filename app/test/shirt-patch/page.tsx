"use client";
// src/pages/EkstraksiBaju.tsx
import React, { useState } from "react";
interface ShirtPatchResults {
  patch_image_url: string;
  debug_image_url: string;
}

function EkstraksiBaju() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<ShirtPatchResults | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setSelectedFile(event.target.files[0]);
      setResults(null);
      setError("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Mohon pilih file terlebih dahulu.");
      return;
    }
    setIsLoading(true);
    setError("");
    setResults(null);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/extract-shirt-patch",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Terjadi kesalahan.");
      setResults(data as ShirtPatchResults);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Ekstraksi Patch Baju</h1>
      <p>
        Unggah gambar seseorang untuk mengekstrak bagian tengah dari bajunya.
      </p>

      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
        />
        <button type="submit" disabled={isLoading || !selectedFile}>
          {isLoading ? "Menganalisis..." : "Analisis Gambar"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {results && (
        <div className="results-container">
          <h2>Hasil Ekstraksi</h2>
          <div className="content-grid">
            <div className="image-section">
              <h3>Hasil Crop (500x500)</h3>
              <img src={results.patch_image_url} alt="Cropped shirt patch" />
            </div>
            <div className="image-section">
              <h3>Debug Landmarks</h3>
              <img src={results.debug_image_url} alt="Pose landmarks" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EkstraksiBaju;
