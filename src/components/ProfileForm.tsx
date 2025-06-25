import React, { useState, useRef } from 'react';
import { X, Upload, Check, MapPin, User, FileText, Camera } from 'lucide-react';

interface ProfileFormProps {
  show: boolean;
  setShow: (value: boolean) => void;
  profileData: {
    passportId: string;
    passportScan: File | null;
  };
  handleProfileChange: (field: string, value: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleProfileSubmit: (e: React.FormEvent) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  show,
  setShow,
  profileData,
  handleProfileChange,
  handleFileUpload,
  handleProfileSubmit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  
  const handleCaptureClick = () => {
    setShowCameraOptions(true);
  };

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Complete Your Profile</h3>
                <p className="text-blue-100 text-sm">Required for certificate generation</p>
              </div>
            </div>
            <button
              onClick={() => setShow(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 bg-gray-50">
          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Text Fields */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Beekeeper Passport ID
                  </label>
                  <input
                    type="text"
                    value={profileData.passportId}
                    onChange={(e) => handleProfileChange('passportId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your passport ID"
                    required
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your unique identification number from the beekeeping association
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Apiary Location
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Latitude"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Longitude"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Coordinates of your primary apiary location
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Information
                  </label>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Right Column - File Upload */}
              <div className="space-y-6">
                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Passport Document
                  </label>
                  
                  <div className="relative">
                    <div 
                      onClick={handleOpenFileDialog}
                      className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <Upload className="h-12 w-12 mx-auto text-blue-400 mb-3" />
                      <p className="text-blue-600 font-medium">
                        {profileData.passportScan 
                          ? `Selected: ${profileData.passportScan.name}` 
                          : 'Upload Passport Scan'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: PDF, JPG, PNG up to 5MB
                      </p>
                      <button 
                        type="button"
                        onClick={handleCaptureClick}
                        className="mt-3 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Take Photo
                      </button>
                    </div>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                  </div>
                  
                  {showCameraOptions && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm mb-3">
                        Camera access is required to take a photo of your passport
                      </p>
                      <div className="flex space-x-2">
                        <button 
                          type="button"
                          className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm"
                        >
                          Allow Camera
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowCameraOptions(false)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-full w-16 h-16 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                    <button 
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                      Upload Photo
                    </button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Why we need this</h4>
                  <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                    <li>Your passport ID verifies your beekeeper certification</li>
                    <li>Passport scan is required for authenticity</li>
                    <li>This information appears on your honey certificates</li>
                    <li>We never share your data with third parties</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShow(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={!profileData.passportId || !profileData.passportScan}
                className={`px-8 py-2 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 ${
                  (profileData.passportId && profileData.passportScan)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Check className="h-5 w-5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;