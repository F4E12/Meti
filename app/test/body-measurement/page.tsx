"use client";

import type React from "react";
import { useState } from "react";
import {
  ArrowLeft,
  Upload,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/headers/header";

export interface MeasurementData {
  [key: string]: string;
}

export interface ApiResults {
  measurements: MeasurementData;
  image_url: string;
}

const API_URL = "http://127.0.0.1:5000/api/process-image";

export default function PoseMeasurementToolPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<ApiResults | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setResults(null);
      setError("");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setError("");
        setResults(null);
      } else {
        setError("Please upload an image file (PNG or JPEG)");
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResults(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }

      setResults(data as ApiResults);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setResults(null);
    setError("");
    setIsLoading(false);
  };

  const saveMeasurementsToProfile = () => {
    if (results) {
      console.log("Saving measurements:", results.measurements);
      router.push("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-meti-cream">
      {/* Header */}
      <Header />

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-meti-teal rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-serif text-meti-dark mb-4">
            🧍‍♂️ Pose Measurement Tool
          </h1>
          <p className="text-meti-dark/70 max-w-3xl mx-auto text-lg leading-relaxed">
            Upload an image with a person and a reference coin to automatically
            extract body measurements for your personalized apparel.
          </p>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-meti-teal/20 p-8 mb-12">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-meti-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-meti-teal" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-meti-dark mb-4">
                📋 Instructions for Best Results
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-meti-dark/70">
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-meti-teal font-bold">•</span>
                    <span>
                      Include a coin (quarter, penny, etc.) in the image for
                      scale reference
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-meti-teal font-bold">•</span>
                    <span>
                      Stand straight with arms slightly away from your body
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-meti-teal font-bold">•</span>
                    <span>
                      Ensure good lighting and clear visibility of your full
                      body
                    </span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-meti-orange font-bold">•</span>
                    <span>Wear fitted clothing for accurate measurements</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-meti-orange font-bold">•</span>
                    <span>Take the photo from about 6-8 feet away</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-meti-orange font-bold">•</span>
                    <span>Use a plain background for better detection</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {!results ? (
          /* Upload Section */
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-meti-teal bg-meti-teal/10 scale-105"
                    : selectedFile
                    ? "border-meti-teal bg-meti-teal/5"
                    : "border-gray-300 hover:border-meti-teal hover:bg-meti-teal/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />

                <div className="space-y-6">
                  <div className="w-20 h-20 bg-meti-teal/10 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-10 h-10 text-meti-teal" />
                  </div>

                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-3 text-meti-teal">
                        <CheckCircle className="w-6 h-6" />
                        <span className="text-xl font-semibold">
                          File Selected
                        </span>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-meti-teal/20 max-w-md mx-auto">
                        <p className="text-meti-dark font-semibold text-lg">
                          {selectedFile.name}
                        </p>
                        <p className="text-meti-dark/60 text-sm mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="mt-4 flex items-center space-x-2 text-meti-teal text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Ready for analysis</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-serif text-meti-dark">
                        Drop your image here or click to browse
                      </h3>
                      <p className="text-meti-dark/60">
                        Supports PNG and JPEG files up to 10MB
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-sm text-meti-dark/50">
                        <span>Drag & Drop</span>
                        <span>•</span>
                        <span>Click to Upload</span>
                        <span>•</span>
                        <span>High Quality Images</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start space-x-4">
                  <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 font-semibold text-lg">
                      Error
                    </h4>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="w-full bg-meti-teal text-white py-6 px-8 rounded-xl text-lg font-semibold hover:bg-meti-teal/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Analyzing Image...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-6 h-6" />
                    <span>Analyze Image</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            {/* Success Message */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-green-800 font-semibold text-lg">
                  Analysis Complete!
                </h4>
                <p className="text-green-700 mt-1">
                  Your measurements have been extracted successfully.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Processed Image */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-2xl font-serif text-meti-dark mb-6 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-meti-teal/10 rounded-full flex items-center justify-center">
                    <Camera className="w-4 h-4 text-meti-teal" />
                  </div>
                  <span>Processed Image</span>
                </h3>
                <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                  <img
                    src={results.image_url || "/placeholder.svg"}
                    alt="Processed pose with measurements"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-meti-dark/60 text-sm mt-4 text-center bg-meti-cream rounded-lg p-3">
                  Image processed with pose detection and measurement points
                </p>
              </div>

              {/* Measurements Table */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h3 className="text-2xl font-serif text-meti-dark mb-6 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-meti-orange/10 rounded-full flex items-center justify-center">
                    <Download className="w-4 h-4 text-meti-orange" />
                  </div>
                  <span>Extracted Measurements</span>
                </h3>

                <div className="space-y-3 mb-8">
                  {Object.entries(results.measurements).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-4 px-4 bg-meti-cream rounded-lg border border-gray-100 hover:border-meti-teal/30 transition-colors"
                    >
                      <span className="text-meti-dark font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-meti-teal font-bold text-xl">
                          {value}
                        </span>
                        <span className="text-meti-dark/60 text-sm">cm</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={saveMeasurementsToProfile}
                    className="flex-1 bg-meti-teal text-white py-4 px-6 rounded-xl font-semibold hover:bg-meti-teal/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Save to Profile
                  </button>
                  <button
                    onClick={resetTool}
                    className="flex-1 border-2 border-gray-300 text-meti-dark py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 hover:border-meti-teal transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try Another</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Accuracy Note */}
            <div className="bg-meti-orange/10 border-2 border-meti-orange/20 rounded-xl p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-meti-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-meti-orange" />
                </div>
                <div>
                  <h4 className="text-meti-dark font-semibold text-lg mb-2">
                    📏 Measurement Accuracy
                  </h4>
                  <p className="text-meti-dark/70 leading-relaxed">
                    These measurements are automatically extracted using AI pose
                    detection. For the most accurate fit, we recommend having
                    these measurements verified by a professional tailor or
                    using traditional measuring methods as a secondary
                    confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
