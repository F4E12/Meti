"use client";

import type React from "react";
import { ImageIcon, Tag as TagIcon } from "lucide-react";
import { useState, useRef, useEffect, MouseEvent } from "react";
import {
  Plus,
  Upload,
  X,
  Package,
  Clock,
  CheckCircle,
  UserCheck,
  Scissors,
} from "lucide-react";
import axios from "axios";
import Header from "@/components/headers/header";
import { createClient } from "@/lib/supabase/client";
import { Design } from "@/lib/model/design";
import { Tag } from "@/lib/model/tag";

export default function WorkspacePage() {
  const [showNewDesignModal, setShowNewDesignModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<"design" | "person">("design");
  const [newDesign, setNewDesign] = useState({
    name: "",
    image: null as File | null,
    extractedDesign: null as string | null,
    tags: [] as number[],
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabaseBrowser = createClient();

  // Real designs state
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Fetch designs on mount
  useEffect(() => {
    async function fetchTags() {
      try {
        const { data, error } = await supabaseBrowser
          .from("tags")
          .select("tag_id, name")
          .order("name");

        if (error) throw error;

        const formatted = data.map((t) => ({
          id: t.tag_id,
          name: t.name,
        }));
        setAvailableTags(formatted);
      } catch (err) {
        console.error("Failed to load tags:", err);
      } finally {
        setLoadingTags(false);
      }
    }

    fetchTags();
  }, []);

  useEffect(() => {
    async function fetchMyDesigns() {
      setLoadingDesigns(true);
      try {
        const {
          data: { user },
        } = await supabaseBrowser.auth.getUser();

        if (!user) {
          setLoadingDesigns(false);
          return;
        }

        console.log("User: ", user);
        console.log("userId: ", user.id);

        const res = await fetch(`/api/tailors/${user.id}/all-designs`);
        const json = await res.json();

        if (res.ok && json.designs) {
          setDesigns(json.designs);
        } else {
          console.error(
            "Failed to load designs:",
            json.error || "Unknown error"
          );
        }
      } catch (err) {
        console.error("Error fetching designs:", err);
      } finally {
        setLoadingDesigns(false);
      }
    }

    fetchMyDesigns();
  }, []);

  // Create a Map for quick lookup of tag names by ID
  const tagMap = new Map(availableTags.map((tag) => [tag.id, tag.name]));

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

  const handleDelete = async (e: MouseEvent, design: Design) => {
    e.stopPropagation();
    if (!confirm(`Delete "${design.name}"? This cannot be undone.`)) {
      return;
    }

    console.log("designId: ", design.id);

    try {
      // setDesigns((prev) => prev.filter((d) => d.id !== design.id));
      const res = await fetch(`/api/designs/${design.id}/delete`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to delete design");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
      window.location.reload();
    }
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
    if (!newDesign.name) return;

    const imageToUpload =
      uploadMode === "person"
        ? newDesign.extractedDesign
          ? await fetch(newDesign.extractedDesign).then((r) => r.blob()) // convert blob URL → Blob
          : null
        : newDesign.image;

    if (!imageToUpload) {
      alert("Please upload an image");
      return;
    }

    try {
      // 1. Upload to Supabase Storage directly from browser
      const fileExt = imageToUpload.type.split("/")[1] || "png";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await (
        await supabaseBrowser
      ).storage
        .from("meti.storage") // your bucket name
        .upload(`designs/${fileName}`, imageToUpload, {
          contentType: imageToUpload.type || "image/png",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload failed:", uploadError);
        alert("Failed to upload image: " + uploadError.message);
        return;
      }

      // 2. Get the public URL
      const {
        data: { publicUrl },
      } = (await supabaseBrowser).storage
        .from("meti.storage")
        .getPublicUrl(`designs/${fileName}`);

      // 3. Save design metadata + URL to database via API route
      const res = await fetch("/api/tailors/create-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDesign.name,
          imageUrl: publicUrl, // ← now a real URL!
          tags: newDesign.tags,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        console.log("Design saved:", result.data);
        resetModal();
        // Optionally refresh designs list
      } else {
        alert("Error saving design: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
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
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-serif text-meti-dark">
              Your Workspace
            </h1>
          </div>
        </div>

        <div className="flex space-x-4 mb-12">
          <button
            onClick={() => setShowNewDesignModal(true)}
            className="bg-white border-2 border-gray-300 text-meti-dark px-6 py-3 rounded-full font-medium hover:border-meti-teal hover:text-meti-teal transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>new</span>
          </button>
        </div>

        {/* REAL DESIGNS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {loadingDesigns ? (
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] bg-gray-200 rounded-2xl animate-pulse"
              />
            ))
          ) : designs.length === 0 ? (
            <div className="col-span-full text-center py-16 text-meti-dark/60">
              <p className="text-2xl mb-4">No designs yet</p>
              <p className="text-lg">
                Create your first design to get started!
              </p>
            </div>
          ) : (
            designs.map((design) => (
              <div
                key={design.id}
                className="aspect-[4/5] rounded-2xl relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                {/* --- Delete Button --- */}
                <button
                  onClick={(e) => handleDelete(e, design)}
                  className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                  title="Delete design"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* --- Card Content --- */}
                <img
                  src={design.image}
                  alt={design.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-colors" />
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
            ))
          )}
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
                {loadingTags ? (
                  <p className="text-sm text-meti-dark/60">Loading tags...</p>
                ) : availableTags.length === 0 ? (
                  <p className="text-sm text-meti-dark/60">No tags available</p>
                ) : (
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
                        <span className="text-sm text-meti-dark">
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
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
                        <TagIcon className="w-3 h-3" />
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
function setLoadingDesigns(arg0: boolean) {
  throw new Error("Function not implemented.");
}
