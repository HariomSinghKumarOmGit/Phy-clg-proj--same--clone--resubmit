import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const StepViewer = ({ steps, title, experimentId }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!steps || steps.length === 0) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const linkPath = title.toLowerCase() === 'procedure'
    ? `/experiment/${experimentId}/procedure`
    : `/experiment/${experimentId}/precautions`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <Link
            to={linkPath}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-full transition-colors"
          >
            Show Full
          </Link>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="p-6 min-h-[120px] flex items-center justify-center text-center relative">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`absolute left-2 p-2 rounded-full transition-colors ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <p className="text-lg text-gray-700 font-medium px-8">
          {steps[currentStep].instruction}
        </p>

        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className={`absolute right-2 p-2 rounded-full transition-colors ${currentStep === steps.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StepViewer;
