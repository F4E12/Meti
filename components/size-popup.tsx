"use client";

import { X } from "lucide-react";
import { redirect } from "next/navigation";

interface SizeData {
  right_arm_length: number;
  shoulder_width: number;
  left_arm_length: number;
  upper_body_height: number;
  hip_width: number;
}

interface SizePopupProps {
  sizeData: SizeData;
  onClose: () => void;
}

export default function SizePopup({ sizeData, onClose }: SizePopupProps) {
  const measurements = [
    { label: "Right Arm Length", value: sizeData.right_arm_length, unit: "cm" },
    { label: "Left Arm Length", value: sizeData.left_arm_length, unit: "cm" },
    { label: "Shoulder Width", value: sizeData.shoulder_width, unit: "cm" },
    {
      label: "Upper Body Height",
      value: sizeData.upper_body_height,
      unit: "cm",
    },
    { label: "Hip Width", value: sizeData.hip_width, unit: "cm" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif text-meti-dark">
            Your Measurements
          </h2>
          <button
            onClick={onClose}
            className="text-meti-dark/60 hover:text-meti-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-meti-dark/70 text-sm mb-6">
            These measurements are used to create your personalized apparel with
            the perfect fit.
          </p>

          <div className="space-y-4">
            {measurements.map((measurement, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-meti-dark font-medium">
                  {measurement.label}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-meti-teal font-semibold text-lg">
                    {measurement.value}
                  </span>
                  <span className="text-meti-dark/60 text-sm">
                    {measurement.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual representation */}
          <div className="mt-8 p-4 bg-meti-cream rounded-lg">
            <div className="text-center">
              <div className="w-16 h-20 bg-meti-teal/20 rounded-lg mx-auto mb-3 relative">
                <div className="absolute inset-2 border-2 border-meti-teal rounded"></div>
              </div>
              <p className="text-meti-dark/70 text-xs">
                Measurements ensure perfect fit for your handcrafted apparel
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              className="flex-1 bg-meti-teal text-white py-2 px-4 rounded hover:bg-meti-teal/90 transition-colors text-sm"
              onClick={redirect("/measure")}
            >
              Update Measurements
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-meti-dark py-2 px-4 rounded hover:bg-gray-50 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
