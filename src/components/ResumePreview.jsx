import React from "react";
import { useSelector } from "react-redux";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "./ResumePDF";

const ResumePreview = () => {
  const generatedContent = useSelector((state) => state.resume.generatedContent);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Resume Preview</h2>
      {generatedContent ? (
        <>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap">{generatedContent}</pre>
          </div>
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
