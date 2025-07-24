"use client";

import React, { useState } from "react";
import axios from "axios";

function App() {
  const [image, setImage] = useState<File | null>(null);
  const [colors, setColors] = useState<number[][]>([]);
  const [newColors, setNewColors] = useState<number[][]>([]);
  const [imageId, setImageId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    const res = await axios.post("http://localhost:5000/upload", formData);
    setColors(res.data.colors);
    setNewColors(res.data.colors);
    setImageId(res.data.image_id);
  };

  const handleRecolor = async () => {
    const res = await axios.post(
      "http://localhost:5000/recolor",
      {
        image_id: imageId,
        color_map: newColors,
      },
      { responseType: "blob" }
    );

    const url = URL.createObjectURL(res.data);
    setResultUrl(url);
  };

  return (
    <div>
      <h1>Color Changer</h1>

      <input
        type="file"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload}>Upload & Detect Colors</button>

      {colors.length > 0 && (
        <div>
          <h3>Detected Colors</h3>
          {colors.map((color, idx) => (
            <div key={idx}>
              <span
                style={{
                  display: "inline-block",
                  width: 40,
                  height: 20,
                  background: `rgb(${color.join(",")})`,
                  marginRight: 8,
                }}
              />
              →
              <input
                type="color"
                value={`#${newColors[idx]
                  .map((c) => c.toString(16).padStart(2, "0"))
                  .join("")}`}
                onChange={(e) => {
                  const hex = e.target.value;
                  const rgb = [
                    parseInt(hex.slice(1, 3), 16),
                    parseInt(hex.slice(3, 5), 16),
                    parseInt(hex.slice(5, 7), 16),
                  ];
                  const updated = [...newColors];
                  updated[idx] = rgb;
                  setNewColors(updated);
                }}
              />
            </div>
          ))}
          <button onClick={handleRecolor}>Apply Changes</button>
        </div>
      )}

      {resultUrl && (
        <div>
          <h3>Result:</h3>
          <img
            src={resultUrl}
            alt="Recolored Result"
            style={{ maxWidth: 500 }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
