import React from 'react';

interface PrintNotificationProps {
  show: boolean;
  setShow: (value: boolean) => void;
  setShowCompleteForm: (value: boolean) => void;
}

const PrintNotification: React.FC<PrintNotificationProps> = ({
  show,
  setShow,
  setShowCompleteForm
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center text-yellow-500 mb-4">
          <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="font-semibold">Complete Batch Information</h3>
        </div>
        <p className="text-gray-600 mb-4">
          One or more of the selected batches have incomplete information. Would you like to complete them before printing?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShow(false);
              setShowCompleteForm(true);
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Complete Batch Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintNotification;