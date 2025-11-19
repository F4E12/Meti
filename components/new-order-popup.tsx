import { User } from "@/lib/model/user";
import { useEffect, useState } from "react";
import TailorDropdown from "./tailor-dropdown";
import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

interface OrderForm {
  tailor_id: string;
  design_url: string;
  shipping_address: string;
}

interface NewOrderPopupProps {
  onClose: () => void;
  isOpen: boolean;
  image?: string;
}

const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const NewOrderPopup: React.FC<NewOrderPopupProps> = ({
  onClose,
  isOpen,
  image,
}) => {
  const [tailors, setTailors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OrderForm>({
    tailor_id: "",
    design_url: "",
    shipping_address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // 1. Fetch Tailors on Component Mount
  useEffect(() => {
    if (!isOpen) {
      setFormData({ tailor_id: "", design_url: "", shipping_address: "" });
      setSubmitMessage(null);
      return;
    }

    const fetchTailors = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        // NOTE: Replace '/api/tailors' with your actual endpoint if different
        const response = await fetch("/api/tailors");
        if (!response.ok) {
          throw new Error(`Failed to fetch tailors (${response.status})`);
        }
        const data = await response.json();
        console.log("Fetched tailors:", data);
        // Assuming the response body is { tailors: User[] }
        setTailors(data.tailors || []);
      } catch (e) {
        if (e instanceof Error) {
          setFetchError(e.message);
        } else {
          setFetchError("An unknown error occurred while loading tailors.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTailors();
  }, [isOpen]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    // Design URL
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await (await supabase).auth.getUser();
    const userId = user?.id;

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!userId) return;

    setIsUploading(true);
    let path = "";
    try {
      // 1. Convert the Base64 Data URL to a Blob
      console.log("IMAGEEE:", image);
      const imageBlob = dataURLtoBlob(image || "");

      // 2. Define the storage path, ensuring the filename is sanitized and appended with .png
      const sanitizedFilename = userId + new Date().toISOString();
      path = `user_designs/${userId}/${sanitizedFilename}.png`;

      // 3. Upload to Supabase Storage (Mocked call)
      const { data, error } = await supabase.storage
        .from("meti.storage") // Assuming your bucket name is 'user_designs'
        .upload(path, imageBlob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase Upload Error:", error);
        alert(`Order failed: ${error.message}. Check console for details.`);
      } else {
        console.log("Export Successful!", data);
        // alert(`Design successfully exported to Supabase Storage as ${path}.`);
      }
    } catch (error) {
      console.error("General Export Error:", error);
      //   alert("An unexpected error occurred during export.");
    } finally {
      setIsUploading(false);
    }

    const { data: publicUrlData } = supabase.storage
      .from("meti.storage")
      .getPublicUrl(path);

    // Basic client-side validation
    if (!formData.tailor_id || !formData.shipping_address) {
      setSubmitMessage("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    console.log(formData, publicUrlData.publicUrl);

    try {
      // NOTE: Replace '/api/orders' with your actual endpoint if different
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tailor_id: formData.tailor_id,
          design_url: publicUrlData.publicUrl,
          address: formData.shipping_address,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage(`Order successfully placed!`);
        // Clear form after successful submission
        setFormData({ tailor_id: "", design_url: "", shipping_address: "" });
        // Optional: close the popup after a brief delay
        // setTimeout(onClose, 2000);
      } else {
        setSubmitMessage(
          `Error placing order: ${result.error || "Unknown error"}`
        );
      }
    } catch (error) {
      setSubmitMessage("A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Backdrop/Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-indigo-600 text-white rounded-t-xl">
          <h2 className="text-xl font-bold">Place New Order</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-indigo-200 transition"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form className="p-6" onSubmit={handleSubmit}>
          {/* Loading/Error State for Tailors */}
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 inline-block"></div>
              <p className="mt-2 text-sm text-gray-600">
                Loading available tailors...
              </p>
            </div>
          ) : fetchError ? (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg"
              role="alert"
            >
              <p className="font-bold">Error Loading Tailors</p>
              <p className="text-sm">{fetchError}</p>
            </div>
          ) : tailors.length === 0 ? (
            <div
              className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-lg"
              role="alert"
            >
              <p className="font-bold">No Tailors Available</p>
              <p className="text-sm">Cannot place an order at this time.</p>
            </div>
          ) : (
            <>
              {/* User Dropdown */}
              <TailorDropdown
                tailors={tailors}
                selectedId={formData.tailor_id}
                onSelect={(id) =>
                  setFormData((prev) => ({ ...prev, tailor_id: id }))
                }
                disabled={isSubmitting}
              />

              {/* Design URL Input
              <div className="mb-4">
                <label
                  htmlFor="design_url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Design Link (URL)
                </label>
                <input
                  type="url"
                  id="design_url"
                  value={formData.design_url}
                  onChange={handleChange}
                  required
                  placeholder="e.g., https://dribbble.com/my-design-sketch.jpg"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
                />
              </div> */}

              {/* Address Input */}
              <div className="mb-6">
                <label
                  htmlFor="shipping_address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Shipping Address
                </label>
                <textarea
                  id="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Street, City, Zip Code"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none disabled:bg-gray-50"
                />
              </div>

              {/* Submission Message */}
              {submitMessage && (
                <div
                  className={`p-3 mb-4 rounded-lg ${
                    submitMessage.includes("Error")
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  <p className="text-sm font-medium">{submitMessage}</p>
                </div>
              )}
            </>
          )}

          {/* Modal Footer (Buttons) */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting || tailors.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrderPopup;
