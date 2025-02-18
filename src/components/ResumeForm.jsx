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

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/generate`,
        { content: inputContent, template },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      dispatch(updateGeneratedContent(response.data.generated_resume));
    } catch (error) {
      console.error("Error generating resume:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Resume Content</h2>
      <textarea
        className="w-full p-2 border rounded mb-4"
        value={inputContent} // Keeps user input separate
        onChange={(e) => dispatch(updateInputContent(e.target.value))}
        placeholder="Enter your resume content..."
        rows={10}
      />
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Template:</label>
        <select
          className="w-full p-2 border rounded"
          value={template}
          onChange={(e) => dispatch(updateTemplate(e.target.value))}
        >
          <option value="basic">Basic</option>
          <option value="modern">Modern</option>
        </select>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? "Generating..." : "Generate Resume"}
      </button>

      {generatedContent && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-semibold">Generated Resume:</h3>
          <pre className="whitespace-pre-wrap">{generatedContent}</pre>
        </div>
      )}
    </div>
  );
};

export default ResumeForm;
