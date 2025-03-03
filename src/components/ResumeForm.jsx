import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateInputContent, updateGeneratedContent, updateTemplate } from "../features/resumeSlice";
import axios from "axios";

const ResumeForm = () => {
  const inputContent = useSelector((state) => state.resume.inputContent);
  const generatedContent = useSelector((state) => state.resume.generatedContent);
  const template = useSelector((state) => state.resume.template);

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [jobDescription, setJobDescription] = useState(null);
  const [originalMatchScore, setOriginalMatchScore] = useState(null);
  const [improvedMatchScore, setImprovedMatchScore] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFileError("");

    if (!file) return;

    if (file.size > 1024 * 1024) {
      setFileError("File size too large (max 1MB)");
      return;
    }

    setJobDescription(file);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setFileError("");

    const formData = new FormData();
    formData.append("resume_content", inputContent);
    formData.append("template", template);

    if (jobDescription instanceof File) {
      formData.append("job_description_file", jobDescription);
    } else if (typeof jobDescription === "string") {
      formData.append("job_description_text", jobDescription);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/generate`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      dispatch(updateGeneratedContent(response.data.refined_resume));
      setOriginalMatchScore(response.data.original_match_score);
      setImprovedMatchScore(response.data.improved_match_score);
    } catch (error) {
      setFileError(error.response?.data?.detail || "Failed to generate resume.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Resume Optimizer</h2>
      
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg"
        rows="6"
        placeholder="Paste your resume here..."
        value={inputContent}
        onChange={(e) => dispatch(updateInputContent(e.target.value))}
      />

      <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="mt-2 p-2 border w-full" />
      {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}

      <button 
        onClick={handleGenerate} 
        disabled={isLoading} 
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg"
      >
        {isLoading ? "Generating..." : "Generate Tailored Resume"}
      </button>

      {generatedContent && (
        <div className="mt-6 p-4 border bg-gray-50">
          <h3 className="text-lg font-semibold">Tailored Resume:</h3>
          <pre className="whitespace-pre-wrap">{generatedContent}</pre>

          <h3 className="text-lg font-semibold mt-4">Match Scores:</h3>
          <p>Before Optimization: <strong>{(originalMatchScore * 100).toFixed(2)}%</strong></p>
          <p>After Optimization: <strong>{(improvedMatchScore * 100).toFixed(2)}%</strong></p>
        </div>
      )}
    </div>
  );
};

export default ResumeForm;
