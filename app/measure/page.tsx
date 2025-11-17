// MeasurePage.tsx

"use client";

import type React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Camera,
  Upload,
  Save,
  Info,
  Download,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/headers/header";
import { User } from "@/lib/model/user";

export default function MeasurePage() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) {
          console.error("Failed to fetch user:", res.statusText);
          return null;
        }
        const data: { user: User } = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraMode, setCameraMode] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState({
    right_arm_length: "",
    shoulder_width: "",
    left_arm_length: "",
    upper_body_height: "",
    hip_width: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showManualInput, setShowManualInput] = useState(false);

  const measurementFields = [
    {
      key: "right_arm_length",
      label: "Right Arm Length",
      description: "Measure from shoulder to wrist",
      placeholder: "e.g., 58.5",
    },
    {
      key: "left_arm_length",
      label: "Left Arm Length",
      description: "Measure from shoulder to wrist",
      placeholder: "e.g., 58.0",
    },
    {
      key: "shoulder_width",
      label: "Shoulder Width",
      description: "Measure across both shoulders",
      placeholder: "e.g., 42.0",
    },
    {
      key: "upper_body_height",
      label: "Upper Body Height",
      description: "Measure from shoulder to waist",
      placeholder: "e.g., 65.5",
    },
    {
      key: "hip_width",
      label: "Hip Width",
      description: "Measure around the widest part of hips",
      placeholder: "e.g., 38.5",
    },
  ];

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Unable to access camera. Please check permissions or use file upload instead."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
    setShowManualInput(false); // Reset manual input visibility on retake
  }, [startCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        stopCamera();
        setCameraMode(true);
        setShowManualInput(false); // Reset manual input visibility on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    Object.entries(measurements).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = "This measurement is required";
      } else if (isNaN(Number(value)) || Number(value) <= 0) {
        newErrors[key] = "Please enter a valid positive number";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    // Prepare data by mapping local keys to API keys
    // The measurement keys already match the database columns (right_arm_length, shoulder_width, etc.)
    const measurementPayload = {
      username: user?.username, // Placeholder, replace with actual username if needed
      email: user?.email, // Placeholder, replace with actual email if needed
      right_arm_length: measurements.right_arm_length,
      shoulder_width: measurements.shoulder_width,
      left_arm_length: measurements.left_arm_length,
      upper_body_height: measurements.upper_body_height,
      hip_width: measurements.hip_width,
      // You might also need to include the user's current role, username, and email
      // if your /api/user/update route expects them for validation.
      // For a simple measurement update, we'll focus on the required measurement fields.
      // If the API requires username/email, you'd need to fetch them or pass them down as props.
    };

    try {
      // Show loading state (if you implement one)
      // setLoading(true);

      const response = await fetch("/api/user/update", {
        method: "POST", // Use POST method as defined in /api/user/update/route.ts
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(measurementPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Update Error:", errorData.error);
        alert(
          `Failed to save measurements: ${errorData.error || "Unknown error"}`
        );
        return;
      }

      // Success: Log the result and navigate
      const result = await response.json();
      console.log("Measurements saved successfully:", result.user);

      // Navigate to the profile page
      router.push("/profile");
    } catch (error) {
      console.error("Network or Unexpected Error:", error);
      alert("An unexpected error occurred while saving.");
    } finally {
      // Hide loading state
      // setLoading(false);
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid data URL format");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const processWithAI = async () => {
    if (!capturedImage) {
      alert("Please capture or upload an image first.");
      return;
    }

    try {
      // 1. Convert Data URL to a File object
      // Use the helper function to create a File object from the captured image Data URL
      const imageFile = dataURLtoFile(capturedImage, "measurement_photo.jpg");

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", imageFile);

      // 2. Make the API Call
      const response = await fetch("http://127.0.0.1:5000/api/process-image", {
        method: "POST",
        body: formData, // Automatically sets Content-Type to multipart/form-data
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("AI Processing Error:", result.error);
        alert(`Error processing image: ${result.error || "Unknown error"}`);
        return;
      }

      // 3. Update State with Measurements and Annotated Image
      const formattedMeasurements = {
        right_arm_length: result.measurements["Right arm length"],
        shoulder_width: result.measurements["Shoulder width"],
        left_arm_length: result.measurements["Left arm length"],
        upper_body_height: result.measurements["Upper body height"],
        hip_width: result.measurements["Hip width"],
      };

      setMeasurements(formattedMeasurements);
      // setCapturedImage(result.image_url); // Update to show the annotated image URL
      setShowManualInput(true);
    } catch (error) {
      console.error("Network or Conversion Error:", error);
      alert("An unexpected error occurred during image processing.");
    }
  };

  // Logic to determine if the Manual Input section should be visible
  const shouldShowManualInput = showManualInput || !cameraMode || capturedImage;

  return (
    <div className="min-h-screen bg-meti-cream">
      {/* Header */}
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-meti-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif text-meti-dark mb-4">
            Body Measurement Tool
          </h1>
          <p className="text-meti-dark/70 max-w-2xl mx-auto">
            Take a photo or upload an image to automatically extract your body
            measurements, or input them manually.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 flex">
            <button
              onClick={() => {
                setCameraMode(true);
                setShowManualInput(false);
                if (!capturedImage) startCamera(); // Only start if no image is present
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                cameraMode
                  ? "bg-meti-teal text-white"
                  : "text-meti-dark hover:bg-gray-100"
              }`}
            >
              Camera
            </button>
            <button
              onClick={() => {
                setCameraMode(false);
                stopCamera();
                setShowManualInput(true); // Show manual input when switching to upload mode
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                !cameraMode
                  ? "bg-meti-teal text-white"
                  : "text-meti-dark hover:bg-gray-100"
              }`}
            >
              Upload
            </button>
          </div>
        </div>

        {cameraMode ? (
          /* Camera Mode */
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <div className="relative">
              {/* Camera Viewfinder */}
              <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
                {capturedImage ? (
                  /* Captured Image Display */
                  <div className="relative w-full h-full">
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 rounded-lg px-4 py-2">
                        <span className="text-meti-teal font-medium">
                          measure
                        </span>
                      </div>
                    </div>
                  </div>
                ) : isStreaming ? (
                  /* Live Camera Feed */
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          videoRef.current.play();
                        }
                      }}
                    />
                    {/* Viewfinder Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-80 h-80">
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-meti-teal rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-meti-teal rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-meti-teal rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-meti-teal rounded-br-lg"></div>

                        {/* Center text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/90 rounded-lg px-4 py-2">
                            <span className="text-meti-teal font-medium">
                              measure
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Camera Not Started */
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-meti-teal mx-auto mb-4" />
                      <p className="text-meti-dark/70 mb-4">
                        Camera not started
                      </p>
                      <button
                        onClick={startCamera}
                        className="bg-meti-teal text-white px-6 py-2 rounded-lg hover:bg-meti-teal/90 transition-colors"
                      >
                        Start Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-meti-teal/20 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-meti-pink/20 rounded-full"></div>

              {/* Curved decorative lines */}
              <svg
                className="absolute top-0 right-0 w-32 h-16 text-meti-pink"
                viewBox="0 0 120 60"
              >
                <path
                  d="M0,30 Q60,0 120,30"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center">
              <p className="text-meti-dark/70 text-sm mb-4">
                Please input a reference object for measure before using the
                tool
              </p>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                {capturedImage ? (
                  <>
                    <button
                      onClick={retakePhoto}
                      className="flex items-center space-x-2 px-6 py-3 border border-meti-teal text-meti-teal rounded-lg hover:bg-meti-teal/5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake</span>
                    </button>
                    <button
                      onClick={processWithAI}
                      className="flex items-center space-x-2 bg-meti-teal text-white px-6 py-3 rounded-lg hover:bg-meti-teal/90 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Process Image</span>
                    </button>
                  </>
                ) : isStreaming ? (
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-meti-orange rounded-full flex items-center justify-center hover:bg-meti-orange/90 transition-colors shadow-lg"
                  >
                    <div className="w-12 h-12 bg-white rounded-full"></div>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          /* Upload Mode */
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-meti-teal hover:bg-meti-teal/5 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-16 h-16 text-meti-teal mx-auto mb-4" />
              <p className="text-meti-dark font-medium mb-2">
                Upload your photo
              </p>
              <p className="text-meti-dark/60 text-sm">
                Click to browse or drag and drop
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            {/* Display uploaded image thumbnail in Upload Mode only if no image is captured in camera mode */}
            {/* If you want to show a preview here, you would need a separate state variable for upload preview.
                For now, we direct the user to the Camera Tab after upload.
            */}
          </div>
        )}

        {/* Manual Input Section */}
        {shouldShowManualInput && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-meti-dark">
                Manual Measurements
              </h2>
              <Info className="w-5 h-5 text-meti-teal" />
            </div>

            <div className="space-y-6">
              {measurementFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-meti-dark mb-2">
                    {field.label}
                  </label>
                  <p className="text-xs text-meti-dark/60 mb-3">
                    {field.description}
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      placeholder={field.placeholder}
                      value={
                        measurements[field.key as keyof typeof measurements]
                      }
                      onChange={(e) =>
                        handleInputChange(field.key, e.target.value)
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-meti-teal/20 focus:border-meti-teal transition-colors ${
                        errors[field.key] ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-meti-dark/60 text-sm">
                      cm
                    </span>
                  </div>
                  {errors[field.key] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[field.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => router.back()}
                className="flex-1 border border-gray-300 text-meti-dark py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-meti-teal text-white py-3 px-6 rounded-lg hover:bg-meti-teal/90 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Measurements</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
