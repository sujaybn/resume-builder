import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateContent } from "../features/resumeSlice";
import axios from "axios";

const ResumeForm = () => {
  const content = useSelector((state) => state.resume.content);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/generate`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${userToken}`, // Add Firebase token here
          },
        }
      );
      dispatch(updateContent(response.data.generated_resume));
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
        value={content}
        onChange={(e) => dispatch(updateContent(e.target.value))}
        placeholder="Enter your resume content..."
        rows={10}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? "Generating..." : "Generate Resume"}
      </button>
    </div>
  );
};

export default ResumeForm;