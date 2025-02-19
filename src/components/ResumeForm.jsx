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
  const [jobDescription, setJobDescription] = useState("");

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
    formData.append("content", inputContent);
    formData.append("template", template);
    formData.append("job_description", typeof jobDescription === "string" ? jobDescription : "");

    if (jobDescription instanceof File) {
      formData.append("job_description_file", jobDescription);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/generate`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      dispatch(updateGeneratedContent(response.data.generated_resume));
    } catch (error) {
      setFileError(error.response?.data?.detail || "Failed to generate resume.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Resume Builder</h2>
      
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg"
        rows="6"
        placeholder="Enter your resume details..."
        value={inputContent}
        onChange={(e) => dispatch(updateInputContent(e.target.value))}
      />

      <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="mt-2 p-2 border w-full" />
      {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}

      <button onClick={handleGenerate} disabled={isLoading} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        {isLoading ? "Generating..." : "Generate Resume"}
      </button>

      {generatedContent && <pre className="mt-6 p-4 border bg-gray-50">{generatedContent}</pre>}
    </div>
  );
};

export default ResumeForm;
