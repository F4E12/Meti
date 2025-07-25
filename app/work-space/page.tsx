"use client";

import type React from "react";
import { ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import {
  Plus,
  Upload,
  X,
  Tag,
  Package,
  Clock,
  CheckCircle,
  UserCheck,
  Scissors,
} from "lucide-react";
import axios from "axios";
import Header from "@/components/headers/header";

export default function WorkspacePage() {
  const [showNewDesignModal, setShowNewDesignModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<"design" | "person">("design");
  const [newDesign, setNewDesign] = useState({
    name: "",
    image: null as File | null,
    extractedDesign: null as string | null,
    // Changed to store an array of tag IDs (numbers)
    tags: [] as number[],
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for orders
  const orders = [
    {
      id: "ORD-001",
      customerName: "Sarah Johnson",
      item: "Batik Jacket",
      status: "pending",
      date: "2024-01-15",
      price: 299,
    },
    {
      id: "ORD-002",
      customerName: "Michael Chen",
      item: "Traditional Dress",
      status: "in_progress",
      date: "2024-01-14",
      price: 459,
    },
  ];

  // Modified available tags to be an array of objects with id and name
  const availableTags = [
    { id: 1, name: "Geometric" },
    { id: 2, name: "Floral" },
    { id: 3, name: "Animal" },
    { id: 4, name: "Contemporary" },
    { id: 5, name: "Abstract" },
  ];

  // Create a Map for quick lookup of tag names by ID
  const tagMap = new Map(availableTags.map((tag) => [tag.id, tag.name]));

  // Current designs (data structure remains for display purposes)
  const currentDesigns = [
    {
      id: 1,
      name: "Traditional Batik Jacket",
      image: "/images/batik-dummy.jpg",
      tags: ["Batik", "Traditional", "Jacket"],
      color: "bg-meti-teal",
    },
    {
      id: 2,
      name: "Modern Woven Dress",
      image: "/images/batik-dummy.jpg",
      tags: ["Modern", "Dress", "Handwoven"],
      color: "bg-meti-orange",
    },
    {
      id: 3,
      name: "Festival Ceremonial Robe",
      image: "/images/batik-dummy.jpg",
      tags: ["Festival", "Traditional", "Formal"],
      color: "bg-meti-pink",
    },
    {
      id: 4,
      name: "Casual Batik Shirt",
      image: "/images/batik-dummy.jpg",
      tags: ["Batik", "Casual", "Shirt"],
      color: "bg-meti-teal",
    },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewDesign((prev) => ({ ...prev, image: file, extractedDesign: null }));
    }
  };

  // Modified to toggle tag IDs (numbers) instead of names (strings)
  const handleTagToggle = (tagId: number) => {
    setNewDesign((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleExtractDesign = async () => {
    if (!newDesign.image) return;

    setIsExtracting(true);
    const formData = new FormData();
    formData.append("image", newDesign.image);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/extract-patch",
        formData,
        { responseType: "blob" }
      );
      const imageUrl = URL.createObjectURL(res.data);
      setNewDesign((prev) => ({
        ...prev,
        extractedDesign: imageUrl,
      }));
    } catch (error) {
      alert(error);
    }
    setIsExtracting(false);
  };

  const handleCreateDesign = async () => {
    const designImage =
      uploadMode === "person" ? newDesign.extractedDesign : newDesign.image;

    if (newDesign.name && designImage) {
      const res = await fetch("/api/tailors/create-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDesign.name,
          image: designImage,
          extractedDesign: newDesign.extractedDesign,
          tags: newDesign.tags, // This now sends an array of IDs, e.g., [1, 3]
        }),
      });

      const result = await res.json();
      if (res.ok) {
        console.log("✅ Design saved:", result.data);
        setShowNewDesignModal(false);
        setNewDesign({
          name: "",
          image: null,
          extractedDesign: null,
          tags: [],
        });
        setUploadMode("design");
      } else {
        console.error("❌ Error saving design:", result.error);
      }
    }
  };

  const resetModal = () => {
    setShowNewDesignModal(false);
    setNewDesign({ name: "", image: null, extractedDesign: null, tags: [] });
    setUploadMode("design");
    setIsExtracting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <Package className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      <div className="max-w-7xl mx-auto px-12 py-16">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-serif text-meti-dark">
              Your Workspace
            </h1>
            <div className="w-12 h-12 bg-meti-teal rounded-xl"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-12">
          <button
            onClick={() => setShowOrdersModal(true)}
            className="relative bg-white border-2 border-gray-300 text-meti-dark px-6 py-3 rounded-full font-medium hover:border-meti-teal hover:text-meti-teal transition-colors flex items-center space-x-2"
          >
            <span>orders</span>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-meti-teal text-white rounded-full flex items-center justify-center text-xs font-bold">
              {orders.length}
            </div>
          </button>
          <button
            onClick={() => setShowNewDesignModal(true)}
            className="bg-white border-2 border-gray-300 text-meti-dark px-6 py-3 rounded-full font-medium hover:border-meti-teal hover:text-meti-teal transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>new</span>
          </button>
        </div>

        {/* Current Designs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {currentDesigns.map((design, index) => {
            const imageUrls = [
              "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/batik_creations/Firefly_generate%20Batik%20buttoned%20up%20shirt%20put%20on%20a%20manequin%20no%20head,%20in%20the%20color%20of%20brown,%20wh%20122594.jpg",
              "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/batik_creations/Firefly_generate%20Batik%20buttoned%20up%20shirt%20put%20on%20a%20manequin%20no%20head,%20in%20the%20color%20of%20dark%20blue%20122594.jpg",
              "https://znesmqivmcecevioaejc.supabase.co/storage/v1/object/public/meti.storage/batik_creations/Firefly_generate%20Batik%20lots%20of%20motif%20%20buttoned%20up%20shirt%20put%20on%20a%20manequin%20no%20head,%20in%20the%20col%20102797.jpg",
            ];
            const imageUrl = imageUrls[index % imageUrls.length]; // Cycle through images if more designs than images

            return (
              <div
                key={design.id}
                className="aspect-[4/5] rounded-2xl relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={imageUrl}
                  alt={design.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-white font-semibold text-sm mb-2">
                    {design.name}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {design.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/20 text-white text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {design.tags.length > 2 && (
                      <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                        +{design.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Orders Modal */}
      {showOrdersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-serif text-meti-dark">
                Incoming Orders
              </h2>
              <button
                onClick={() => setShowOrdersModal(false)}
                className="text-meti-dark/60 hover:text-meti-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-meti-dark">
                          {order.id}
                        </span>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="capitalize">
                            {order.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <span className="text-meti-teal font-semibold">
                        ${order.price}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-meti-dark/70">Customer</p>
                        <p className="font-medium text-meti-dark">
                          {order.customerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-meti-dark/70">Item</p>
                        <p className="font-medium text-meti-dark">
                          {order.item}
                        </p>
                      </div>
                      <div>
                        <p className="text-meti-dark/70">Order Date</p>
                        <p className="font-medium text-meti-dark">
                          {order.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Design Modal */}
      {showNewDesignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-serif text-meti-dark">
                Create New Design
              </h2>
              <button
                onClick={resetModal}
                className="text-meti-dark/60 hover:text-meti-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Design Name */}
              <div>
                <label className="block text-sm font-medium text-meti-dark mb-2">
                  Design Name
                </label>
                <input
                  type="text"
                  value={newDesign.name}
                  onChange={(e) =>
                    setNewDesign((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter design name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-meti-teal/20 focus:border-meti-teal transition-colors"
                />
              </div>

              {/* Upload Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-meti-dark mb-3">
                  Upload Mode
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setUploadMode("design")}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                      uploadMode === "design"
                        ? "bg-white text-meti-teal shadow-sm"
                        : "text-meti-dark hover:text-meti-teal"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload Design</span>
                  </button>
                  <button
                    onClick={() => setUploadMode("person")}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                      uploadMode === "person"
                        ? "bg-white text-meti-teal shadow-sm"
                        : "text-meti-dark hover:text-meti-teal"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Person with Shirt</span>
                  </button>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-meti-dark mb-2">
                    {uploadMode === "design"
                      ? "Design Image"
                      : "Person with Shirt Image"}
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-meti-teal hover:bg-meti-teal/5 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {newDesign.image ? (
                      <div className="space-y-3">
                        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={
                              URL.createObjectURL(newDesign.image) ||
                              "/placeholder.svg"
                            }
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-meti-dark font-medium">
                          {newDesign.image.name}
                        </p>
                        <p className="text-meti-dark/60 text-sm">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-meti-teal mx-auto" />
                        <p className="text-meti-dark font-medium">
                          {uploadMode === "design"
                            ? "Upload design image"
                            : "Upload person with shirt"}
                        </p>
                        <p className="text-meti-dark/60 text-sm">
                          Click to browse or drag and drop
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Extract Button for Person Mode */}
                  {uploadMode === "person" &&
                    newDesign.image &&
                    !newDesign.extractedDesign && (
                      <div className="mt-4">
                        <button
                          onClick={handleExtractDesign}
                          disabled={isExtracting}
                          className="w-full bg-meti-orange text-white py-3 px-4 rounded-lg hover:bg-meti-orange/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                        >
                          {isExtracting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Extracting...</span>
                            </>
                          ) : (
                            <>
                              <Scissors className="w-4 h-4" />
                              <span>Extract Shirt Design</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                </div>

                {/* Extracted Design Preview */}
                {uploadMode === "person" && (
                  <div>
                    <label className="block text-sm font-medium text-meti-dark mb-2">
                      Extracted Design
                    </label>
                    <div className="border-2 border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                      {newDesign.extractedDesign ? (
                        <div className="space-y-3">
                          <div className="w-full bg-white rounded-lg aspect-square overflow-hidden shadow-sm">
                            <img
                              src={
                                newDesign.extractedDesign || "/placeholder.svg"
                              }
                              alt="Extracted design"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Design extracted successfully!
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-gray-400">
                          <Scissors className="w-8 h-8 mx-auto" />
                          <p className="font-medium">
                            Extracted design will appear here
                          </p>
                          <p className="text-sm">
                            Upload an image and click &quot;Extract Shirt
                            Design&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-meti-dark mb-3">
                  Tags
                </label>
                {/* Modified to map over array of objects */}
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {availableTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newDesign.tags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="w-4 h-4 text-meti-teal border-gray-300 rounded focus:ring-meti-teal/20"
                      />
                      <span className="text-sm text-meti-dark">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Selected Tags Display */}
              {/* Modified to look up tag name from the tagMap */}
              {newDesign.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-meti-dark mb-2">
                    Selected Tags:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {newDesign.tags.map((tagId) => (
                      <span
                        key={tagId}
                        className="bg-meti-teal/10 text-meti-teal px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tagMap.get(tagId)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={resetModal}
                  className="flex-1 border border-gray-300 text-meti-dark py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDesign}
                  disabled={
                    !newDesign.name ||
                    (uploadMode === "design" && !newDesign.image) ||
                    (uploadMode === "person" && !newDesign.extractedDesign)
                  }
                  className="flex-1 bg-meti-teal text-white py-3 px-6 rounded-lg hover:bg-meti-teal/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Create Design
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
