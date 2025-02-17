import React from "react";
import { useSelector } from "react-redux";

const ResumePreview = () => {
  const content = useSelector((state) => state.resume.content);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Resume Preview</h2>
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
};

export default ResumePreview;