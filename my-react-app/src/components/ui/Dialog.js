import React from "react";

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {children}
        <button onClick={() => onOpenChange(false)} className="mt-4 text-red-500">
          Close
        </button>
      </div>
    </div>
  );
};

export default Dialog;
