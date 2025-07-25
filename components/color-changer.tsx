"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPaintRoller } from "react-icons/fa";

interface ColorChangerProps {
  pattern: string | null;
  setPattern: (pattern: string | null) => void;
}

const ColorChanger: React.FC<ColorChangerProps> = ({ pattern, setPattern }) => {
  const [image, setImage] = useState<File | null>(null);
  const [colors, setColors] = useState<number[][]>([]);
  const [newColors, setNewColors] = useState<number[][]>([]);
  const [imageId, setImageId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Convert base64 pattern to File and trigger color detection when pattern changes
  useEffect(() => {
    if (pattern && pattern.startsWith("data:image/")) {
      try {
        const base64String = pattern.split(",")[1];
        if (!base64String) {
          console.error("Invalid base64 string: missing data after comma");
          return;
        }
        const byteString = atob(base64String);
        const mimeString = pattern.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], "pattern.png", { type: mimeString });
        setImage(file);
        handleUpload(file);
      } catch (error) {
        console.error("Error converting pattern to File:", error);
      }
    } else {
      setImage(null);
      setColors([]);
      setNewColors([]);
      setImageId(null);
      setResultUrl(null);
    }
  }, [pattern]);

  const handleUpload = async (file: File | null = image) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData);
      if (!res.data.colors || !res.data.image_id) {
        throw new Error("Invalid response from /upload endpoint");
      }
      setColors(res.data.colors);
      setNewColors(res.data.colors);
      setImageId(res.data.image_id);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to detect colors.");
    }
  };

  const handleRecolor = async () => {
    if (!imageId || newColors.length === 0) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/recolor",
        {
          image_id: imageId,
          color_map: newColors,
        },
        { responseType: "blob" }
      );

      const blob = res.data;
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setPattern(url);

      // Convert the recolored blob to a File and re-detect colors
      const file = new File([blob], "recolored.png", { type: blob.type });
      setImage(file);
      await handleUpload(file);
    } catch (error) {
      console.error("Error recoloring image:", error);
      alert("Failed to apply color changes.");
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center mb-2 gap-2">
        <FaPaintRoller className="text-sm" />
        <span className="text-sm font-medium">COLOR CHANGER</span>
      </div>
      <div className="flex flex-col space-y-2">
        {colors.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Detected Colors</h3>
            {colors.map((color, idx) => (
              <div key={idx} className="flex items-center space-x-2 my-2">
                <span
                  style={{
                    display: "inline-block",
                    width: 40,
                    height: 20,
                    background: `rgb(${color.join(",")})`,
                    border: "1px solid #ccc",
                  }}
                />
                <span>→</span>
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
                  className="w-12 h-8"
                />
              </div>
            ))}
            <button
              onClick={handleRecolor}
              className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              Apply Color Changes
            </button>
          </div>
        )}

        {resultUrl && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Recolored Image:</h3>
            <img
              src={resultUrl}
              alt="Recolored Result"
              className="max-w-xs rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorChanger;
