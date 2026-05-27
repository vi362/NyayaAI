import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MenuBar from '../components/MenuBar';
import Footer from '../components/Footer';
import { API_URLS } from '../config/api';

const Database = () => {
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaseData, setEditedCaseData] = useState({});
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

console.log("API_BASE:", API_BASE);
  // Fix 1: Better API fetch handling
  useEffect(() => {
    const fetchCases = async () => {
      try {
        console.log("Fetching from:", API_URLS.CASE_LIST);

        // FIXED: Changed S.CASE_LIST to API_URLS.CASE_LIST
        const response = await fetch(API_URLS.CASE_LIST, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Response Status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch cases: ${response.status}`);
        }

        const data = await response.json();

        console.log("Fetched Data:", data);

        setCases(Array.isArray(data?.cases) ? data.cases : []);
      } catch (error) {
        console.error("Error fetching cases:", error);
        setCases([]);
      }
    };

    fetchCases();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fix 2: Status color fix (Pending support)
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "assigned":
        return "bg-green-500";
      case "closed":
        return "bg-red-500";
      case "under-investigation":
        return "bg-yellow-500";
      case "pending":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const openCaseDetailsModal = (srNo) => {
    const caseItem = cases.find((caseItem) => caseItem.id === srNo);
    setActiveCase(caseItem);
    setEditedCaseData(caseItem);
    setIsEditing(false);
  };

  const closeCaseDetailsModal = () => {
    setActiveCase(null);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  // Fix 3: Proper handleInputChange() cleanup
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditedCaseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fix 4: Safe tag handling (prevents crashes)
  const handleRemoveTag = (index) => {
    // Added String() coercion in case tags are returned as an array
    const updatedTags = String(editedCaseData.tags || "")
      .replace(/[\[\]']+/g, "")
      .split(",")
      .filter((_, i) => i !== index)
      .join(",");

    setEditedCaseData((prev) => ({
      ...prev,
      tags: updatedTags,
    }));
  };

  // Fix 5: Safe handleAddTag
  const handleAddTag = () => {
    const newTag = prompt("Enter a new tag:");

    if (newTag?.trim()) {
      const updatedTags = editedCaseData.tags
        ? `${editedCaseData.tags},${newTag.trim()}`
        : newTag.trim();

      setEditedCaseData((prev) => ({
        ...prev,
        tags: updatedTags,
      }));
    }
  };

  // Fix 6: Correct update API URL + better state updates after edit
  const saveCaseChanges = async () => {
    if (
      !editedCaseData.caseHeading ||
      !editedCaseData.query ||
      !editedCaseData.status
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const updatedData = {
      id: activeCase.id,
    };

    if (editedCaseData.caseHeading !== activeCase.caseHeading) {
      updatedData.caseHeading = editedCaseData.caseHeading;
    }

    if (editedCaseData.query !== activeCase.query) {
      updatedData.query = editedCaseData.query;
    }

    if (editedCaseData.applicableArticle !== activeCase.applicableArticle) {
      updatedData.applicableArticle = editedCaseData.applicableArticle;
    }

    if (editedCaseData.description !== activeCase.description) {
      updatedData.description = editedCaseData.description;
    }

    if (editedCaseData.status !== activeCase.status) {
      updatedData.status = editedCaseData.status;
    }

    if (editedCaseData.tags !== activeCase.tags) {
      updatedData.tags = editedCaseData.tags;
    }

    if (Object.keys(updatedData).length === 1) {
      alert("No changes detected.");
      return;
    }

    console.log("Updating case:", updatedData);

    try {
      const response = await fetch(
        API_URLS.CASE_UPDATE(activeCase.id),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update case");
      }

      const data = await response.json();

      console.log("Updated case:", data);

      const updatedCases = cases.map((caseItem) =>
        caseItem.id === data.id
          ? { ...caseItem, ...data }
          : caseItem
      );

      setCases(updatedCases);
      setActiveCase(null);

      alert("Case updated successfully!");
    } catch (error) {
      console.error("Error updating case:", error);
      alert("Failed to update case.");
    }
  };

  return (
    <div className="bareacts-container min-h-screen flex flex-col">
      {isMobile ? <MenuBar /> : <Sidebar />}

      <main className="main-content flex-grow p-8 bg-gray-50">
        <h2 className="database-title text-4xl font-semibold text-blue-900 text-center mb-8 mt-8">
          Case Database
        </h2>

        {/* Fix 7: Total cases counter for debugging */}
        <p className="text-center text-gray-500 mb-6">
          Total Cases: {cases.length}
        </p>

        {cases.length === 0 ? (
          <p className="text-center text-xl font-semibold text-gray-600">No cases available</p>
        ) : (
          <div className="case-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="case-card bg-white p-6 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col"
              >
                <div className="case-header flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-blue-900">{caseItem.caseHeading}</h3>
                  <span
                    className={`status-badge inline-block py-1 px-4 rounded-full text-white text-sm font-medium ${getStatusColor(
                      caseItem.status
                    )}`}
                  >
                    {caseItem.status}
                  </span>
                </div>
                <p className="text-md font-semibold text-darkBlue-800 mt-2">{caseItem.query}</p>
                <p className="text-sm text-blue-400 mt-2">
                  <strong className="text-sm text-blue-900 mt-2">Tags:</strong>{" "}
                  {caseItem.tags
                    ? String(caseItem.tags)
                      .replace(/[\[\]']+/g, '')
                      .split(',')
                      .map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                        >
                          {tag.trim()}
                        </span>
                      ))
                    : 'No tags available'}
                </p>
                <div className="flex-grow"></div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => openCaseDetailsModal(caseItem.id)}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Show Details
                  </button>
                  <button
                    onClick={() => {
                      openCaseDetailsModal(caseItem.id);
                      setIsEditing(true);
                    }}
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {showScrollBtn && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn fixed bottom-4 right-4 bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg cursor-pointer border border-white"
          aria-label="Back to top"
        >
          <span className="material-icons text-lg">arrow_upward</span>
        </button>
      )}

      {activeCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="modal bg-white w-10/12 md:w-7/12 h-3/4 p-6 rounded-lg overflow-auto shadow-lg relative">
            <div className="sticky top-2 flex justify-end">
              <button
                onClick={closeCaseDetailsModal}
                className="sticky top-2 right-2 text-2xl text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-semibold text-blue-900 border-b pb-2">
                {isEditing ? (
                  <input
                    name="caseHeading"
                    type="text"
                    value={editedCaseData.caseHeading || activeCase.caseHeading || ''}
                    onChange={handleInputChange}
                    className="text-3xl font-semibold text-blue-900 w-full bg-transparent border-none outline-none"
                  />
                ) : (
                  activeCase.caseHeading
                )}
              </h3>

              <p className="text-lg font-medium text-black-500">
                <span className="font-semibold">Query:</span>{' '}
                {isEditing ? (
                  <textarea
                    name="query"
                    value={editedCaseData.query || activeCase.query || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 mt-2 border rounded-md outline-none"
                    rows="3"
                  />
                ) : (
                  activeCase.query
                )}
              </p>

              <div>
                <span className="font-semibold">Applicable Articles:</span>
                {isEditing ? (
                  <input
                    name="applicableArticle"
                    value={editedCaseData.applicableArticle || activeCase.applicableArticle || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 mt-2 border rounded-md outline-none"
                  />
                ) : (
                  activeCase.applicableArticle
                    ? activeCase.applicableArticle
                        .match(/\*\*(.*?)\*\*/g)
                        ?.map((match, index) => (
                          <div key={index} className="mt-2">
                            {match.replace(/\*\*/g, '')}
                          </div>
                        )) || 'No applicable article found'
                    : 'No applicable article found'
                )}
              </div>

              <div>
                <span className="font-semibold">Tags:</span>
                {isEditing ? (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editedCaseData.tags
                        ? String(editedCaseData.tags)
                            .replace(/[\[\]']+/g, '')
                            .split(',')
                            .map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm"
                              >
                                {tag.trim()}
                                <button
                                  onClick={() => handleRemoveTag(index)}
                                  className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                  &times;
                                </button>
                              </span>
                            ))
                        : 'No tags available'}
                    </div>
                    <input
                      name="tags"
                      value={editedCaseData.tags || activeCase?.tags || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 mt-2 border rounded-md outline-none"
                      placeholder="Enter tags, separated by commas"
                    />
                    <button
                      onClick={handleAddTag}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      + Add Tag
                    </button>
                  </div>
                ) : (
                  activeCase?.tags
                    ? String(activeCase.tags)
                        .replace(/[\[\]']+/g, '')
                        .split(',')
                        .map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mr-2 mb-2"
                          >
                            {tag.trim()}
                          </span>
                        ))
                    : 'No tags available'
                )}
              </div>

              <div>
                <span className="font-semibold">Description:</span>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editedCaseData.description || activeCase.description || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 mt-2 border rounded-md outline-none"
                    rows="4"
                  />
                ) : (
                  activeCase.description
                )}
              </div>

              {/* Fix 8: Updated Status Dropdown with Pending option */}
              <div>
                <span className="font-semibold">Status:</span>
                {isEditing ? (
                   <select
                   name="status"
                   value={
                     editedCaseData.status ||
                     activeCase?.status ||
                     "pending"
                   }
                   onChange={handleInputChange}
                   className="w-full p-2 mt-2 border rounded-md outline-none"
                 >
                   <option value="pending">Pending</option>
                   <option value="assigned">Assigned</option>
                   <option value="under-investigation">Under Investigation</option>
                   <option value="closed">Closed</option>
                 </select>
                ) : (
                  <p className="mt-1 capitalize">{activeCase.status}</p>
                )}
              </div>

              {isEditing && (
                <div className="mt-4">
                  <button
                    onClick={saveCaseChanges}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Database;