import React from 'react';

interface Apiary {
  batchId: string;
  batchNumber: string;
  name: string;
  number: string;
  hiveCount: number;
  latitude: number | null; // Changed from number to number | null
  longitude: number | null; // Changed from number to number | null
  honeyCollected: number;
  kilosCollected: number; // Added this field
  honeyCertified: number; // Added this field
}

interface FormApiary extends Apiary {
  batchId: string;
  batchNumber: string;
}

interface CertificationStatus {
  originOnly: number;
  qualityOnly: number;
  bothCertifications: number;
  uncertified: number;
}

// Add the missing CertificationData interface
interface CertificationData extends CertificationStatus {
  batchCount: number;
  totalJars: number;
  certificationDate: string;
  totalCertified: number;
  expiryDate: string;
  tokensUsed: number;
  verification: string;
}

interface Batch {
  id: string;
  batchNumber: string;
  batchName: string;
  name: string;
  createdAt: string;
  status: string;
  totalKg: number;
  jarsProduced: number;
  apiaries: Apiary[];
  certificationStatus: CertificationData;
  containerType: string;
  labelType: string;
  weightKg: number;
  jarUsed: number;
  // Certification data fields
  originOnly: number;
  qualityOnly: number;
  bothCertifications: number;
  uncertified: number;
  // Percentage fields
  originOnlyPercent: number;
  qualityOnlyPercent: number;
  bothCertificationsPercent: number;
  uncertifiedPercent: number;
  // Progress tracking
  completedChecks: number;
  totalChecks: number;
  
  // Optional dates
  certificationDate?: string;
  expiryDate?: string;
  
  // Optional file paths
  productionReportPath?: string;
  labReportPath?: string;
  
  // JSON field
  jarCertifications?: any;
  
  // Honey data fields
  honeyCertified?: number;
  honeyRemaining?: number;
  totalHoneyCollected?: number;
  // Relations
  userId: number;
}

interface TokenStats {
  totalTokens: number;
  remainingTokens: number;
  originOnly: number;
  qualityOnly: number;
  bothCertifications: number;
}

declare global {
  interface Window {
    [key: `apiariesMap_${number}`]: google.maps.Map;
    [key: `apiariesMarker_${number}`]: google.maps.Marker;
  }
}

type MapRef = {
  map: google.maps.Map;
  marker: google.maps.Marker;
};

interface CustomJar {
  id: number;
  size: number;
  quantity: number;
  apiaryIndex?: number;
}

interface JarCertification {
  origin?: boolean;
  quality?: boolean;
  both?: boolean;
  selectedType?: 'origin' | 'quality' | 'both';
}

interface User {
  passportId?: string;
  passportFile?: string;
  // Add other user properties as needed
  id?: string;
  name?: string;
  email?: string;
  isProfileComplete: boolean;
}

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface ApiaryLocation extends LocationCoordinates {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
}

interface JarCertifications {
  [key: number]: JarCertification;
}

interface SelectedApiary extends Apiary {
  kilosCollected: number; // Override to ensure this is always present
}

interface ApiaryFormData {
  name: string;
  number: string;
  hiveCount: number;
  honeyCollected: number;
  location: ApiaryLocation | null;
}

// Updated FormData interface to match your actual usage
interface FormData {
  certificationType: string;
  productionReport: File | null;
  labReport: File | null;
  apiaries: {
    batchId: string;
    batchNumber: string;
    name: string;
    number: string;
    hiveCount: number;
    latitude: number | null;
    longitude: number | null;
    kilosCollected: number;
    honeyCertified: number;
  }[];
}

// Updated Notification interface to match your actual usage
interface Notification {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info'; // Removed 'warning' and made optional
}

// Updated props interface with correct function signatures
interface SuccessPopupProps {
  show: boolean;
  certificationData: CertificationData | null;
  qrCodeDataUrl: string;
  downloadQRCode: () => void;
  setShow: (value: boolean) => void;
  setSelectedBatches: (batches: string[]) => void;
  setBatchJars: (jars: any[]) => void;
  setJarCertifications: (certifications: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>; // Updated to match React state setter
  setNotification: React.Dispatch<React.SetStateAction<Notification>>; // Updated to match React state setter
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({
  show,
  certificationData,
  qrCodeDataUrl,
  downloadQRCode,
  setShow,
  setSelectedBatches,
  setBatchJars,
  setJarCertifications,
  setFormData,
  setNotification
}) => {
  if (!show || !certificationData) return null;

  const handleContinue = () => {
    setShow(false);
    setSelectedBatches([]);
    setBatchJars([]);
    setJarCertifications({});
    
    // Updated to match the new FormData interface
    setFormData({
      certificationType: '',
      productionReport: null,
      labReport: null,
      apiaries: []
    });
    
    // Updated to match the new Notification interface
    setNotification({
      show: true,
      message: `Batch certification completed successfully! ${certificationData.totalCertified} kg certified in ${certificationData.totalJars} jars.`,
      type: 'success'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Batch Certification Complete!
        </h3>
        <p className="text-gray-600 mb-6">
          Your honey has been successfully certified and is now ready for distribution.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Batches Certified:</span>
              <span className="ml-2 font-bold">{certificationData.batchCount}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Jars:</span>
              <span className="ml-2 text-blue-600 font-bold">{certificationData.totalJars}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cert. Date:</span>
              <span className="ml-2">{certificationData.certificationDate}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Honey:</span>
              <span className="ml-2 font-bold text-green-600">{certificationData.totalCertified} kg</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Expires:</span>
              <span className="ml-2">{certificationData.expiryDate}</span>
            </div>
            <div>
              <span className="text-gray-600">Tokens Used:</span>
              <span className="ml-2 font-bold text-yellow-600">{certificationData.tokensUsed}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <span className="font-medium text-gray-700">Verification Code:</span>
            <span className="ml-2 font-mono text-xs bg-yellow-100 px-2 py-1 rounded">
              {certificationData.verification}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Certification QR Code</h4>
          <div className="flex justify-center">
            {qrCodeDataUrl ? (
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                <img 
                  src={qrCodeDataUrl} 
                  alt="Certification QR Code" 
                  className="w-32 h-32 mx-auto"
                />
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">Generating...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={downloadQRCode}
            disabled={!qrCodeDataUrl}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-md font-medium ${
              qrCodeDataUrl
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Download QR Code
          </button>
          
          <button
            onClick={handleContinue}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;