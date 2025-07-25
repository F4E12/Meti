"use client";

import type React from "react";

import CanvasEditor from "@/components/drag-design";
import ThreeShirtViewer from "@/components/tshirt-viewer";
import { useState, useEffect } from "react";
import { Upload, Layers, Save, Edit3, Grid3X3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/headers/header";

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
  const [isProcessing, setIsProcessing] = useState(false);

  const layers = [
    { id: 0, name: "Outside Collar", active: true },
    { id: 1, name: "Inside Collar", active: false },
    { id: 2, name: "Back", active: false },
    { id: 3, name: "Right Front", active: false },
    { id: 4, name: "Left Front", active: false },
    { id: 5, name: "Right Sleeve", active: false },
    { id: 6, name: "Left Sleeve", active: false },
  ];

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <Header />
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isEditTitle ? (
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditTitle(false)}
                onBlur={() => setIsEditTitle(false)}
                className="text-xl font-bold border-2 border-blue-500"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditTitle(true)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <Badge variant="secondary" className="text-sm">
            Design Mode
          </Badge>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-white border-r border-slate-200 p-6 space-y-6 overflow-y-auto">
          {/* Upload Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Upload Batik Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">
                  Click to upload image
                </span>
                <span className="text-xs text-slate-400">
                  PNG, JPG up to 10MB
                </span>
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </CardContent>
          </Card>

          {/* Tile Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-green-500" />
                Pattern Tiling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="x-tile" className="text-sm font-medium">
                    X Tiles
                  </Label>
                  <Input
                    id="x-tile"
                    type="number"
                    min="1"
                    max="10"
                    value={xTile || 1}
                    onChange={(e) => setXTile(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="y-tile" className="text-sm font-medium">
                    Y Tiles
                  </Label>
                  <Input
                    id="y-tile"
                    type="number"
                    min="1"
                    max="10"
                    value={yTile || 1}
                    onChange={(e) => setYTile(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleUpdateTile}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isProcessing ? "Processing..." : "Update Pattern"}
              </Button>
            </CardContent>
          </Card>

          {/* Layers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-500" />
                Layers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {layers.map((layer) => (
                  <Button
                    key={layer.id}
                    variant={active === layer.id ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setActive(layer.id)}
                  >
                    {layer.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="grid lg:grid-cols-2 rounded-2xl gap-6 h-max">
            {/* 3D Viewer */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">3D Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden">
                  <ThreeShirtViewer
                    combinedTextureFromCanvas={combinedTextureUrl}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Canvas Editor */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Design Canvas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden">
                  <CanvasEditor
                    active={active}
                    triggerGenerate={triggerGenerate}
                    setTriggerGenerate={setTriggerGenerate}
                    onTextureGenerated={handleCombinedTextureGenerated}
                    pattern={pattern}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Actions */}
        <div className="w-64 bg-white border-l border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Active Layer
            </h3>
            <Badge variant="outline" className="w-full justify-center py-2">
              {layers[active]?.name || "Unknown"}
            </Badge>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Design
            </Button>

            <Button variant="outline" className="w-full bg-transparent">
              Export
            </Button>

            <Button variant="outline" className="w-full bg-transparent">
              Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDesignPage;
