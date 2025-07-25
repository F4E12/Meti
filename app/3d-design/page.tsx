"use client";

import CanvasEditor from "@/components/drag-design";
import ThreeShirtViewer from "@/components/tshirt-viewer";
import ColorChanger from "@/components/color-changer";
import { useState, useEffect } from "react";
import { FaUpload, FaLayerGroup } from "react-icons/fa";
import { ArrowLeft, Edit3, Check, X, Save, Download, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/headers/header";

const CreateDesignPage = () => {
  const router = useRouter();
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
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const layers = [
    "Outside Collar",
    "Inside Collar",
    "Back",
    "Right Front",
    "Left Front",
    "Right Sleeve",
    "Left Sleeve",
  ];
  const layerColors = [
    "bg-meti-teal",
    "bg-meti-orange",
    "bg-meti-pink",
    "bg-meti-teal",
    "bg-meti-orange",
    "bg-meti-pink",
    "bg-meti-teal",
  ];

  return (
    <div className="min-h-screen bg-meti-cream">
      {/* Header */}
      <Header />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-8 shadow-sm">
          {/* Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-meti-dark mb-4">
              Upload Pattern
            </h3>
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-meti-teal/30 rounded-xl cursor-pointer hover:border-meti-teal hover:bg-meti-teal/5 transition-all duration-300 group"
            >
              <FaUpload className="text-2xl text-meti-teal mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-meti-dark font-medium">Click to upload</p>
              <p className="text-meti-dark/60 text-sm">PNG, JPG up to 10MB</p>
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

          {/* Color Changer */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-meti-dark">
              Color Adjustment
            </h3>
            <div className="bg-meti-cream rounded-xl p-4">
              <ColorChanger pattern={pattern} setPattern={setPattern} />
            </div>
          </div>

          {/* Quick Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-meti-dark">Quick Colors</h3>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-meti-teal cursor-pointer hover:scale-110 transition-transform shadow-md" />
              <div className="w-8 h-8 rounded-full bg-meti-orange cursor-pointer hover:scale-110 transition-transform shadow-md" />
              <div className="w-8 h-8 rounded-full bg-meti-pink cursor-pointer hover:scale-110 transition-transform shadow-md" />
              <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 text-gray-400 hover:border-meti-teal hover:text-meti-teal transition-colors flex items-center justify-center text-lg font-bold">
                +
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-full space-x-12">
            {/* 3D Viewer */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-serif text-meti-dark mb-4 text-center">
                3D Preview
              </h3>
              <div className="w-96 h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-inner">
                <ThreeShirtViewer
                  combinedTextureFromCanvas={combinedTextureUrl}
                />
              </div>
            </div>

            {/* Canvas Editor */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-serif text-meti-dark mb-4 text-center">
                Design Canvas
              </h3>
              <div className="w-96 h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-inner">
                <CanvasEditor
                  active={active}
                  triggerGenerate={triggerGenerate}
                  setTriggerGenerate={setTriggerGenerate}
                  onTextureGenerated={handleCombinedTextureGenerated}
                  pattern={pattern}
                />
              </div>

              {/* Tile Controls */}
              <div className="flex justify-center items-center gap-3 mt-6 p-4 bg-meti-cream rounded-xl">
                <label className="text-sm font-medium text-meti-dark">
                  Tile Count
                </label>
                <input
                  type="number"
                  className="w-16 bg-white rounded-lg border border-gray-300 px-3 py-2 text-sm text-center focus:border-meti-teal focus:outline-none focus:ring-2 focus:ring-meti-teal/20 transition-colors"
                  onChange={(e) => setXTile(Number(e.target.value))}
                  value={xTile || 0}
                  min="1"
                  max="10"
                />
                <span className="text-meti-dark/60 font-bold">×</span>
                <input
                  type="number"
                  className="w-16 bg-white rounded-lg border border-gray-300 px-3 py-2 text-sm text-center focus:border-meti-teal focus:outline-none focus:ring-2 focus:ring-meti-teal/20 transition-colors"
                  onChange={(e) => setYTile(Number(e.target.value))}
                  value={yTile || 0}
                  min="1"
                  max="10"
                />
                <button
                  onClick={handleUpdateTile}
                  disabled={isProcessing}
                  className="px-6 py-2 rounded-lg bg-meti-orange text-white text-sm font-medium hover:bg-meti-orange/90 focus:outline-none focus:ring-2 focus:ring-meti-orange/20 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Layers */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6 shadow-sm">
          {/* Layers Panel */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <FaLayerGroup className="text-meti-teal text-lg" />
              <h3 className="text-lg font-serif text-meti-dark">Layers</h3>
            </div>

            <div className="bg-meti-cream rounded-xl p-4 space-y-2">
              {layers.map((layer, idx) => (
                <button
                  key={layer}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                    active === idx
                      ? "border-meti-teal bg-meti-teal text-white shadow-md"
                      : "border-gray-200 bg-white text-meti-dark hover:border-meti-teal/50 hover:bg-meti-teal/5"
                  }`}
                  onClick={() => setActive(idx)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${layerColors[idx]} ${
                        active === idx ? "bg-white" : ""
                      }`}
                    />
                    <span>{layer}</span>
                  </div>
                  <Eye
                    className={`w-4 h-4 ${
                      active === idx ? "text-white" : "text-meti-dark/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Layer Properties */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-meti-dark">
              Layer Properties
            </h3>
            <div className="bg-meti-cream rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-meti-dark mb-2">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="100"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-meti-dark mb-2">
                  Blend Mode
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-meti-teal/20 focus:border-meti-teal bg-white">
                  <option>Normal</option>
                  <option>Multiply</option>
                  <option>Screen</option>
                  <option>Overlay</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Actions */}

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              className="w-full bg-meti-teal text-white py-4 px-6 rounded-xl font-semibold hover:bg-meti-teal/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={handleGenerate}
            >
              <div className="flex items-center justify-center space-x-2">
                <Save className="w-5 h-5" />
                <span>SAVE DESIGN</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDesignPage;
