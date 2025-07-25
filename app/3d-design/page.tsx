"use client";

import CanvasEditor from "@/components/drag-design";
import ThreeShirtViewer from "@/components/tshirt-viewer";
import ColorChanger from "@/components/color-changer";
import { useState, useEffect } from "react";
import { FaUpload, FaLayerGroup } from "react-icons/fa";

const CreateDesignPage = () => {
  const [active, setActive] = useState(0);
  const [triggerGenerate, setTriggerGenerate] = useState(false);
  const [combinedTextureUrl, setCombinedTextureUrl] = useState<string | null>(
    null
  );
  const [pattern, setPattern] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [xTile, setXTile] = useState<number | null>(1);
  const [yTile, setYTile] = useState<number | null>(1);
  const [isEditTitle, setIsEditTitle] = useState(false);
  const [title, setTitle] = useState("PROJECT TITLE");

  // Initialize image and pattern with /assets/megamendung.jpg
  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch("/assets/megamendung.jpg");
        if (!response.ok) {
          console.error("Image not found at /assets/megamendung.jpg");
          return;
        }
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result as string;
          if (base64Image.startsWith("data:image/")) {
            setImage(base64Image);
            setPattern(base64Image);
          } else {
            console.error("Invalid base64 image format");
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error loading megamendung.jpg:", error);
      }
    };

    if (!image && !pattern) {
      loadImage();
    }
  }, [image, pattern]);

  const handleCombinedTextureGenerated = (dataUrl: string) => {
    setCombinedTextureUrl(dataUrl);
    console.log(
      "Received combined texture from CanvasEditor:",
      dataUrl.substring(0, 50) + "..."
    );
  };

  const handleGenerate = () => {
    setTriggerGenerate(true);
  };

  const handleUpdateTile = async () => {
    if (!pattern) {
      alert("No pattern image available for tiling.");
      return;
    }
    const payload = {
      image: pattern,
      x: xTile,
      y: yTile,
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await fetch("http://127.0.0.1:5000/tile-pattern", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const dataUrl = `data:image/png;base64,${result.final_image_base64}`;
      if (dataUrl.startsWith("data:image/")) {
        setPattern(dataUrl);
      } else {
        console.error("Invalid tiled image format");
      }
    } catch (error) {
      console.error("Error sending data to Flask:", error);
      alert("Failed to send image data to Flask.");
    }
  };

  return (
    <div className="">
      <div className="flex h-screen p-6 px-12 bg-white text-black justify-around">
        <div className="flex flex-col items-center mr-6 space-y-2">
          <div className="flex gap-2 items-center cursor-pointer h-full">
            <label
              htmlFor="file-upload"
              className="flex gap-2 items-center cursor-pointer"
            >
              <FaUpload className="text-xl" />
              <p>Upload</p>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64Image = reader.result as string;
                    if (base64Image.startsWith("data:image/")) {
                      setImage(base64Image);
                      setPattern(base64Image);
                    } else {
                      console.error("Invalid uploaded image format");
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <ColorChanger pattern={pattern} setPattern={setPattern} />
        </div>

        <div className="flex-1">
          {isEditTitle ? (
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditTitle(false)}
                onBlur={() => setIsEditTitle(false)}
                className="bg-white border-black border-2 rounded-md px-3 text-lg font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          ) : (
            <h1
              className="text-lg font-semibold mb-4"
              onClick={() => setIsEditTitle(true)}
            >
              {title}
            </h1>
          )}
          <div className="flex">
            <div className="flex space-x-6 m-auto items-center">
              <div className="w-96 h-96 bg-gray-300 rounded-lg">
                <ThreeShirtViewer
                  combinedTextureFromCanvas={combinedTextureUrl}
                />
              </div>
              <div className="w-96 h-96 bg-gray-300 rounded-lg margin-auto">
                <CanvasEditor
                  active={active}
                  triggerGenerate={triggerGenerate}
                  setTriggerGenerate={setTriggerGenerate}
                  onTextureGenerated={handleCombinedTextureGenerated}
                  pattern={pattern}
                />
                <div className="flex justify-center items-center gap-2 m-3">
                  <label
                    htmlFor="tile_count"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tile Count
                  </label>
                  <input
                    type="number"
                    id="tile_count1"
                    className="w-16 bg-white rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setXTile(Number(e.target.value))}
                    value={xTile || 0}
                  />
                  ×
                  <input
                    type="number"
                    id="tile_count2"
                    className="w-16 bg-white rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setYTile(Number(e.target.value))}
                    value={yTile || 0}
                  />
                  <button
                    onClick={handleUpdateTile}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity duration-300 ease-in-out opacity-100"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-auto flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-red-500" />
            <div className="w-6 h-6 rounded-full bg-blue-500" />
            <div className="w-6 h-6 rounded-full bg-yellow-400" />
            <button className="w-6 h-6 rounded-full border border-black text-center">
              +
            </button>
          </div>

          <div className="p-3 rounded-lg bg-gray-100">
            <div className="flex items-center mb-2 gap-2">
              <FaLayerGroup className="text-sm" />
              <span className="text-sm font-medium">LAYERS</span>
            </div>
            <div className="flex flex-col space-y-1">
              {[
                "BACK",
                "FRONT RIGHT",
                "FRONT LEFT",
                "COLAR 1",
                "COLAR 2",
                "COLAR 3",
              ].map((layer, idx) => (
                <button
                  key={layer}
                  className="bg-white border border-gray-400 px-3 py-1 text-xs rounded hover:bg-gray-200"
                  onClick={() => setActive(idx)}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          <button
            className="bg-gray-300 px-6 py-2 rounded text-sm hover:bg-gray-400"
            onClick={handleGenerate}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDesignPage;
