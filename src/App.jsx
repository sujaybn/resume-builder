import React from "react";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">AI-Powered Resume Builder</h1>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <ResumeForm />
        <ResumePreview />
      </main>
    </div>
  );
}

export default App;