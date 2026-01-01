import React from 'react';
const backendURL = import.meta.env.VITE_BACKEND_PYTHON_URL;
const LegacyTool = () => {
  return (
    <div className="w-full h-screen bg-white">
      <iframe 
        src={backendURL}
        title="Nexus AI Tool"
        className="w-full h-full border-none"
      />
    </div>
  );
};

export default LegacyTool;