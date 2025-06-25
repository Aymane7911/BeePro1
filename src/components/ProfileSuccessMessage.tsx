import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProfileSuccessMessageProps {
  show: boolean;
  setShow: (value: boolean) => void;
  
}

const ProfileSuccessMessage: React.FC<ProfileSuccessMessageProps> = ({
  show,
  setShow,
  
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Profile Completed!</h3>
          <p className="text-gray-600 mb-6">
            Your beekeeper profile has been completed successfully. You can now proceed with generating certificates.
          </p>
          <button
            onClick={() => {
              setShow(false);
              
            }}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 w-full"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSuccessMessage;