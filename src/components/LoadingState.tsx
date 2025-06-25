import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow flex justify-center items-center">
      <div className="flex flex-col items-center">
        {/* Animated spinner */}
        <div className="relative">
          {/* Outer circle */}
          <div className="w-16 h-16 rounded-full border-4 border-yellow-200"></div>
          
          {/* Animated spinner circle */}
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
          
          {/* Honeycomb icon inside spinner */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg className="w-8 h-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM6 14C5.45 14 5 13.55 5 13C5 12.45 5.45 12 6 12C6.55 12 7 12.45 7 13C7 13.55 6.55 14 6 14ZM9 9C8.45 9 8 8.55 8 8C8 7.45 8.45 7 9 7C9.55 7 10 7.45 10 8C10 8.55 9.55 9 9 9ZM15 9C14.45 9 14 8.55 14 8C14 7.45 14.45 7 15 7C15.55 7 16 7.45 16 8C16 8.55 15.55 9 15 9ZM18 14C17.45 14 17 13.55 17 13C17 12.45 17.45 12 18 12C18.55 12 19 12.45 19 13C19 13.55 18.55 14 18 14Z" />
            </svg>
          </div>
        </div>
        
        {/* Loading text with animated dots */}
        <p className="mt-4 text-gray-600 flex items-center">
          Loading batches
          <span className="ml-1 flex">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
          </span>
        </p>
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-300 rounded-full"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-amber-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;