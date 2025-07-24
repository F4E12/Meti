"use client";

// src/App.tsx
import React, { useState } from "react";

export interface MeasurementData {
  [key: string]: string;
}

export interface ApiResults {
  measurements: MeasurementData;
  image_url: string;
}

const API_URL = "http://127.0.0.1:5000/api/process-image";

function App() {
  // Add types to your state hooks
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<ApiResults | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Type the event parameter for the file input handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // The files list can be null, so we check
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setResults(null);
      setError("");
    }
  };

  // Type the event parameter for the form submission handler
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

      // It's good practice to check if the response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from server.");
      }

      const data = await response.json();

      if (!response.ok) {
        // The API returns an 'error' field in the JSON on failure
        throw new Error(data.error || "An unknown error occurred.");
      }

      // The successful data is cast to our ApiResults type
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>🧍‍♂️ Pose Measurement Tool</h1>
        <p>Upload an image with a person and the reference coin.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
          />
          <button type="submit" disabled={isLoading || !selectedFile}>
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {/* The 'results' object is now fully typed! */}
        {results && (
          <div className="results-container">
            <h2>Analysis Results</h2>
            <div className="content">
              <div className="image-section">
                <h3>Processed Image</h3>
                <img src={results.image_url} alt="Processed pose" />
              </div>
              <div className="measurements-section">
                <h3>Measurements</h3>
                <table>
                  <tbody>
                    {Object.entries(results.measurements).map(
                      ([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{value} cm</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
