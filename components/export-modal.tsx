import { useState } from "react";

type ExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filename: string) => void;
  isUploading?: boolean;
  title: string;
};

export const ExportModal = ({
  isOpen,
  onClose,
  onConfirm,
  isUploading = false,
  title,
}: ExportModalProps) => {
  const [filename, setFilename] = useState(
    title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .toLowerCase() + "_design"
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
        <h3 className="text-xl font-serif text-meti-dark mb-4 border-b pb-2">
          Export Design
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter a filename for your design. The file will be saved as a PNG
          image in your Supabase storage.
        </p>

        <div className="mb-6">
          <label
            htmlFor="filename-input"
            className="block text-sm font-medium text-meti-dark mb-2"
          >
            Filename
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-meti-teal transition-all bg-meti-cream">
            <input
              id="filename-input"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              disabled={isUploading}
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none"
            />
            <span className="text-gray-500 pr-4 text-sm">.png</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-meti-dark/70 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(filename)}
            disabled={isUploading || !filename.trim()}
            className="px-6 py-2 rounded-lg bg-meti-teal text-white font-medium hover:bg-meti-teal/90 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
          >
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              <span>Export and Save</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
