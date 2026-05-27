import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { FaMicrophone } from "react-icons/fa";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

console.log("API_BASE:", API_BASE);

const Query = () => {
  // ─────────────────────────────────────────────────────────────
  // States with LocalStorage Persistence
  // ─────────────────────────────────────────────────────────────
  const [query, setQuery] = useState(() => {
    return localStorage.getItem("nyaya_query") || "";
  });

  const [response, setResponse] = useState(() => {
    const saved = localStorage.getItem("nyaya_response");
    return saved
      ? JSON.parse(saved)
      : { response: "Response will appear here..." };
  });

  const [error, setError] = useState(() => {
    return localStorage.getItem("nyaya_error") || "";
  });

  const [isListening, setIsListening] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Persist to LocalStorage
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("nyaya_query", query);
  }, [query]);

  useEffect(() => {
    localStorage.setItem("nyaya_response", JSON.stringify(response));
  }, [response]);

  useEffect(() => {
    localStorage.setItem("nyaya_error", error);
  }, [error]);

  // ─────────────────────────────────────────────────────────────
  // Voice Recognition
  // ─────────────────────────────────────────────────────────────
  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice recognition not supported. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setQuery((prev) => (prev ? prev + " " + spokenText : spokenText));
    };

    recognition.onend = () => setIsListening(false);

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  // ─────────────────────────────────────────────────────────────
  // Input Handlers
  // ─────────────────────────────────────────────────────────────
  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    localStorage.setItem("nyaya_query", value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleQuerySubmit();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Submit Query
  // ─────────────────────────────────────────────────────────────
  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      alert("Please enter a query");
      return;
    }

    setIsLoading(true);
    setError("");

    localStorage.setItem("nyaya_query", query);
    localStorage.removeItem("nyaya_error");

    try {
      console.log("Calling API:", `${API_BASE}/encode/`);

      const res = await fetch(`${API_BASE}/encode/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      console.log("Response Status:", res.status);

      const data = await res.json();
      console.log("Parsed Response:", data);

      if (!res.ok) {
        throw new Error(data.error || data.message || `Server Error (${res.status})`);
      }

      setResponse(data);
      localStorage.setItem("nyaya_response", JSON.stringify(data));
      setError("");
      localStorage.removeItem("nyaya_error");
    } catch (err) {
      console.error("Fetch Error:", err);

      const errorMessage = err.message || "Failed to connect to backend";
      setError(errorMessage);
      localStorage.setItem("nyaya_error", errorMessage);

      const defaultResponse = { response: "Response will appear here..." };
      setResponse(defaultResponse);
      localStorage.setItem("nyaya_response", JSON.stringify(defaultResponse));
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Clear All
  // ─────────────────────────────────────────────────────────────
  const handleClear = () => {
    setQuery("");
    setError("");
    setIsLoading(false);

    const defaultResponse = { response: "Response will appear here..." };
    setResponse(defaultResponse);

    localStorage.removeItem("nyaya_response");
    localStorage.removeItem("nyaya_query");
    localStorage.removeItem("nyaya_error");
  };

  // ─────────────────────────────────────────────────────────────
  // Format Response Text (Bold & Bullet Handling)
  // ─────────────────────────────────────────────────────────────
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split("\n");

    return lines.map((line, lineIndex) => {
      let processedLine = line.trim().replace(/^\*\s+/, "");

      if (processedLine === "") {
        return <div key={`empty-${lineIndex}`} style={{ height: "8px" }} />;
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(processedLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(
            <span key={`plain-${lineIndex}-${lastIndex}`}>
              {processedLine.slice(lastIndex, match.index)}
            </span>
          );
        }

        parts.push(
          <strong key={`bold-${lineIndex}-${match.index}`}>{match[1]}</strong>
        );

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < processedLine.length) {
        parts.push(
          <span key={`plain-${lineIndex}-end`}>
            {processedLine.slice(lastIndex)}
          </span>
        );
      }

      return parts.length === 0 ? (
        <p key={lineIndex} style={styles.responseText}>
          {processedLine}
        </p>
      ) : (
        <p key={lineIndex} style={styles.responseText}>
          {parts}
        </p>
      );
    });
  };

  // ─────────────────────────────────────────────────────────────
  // Render Response
  // ─────────────────────────────────────────────────────────────
  const renderResponse = (data) => {
    if (typeof data === "string") {
      try {
        const parsedData = JSON.parse(data);
        if (typeof parsedData === "object") data = parsedData;
      } catch {
        // Keep as string
      }
    }

    if (!data || data.response === "Response will appear here.") {
      return <p style={{ color: "#666" }}>Response will appear here.</p>;
    }

    return (
      <div>
        {/* Main Response */}
        {data.response && (
          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.8",
              fontSize: "16px",
              marginBottom: "20px",
            }}
          >
            {renderFormattedText(data.response)}
          </div>
        )}

        {/* Acts / Sections */}
        {data.acts && typeof data.acts === "object" && (
          <div>
            <h3>Applicable IPC/BNS Sections</h3>
            {Object.entries(data.acts).map(([section, description], index) => (
              <div key={index} style={styles.sectionContainer}>
                <p>
                  <strong>Section {section}</strong>
                </p>
                <button
                  onClick={() => toggleDescription(section)}
                  style={styles.linkButton}
                >
                  {activeSection === section ? "Hide Description" : "Show Description"}
                </button>
                {activeSection === section && (
                  <p style={styles.descriptionText}>{description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legal Details */}
        {data.legal_details && Array.isArray(data.legal_details) && (
          <div style={{ marginTop: "30px" }}>
            <h3>Legal Details</h3>
            {data.legal_details.map((item, index) => (
              <div key={index} style={styles.sectionContainer}>
                <p>
                  <strong>Crime:</strong> {item.crime}
                </p>
                <p>
                  <strong>Punishment:</strong> {item.punishment}
                </p>
                <p>
                  <strong>Court:</strong> {item.court}
                </p>
                <p>
                  <strong>Bailable:</strong> {item.bailable ? "Yes" : "No"}
                </p>
                <p>
                  <strong>FIR Required:</strong> {item.fir_required ? "Yes" : "No"}
                </p>

                <div>
                  <strong>Sections:</strong>
                  {item.sections?.map((section, idx) => (
                    <div key={idx} style={{ marginTop: "10px" }}>
                      <strong>{section.section}</strong>
                      <p>{section.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const toggleDescription = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // ─────────────────────────────────────────────────────────────
  // Main JSX
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={styles.pageContainer}>
      <Sidebar />

      <div style={styles.mainContent}>
        {/* Response Display */}
        <div style={styles.responseBox}>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={styles.errorText}>{error}</p>
          ) : (
            renderResponse(response)
          )}
        </div>

        {/* Input Area */}
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your legal query here..."
            style={styles.input}
          />

          <button onClick={handleMicClick} style={styles.micButton}>
            <FaMicrophone
              style={{
                color: isListening ? "#007bff" : "#555",
                fontSize: "24px",
              }}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonContainer}>
          <button
            onClick={handleQuerySubmit}
            style={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Submit Query"}
          </button>

          <button onClick={handleClear} style={styles.clearButton}>
            Clear
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },

  mainContent: {
    flex: 1,
    padding: "20px",
  },

  responseBox: {
    marginBottom: "20px",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    minHeight: "250px",
  },

  responseText: {
    fontSize: "16px",
    color: "#333",
    lineHeight: "1.8",
    marginBottom: "8px",
  },

  errorText: {
    color: "red",
    fontSize: "18px",
  },

  inputContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },

  input: {
    flex: 1,
    fontSize: "16px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
  },

  micButton: {
    marginLeft: "10px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
  },

  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  submitButton: {
    padding: "15px 25px",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },

  clearButton: {
    padding: "15px 25px",
    backgroundColor: "#dc3545",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },

  sectionContainer: {
    marginBottom: "15px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  linkButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    marginTop: "10px",
  },

  descriptionText: {
    marginTop: "10px",
    color: "#555",
    lineHeight: "1.7",
  },
};

export default Query;