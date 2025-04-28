import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 dark:border-red-500"></div>
      <p className="ml-3 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  );
}

export default LoadingSpinner;
