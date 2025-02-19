import React from "react";
import { useSelector } from "react-redux";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "./ResumePDF";

const ResumePreview = () => {
  const generatedContent = useSelector((state) => state.resume.generatedContent);
  
  // Extract similarity score from generated content
  const similarityScore = generatedContent?.match(/Job Match Score: (\d+\.?\d*%)/)?.[1];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Resume Preview</h2>
      {generatedContent ? (
        <>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap">{generatedContent}</pre>
          </div>
          
          {similarityScore && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h3 className="text-lg font-semibold text-blue-800">
                Job Match Score: {similarityScore}
              </h3>
              <p className="text-sm text-blue-600 mt-2">
                This score indicates how well your resume matches the uploaded job description.
              </p>
            </div>
          )}

          <div className="mt-4">
            <PDFDownloadLink
              document={<ResumePDF content={generatedContent} />}
              fileName="resume.pdf"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {({ loading }) => (loading ? "Loading..." : "Download PDF")}
            </PDFDownloadLink>
          </div>
        </>
      ) : (
        <p className="text-gray-600">No resume generated yet. Enter details and click "Generate Resume".</p>
      )}
    </div>
  );
};

export default ResumePreview;