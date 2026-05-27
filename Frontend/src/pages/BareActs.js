import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MenuBar from "../components/MenuBar";
import "../styles/BareActs.css";
import axios from "axios";
import { FaArrowUp } from "react-icons/fa";
import Footer from "../components/Footer";
import { API_URLS } from "../config/api";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
 
// ─── PDF Worker ───────────────────────────────────────────────
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
 
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
console.log("API_BASE:", API_BASE);
 
// ─────────────────────────────────────────────────────────────
// ACT OPTIONS (extracted as a constant)
// ─────────────────────────────────────────────────────────────
const ACT_OPTIONS = [
  { value: "bns",  label: "Bharatiya Nyaya Sanhita" },
  { value: "bnss", label: "Bharatiya Nagarik Suraksha Sanhita" },
  { value: "bsa",  label: "Bharatiya Sakshya Adhiniyam" },
  { value: "ipc",  label: "Indian Penal Code" },
  { value: "crpc", label: "Code of Criminal Procedure" },
  { value: "iea",  label: "Indian Evidence Act" },
  { value: "cpc",  label: "Code of Civil Procedure" },
  { value: "mva",  label: "Motor Vehicles Act" },
];
 
// ─────────────────────────────────────────────────────────────
// HELPER: flatten laws from API response
// ─────────────────────────────────────────────────────────────
const flattenLawsData = (lawsData = {}) => [
  ...(lawsData.bns  || []),
  ...(lawsData.bnss || []),
  ...(lawsData.bsa  || []),
  ...(lawsData.ipc  || []),
  ...(lawsData.crpc || []),
  ...(lawsData.cpc  || []),
  ...(lawsData.mva  || []),
  ...(lawsData.iea  || []),
];
 
// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
const BareActs = () => {
 
  // ── Search States ──────────────────────────────────────────
  const [searchQuery,    setSearchQuery]    = useState("");
  const [selectedActType, setSelectedActType] = useState("");
  const [searchResults,  setSearchResults]  = useState({});
  const [results,        setResults]        = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [isLoading,      setIsLoading]      = useState(false);
  const [fetchError,     setFetchError]     = useState(null);
 
  // ── Law / PDF Data States ──────────────────────────────────
  const [laws,           setLaws]           = useState([]);
  const [pdfs,           setPdfs]           = useState([]);
  const [filteredPdfs,   setFilteredPdfs]   = useState([]);
  const [pdfSearchQuery, setPdfSearchQuery] = useState("");
  const [pdfLoading,     setPdfLoading]     = useState(false);
  const [pdfError,       setPdfError]       = useState(null);
 
  // ── PDF Viewer States ──────────────────────────────────────
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlobUrl,     setPdfBlobUrl]     = useState(null);
  const [pdfName,        setPdfName]        = useState("");
  const [zoom,           setZoom]           = useState(66);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
 
  // ── UI States ──────────────────────────────────────────────
  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 768);
  const [showButton,     setShowButton]     = useState(false);
 
  // ── Tab State (persisted in sessionStorage) ────────────────
  const [showDownloads, setShowDownloads] = useState(
    () => sessionStorage.getItem("bareActsTab") === "true"
  );
 
  // ─────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────
 
  // Persist tab selection
  useEffect(() => {
    sessionStorage.setItem("bareActsTab", showDownloads);
  }, [showDownloads]);
 
  // Close PDF viewer on browser back button
  useEffect(() => {
    const handleBackButton = () => {
      if (showPdfPreview) {
        setShowPdfPreview(false);
        setPdfBlobUrl(null);
      }
    };
    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [showPdfPreview]);
 
  // Resize + scroll listeners
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = () => setShowButton(window.scrollY > 200);
 
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
 
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
 
  // Fetch all laws
  useEffect(() => {
    const fetchLaws = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URLS.DATABASE);
        const lawsData = response?.data?.data || {};
        const allLaws = flattenLawsData(lawsData);
        setLaws(allLaws.map((law) => ({ ...law, showDescription: false })));
      } catch (err) {
        console.error("Error fetching laws:", err);
        setError("Failed to fetch laws data.");
      } finally {
        setLoading(false);
      }
    };
    fetchLaws();
  }, []);
 
  // Fetch PDFs
  useEffect(() => {
    const fetchPdfs = async () => {
      setPdfLoading(true);
      setPdfError(null);
 
      try {
        const response = await axios.get(API_URLS.PDFS);
        let pdfData = [];
 
        if (Array.isArray(response.data)) {
          pdfData = response.data;
        } else if (Array.isArray(response.data?.data)) {
          pdfData = response.data.data;
        } else {
          pdfData = flattenLawsData(response?.data?.data);
        }
 
        const formattedPdfs = pdfData.map((pdf, index) => ({
          id:          pdf.id || index,
          act_name:    pdf.act_name || pdf.section_title || pdf.title || "Untitled Document",
          description: pdf.description || "No description available",
          pdf_file:    pdf.pdf_file || pdf.file || pdf.document || "",
        }));
 
        setPdfs(formattedPdfs);
        setFilteredPdfs(formattedPdfs);
      } catch (err) {
        console.error("Error fetching PDFs:", err);
        setPdfError("Failed to fetch PDF data.");
        setPdfs([]);
        setFilteredPdfs([]);
      } finally {
        setPdfLoading(false);
      }
    };
    fetchPdfs();
  }, []);
 
  // ─────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────
 
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
 
  // Search with a query string
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
 
    if (!selectedActType) {
      setError("Please select an act type.");
      setLoading(false);
      return;
    }
 
    try {
      const response = await axios.post(
        `${API_BASE}/search/`,
        { query: searchQuery || "", act: selectedActType },
        { headers: { "Content-Type": "application/json" } }
      );
 
      const data = response.data;
 
      if (data.data)         setSearchResults(data.data);
      else if (data.matches) setSearchResults(data.matches);
      else if (data.response) setSearchResults(data.response);
      else {
        setSearchResults([]);
        setError("No results found");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Search failed");
    } finally {
      setLoading(false);
    }
  };
 
  // Search without a query string (browse by act)
  const performSearch = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setFetchError(null);
 
    try {
      const response = await axios.post(`${API_BASE}/search/`, {
        query: searchQuery || "",
        act:   selectedActType || "",
      });
      const data = response.data;
 
      if (data.response)     setResults(data.response);
      else if (data.data)    setResults([data.data]);
      else if (data.matches) setResults(data.matches);
      else {
        setResults([]);
        setFetchError("No results found.");
      }
    } catch (error) {
      console.error(error);
      setFetchError(error.response?.data?.error || "Search failed");
    } finally {
      setIsLoading(false);
    }
  };
 
  // Route to the correct search function
  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedActType && searchQuery) {
      handleSearch(event);
    } else if (selectedActType && !searchQuery) {
      performSearch(event);
    }
  };
 
  // PDF search filter
  const handlePdfSearchChange = (e) => {
    const query = e.target.value;
    setPdfSearchQuery(query);
 
    if (query === "") {
      setFilteredPdfs(pdfs);
    } else {
      const lq = query.toLowerCase();
      setFilteredPdfs(
        pdfs.filter(
          (pdf) =>
            (pdf.act_name    || "").toLowerCase().includes(lq) ||
            (pdf.description || "").toLowerCase().includes(lq)
        )
      );
    }
  };
 
  // Download a PDF
  const handleDownloadPdf = (pdfFile) => {
    try {
      const cleanPath = pdfFile.replace(/^\/?media\//, "");
      const fileUrl   = pdfFile.startsWith("http") ? pdfFile : `${API_BASE}/media/${cleanPath}`;
 
      const link = document.createElement("a");
      link.href     = fileUrl;
      link.target   = "_blank";
      link.download = "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download Error:", err);
      setPdfError("Failed to download PDF.");
    }
  };
 
  // Open PDF preview modal
  const handlePreviewPdf = (pdfFile, actName = "") => {
    try {
      const cleanPath = pdfFile.replace(/^\/?media\//, "");
      const fileUrl   = pdfFile?.startsWith("http") ? pdfFile : `${API_BASE}/media/${cleanPath}`;
 
      setPdfBlobUrl(fileUrl);
      setPdfName(actName);
      setCurrentPage(1);
      setTotalPages(1);
      setZoom(66);
      setShowPdfPreview(true);
 
      // Push state so Back button closes the modal
      window.history.pushState({ pdfOpen: true }, "");
    } catch (err) {
      console.error("Preview Error:", err);
      setPdfError("Failed to preview PDF.");
    }
  };
 
  // Close PDF preview modal
  const closePreviewModal = () => {
    setShowPdfPreview(false);
    setPdfBlobUrl(null);
    setPdfName("");
    setCurrentPage(1);
    setTotalPages(1);
 
    if (window.history.state?.pdfOpen) {
      window.history.back();
    }
  };
 
  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="bareacts-container min-h-screen flex flex-col">
      {isMobile ? <MenuBar /> : <Sidebar />}
 
      <main className="main-content flex-grow">
 
        {/* ── Page Title ─────────────────────────────────────── */}
        <h2 className="bareacts-title text-4xl font-semibold text-blue-900 text-center mb-8 mt-8">
          Bare Acts Library
        </h2>
 
        {/* ── Tab Toggle ─────────────────────────────────────── */}
        <div className="toggle-section flex justify-center mb-6">
          <button
            onClick={() => setShowDownloads(false)}
            className={`p-4 rounded-l-lg border font-medium transition-all duration-300 ease-in-out ${
              !showDownloads
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            View Bare Acts
          </button>
 
          <button
            onClick={() => setShowDownloads(true)}
            className={`p-4 rounded-r-lg border font-medium transition-all duration-300 ease-in-out ${
              showDownloads
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Original Documents
          </button>
        </div>
 
        {/* ══════════════════════════════════════════════════════
            TAB: VIEW BARE ACTS
        ══════════════════════════════════════════════════════ */}
        {!showDownloads ? (
          <div className="bare-acts-section">
 
            {/* Search Form */}
            <div className="flex justify-center items-center">
              <form
                onSubmit={handleSubmit}
                className="bareacts-search-form flex flex-col items-center gap-4 sm:flex-row sm:gap-6 mb-10"
              >
                <input
                  type="text"
                  placeholder="Search for a Bare Act"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bareacts-search-input w-full sm:w-96 p-3 text-lg rounded-lg border-2 bg-white text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
 
                <select
                  value={selectedActType}
                  onChange={(e) => setSelectedActType(e.target.value)}
                  className="bareacts-select-input w-full sm:w-96 p-3 text-lg rounded-lg border-2 bg-white text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Act Type</option>
                  {ACT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
 
                <button
                  type="submit"
                  className="bareacts-search-btn p-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Search
                </button>
              </form>
            </div>
 
            {/* Search Results */}
            {Array.isArray(searchResults) && searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white border border-gray-300 rounded-xl shadow-md"
                  >
                    <h4 className="text-2xl font-semibold text-blue-800">
                      Section {item.section || item.section_id}
                    </h4>
                    <p className="text-lg font-bold mt-2">
                      {item.title || item.section_title}
                    </p>
                    <p className="text-gray-600 mt-2">{item.description}</p>
                  </div>
                ))}
              </div>
 
            ) : searchResults && Object.keys(searchResults).length > 0 ? (
              <div className="p-4 bg-white border border-gray-300 rounded-xl shadow-md">
                <h4 className="text-2xl font-semibold text-blue-800">
                  Section {searchResults.section}
                </h4>
                <p className="text-lg font-bold mt-2">{searchResults.title}</p>
                <p className="text-gray-600 mt-2">{searchResults.description}</p>
              </div>
 
            ) : (
              /* Fallback: browse results */
              <div className="search-results bg-gray-50 p-8 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-3xl font-semibold text-blue-900 mb-6">Search Results</h3>
 
                {isLoading ? (
                  <p className="text-gray-500 italic mt-4">Loading...</p>
                ) : fetchError ? (
                  <p className="text-red-500 italic mt-4">{fetchError}</p>
                ) : results && results.length > 0 ? (
                  <div className="space-y-4">
                    {results.map((law) => (
                      <div
                        key={law.id}
                        className="p-4 bg-white border border-gray-300 rounded-xl shadow-md"
                      >
                        <h4 className="text-2xl font-semibold text-blue-800">
                          Section {law.section_id}
                        </h4>
                        <p className="text-lg font-bold mt-2">{law.section_title}</p>
                        <p className="text-gray-600 mt-2">{law.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic mt-4">No results found</p>
                )}
              </div>
            )}
          </div>
 
        ) : (
        /* ══════════════════════════════════════════════════════
            TAB: ORIGINAL DOCUMENTS (PDFs)
        ══════════════════════════════════════════════════════ */
          <div className="pdf-download-section">
 
            {/* PDF Search Input */}
            <div className="flex justify-center mb-6">
              <input
                type="text"
                placeholder="Search documents..."
                value={pdfSearchQuery}
                onChange={handlePdfSearchChange}
                className="w-full sm:w-96 p-3 text-lg rounded-lg border-2 bg-white text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
 
            {/* PDF List */}
            {pdfLoading ? (
              <p className="text-center text-gray-500 italic">Loading PDFs...</p>
            ) : pdfError ? (
              <p className="text-center text-red-500 italic">{pdfError}</p>
            ) : filteredPdfs.length === 0 ? (
              <p className="text-center text-gray-500 italic">No documents found.</p>
            ) : (
              <div className="space-y-4">
                {filteredPdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="p-4 bg-white border border-gray-300 rounded-lg shadow-md flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-blue-800">{pdf.act_name}</h4>
                      <p className="text-gray-700">{pdf.description}</p>
                    </div>
 
                    <div className="ml-4 flex gap-3">
                      <button
                        onClick={() => handlePreviewPdf(pdf.pdf_file, pdf.act_name)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Preview PDF
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(pdf.pdf_file)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
 
            {/* ── PDF Preview Modal ─────────────────────────── */}
            {showPdfPreview && pdfBlobUrl && (
              <div
                className="fixed inset-0 z-50 flex flex-col font-sans"
                style={{ background: "#525659" }}
              >
                {/* Toolbar */}
                <div className="flex items-center justify-between px-6 py-3 bg-gray-800 text-white">
                  <span className="font-semibold truncate max-w-xs">{pdfName}</span>
 
                  <div className="flex items-center gap-4">
                    {/* Zoom controls */}
                    <button
                      onClick={() => setZoom((z) => Math.max(25, z - 10))}
                      className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                    >
                      −
                    </button>
                    <span>{zoom}%</span>
                    <button
                      onClick={() => setZoom((z) => Math.min(200, z + 10))}
                      className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
                    >
                      +
                    </button>
 
                    {/* Page navigation */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-40"
                    >
                      ‹
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-40"
                    >
                      ›
                    </button>
 
                    {/* Close */}
                    <button
                      onClick={closePreviewModal}
                      className="ml-4 px-3 py-1 bg-red-600 rounded hover:bg-red-500"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>
 
                {/* PDF Viewer */}
                <div className="flex-1 overflow-auto flex justify-center py-6">
                  <Document
                    file={pdfBlobUrl}
                    onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
                    loading={<div className="text-white p-4">Loading Document...</div>}
                  >
                    <Page
                      pageNumber={currentPage}
                      scale={zoom / 100}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="bg-white"
                    />
                  </Document>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
 
      {/* ── Scroll-to-top Button ───────────────────────────────── */}
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
          aria-label="Scroll to top"
        >
          <FaArrowUp />
        </button>
      )}
 
      <Footer />
    </div>
  );
};
 
export default BareActs;