import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  refreshData: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, refreshData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-center text-red-600 mb-4 animate-pulse">
        <div className="mr-3 bg-red-100 p-3 rounded-full">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold">Something Went Wrong</h3>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-3">We encountered an issue while loading your batches:</p>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-amber-800 mb-2 flex items-center">
          <svg className="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Troubleshooting Tips
        </h4>
        <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
          <li>Check your internet connection</li>
          <li>Verify your API credentials</li>
          <li>Ensure the backend service is running</li>
        </ul>
      </div>
      
      <button 
        onClick={refreshData}
        className="w-full group relative overflow-hidden px-6 py-3 rounded-lg font-semibold shadow-lg
                   bg-gradient-to-r from-yellow-500 to-amber-500 text-white
                   hover:from-yellow-600 hover:to-amber-600 
                   transform transition-all duration-300 
                   hover:scale-105 hover:shadow-yellow-500/30
                   flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                       transform -skew-x-12 -translate-x-full 
                       group-hover:translate-x-full transition-transform duration-700"></div>
        
        <RefreshCw className="h-5 w-5 mr-2 group-hover:animate-spin" />
        <span className="relative z-10">Retry Loading Data</span>
      </button>
      
      <div className="mt-4 text-center">
        <button 
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          onClick={() => window.location.reload()}
        >
          Or refresh the entire page
        </button>
      </div>
      
      <div className="mt-6 flex justify-center">
        <div className="bg-gradient-to-r from-red-500 to-amber-500 w-24 h-1 rounded-full opacity-30"></div>
      </div>
    </div>
  );
};

export default ErrorState;