import React from 'react';
import { AlertTriangle, X } from 'lucide-react';


interface Apiary {
  batchId: string,
  batchNumber: string,
  name: string;
  number: string;
  hiveCount: number;
  latitude: number;
  longitude: number;
  honeyCollected: number;
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
  certificationStatus: CertificationStatus;
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
  lat: number;
  lng: number;
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

interface LocationCoordinates {
  latitude: number;  // Changed from lat to latitude
  longitude: number; // Changed from lng to longitude
}

interface ApiaryLocation extends LocationCoordinates {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
}

interface ApiaryFormData {
  name: string;
  number: string;
  hiveCount: number;
  honeyCollected: number;
  location: ApiaryLocation | null;
}


interface DeleteConfirmationDialogProps {
  show: boolean;
  setShow: (value: boolean) => void;
  isDeleting: boolean;
  confirmDelete: () => void;
  selectedBatches: string[];
  batches: Batch[];
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  show,
  setShow,
  isDeleting,
  confirmDelete,
  selectedBatches,
  batches
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="relative bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-rose-500/5"></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/10 to-transparent rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center text-red-500 mb-6">
            <div className="p-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl mr-3 shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-xl bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              Delete Confirmation
            </h3>
          </div>
          
          {isDeleting ? (
            <div className="text-center py-8">
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-red-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">Deleting batches...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Are you sure you want to delete {selectedBatches.length} {selectedBatches.length === 1 ? 'batch' : 'batches'}? This action cannot be undone.
              </p>
              
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-xl">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="p-1 bg-yellow-400 rounded-full">
                      <div className="h-4 w-4 text-white">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800 font-medium">
                      All associated apiaries and certification data will also be deleted.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3 font-medium">The following batches will be deleted:</p>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {selectedBatches.map(batchId => {
                    const batch = batches.find(b => b.id === batchId);
                    return batch ? (
                      <span key={batchId} className="inline-flex px-3 py-1 bg-gradient-to-r from-red-100 to-rose-100 
                                                     text-red-800 text-sm rounded-full border border-red-200 font-medium">
                        {batch.batchNumber}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShow(false)}
                  className="group relative overflow-hidden px-6 py-3 
                             bg-gradient-to-r from-gray-100 to-gray-200 
                             text-gray-700 rounded-xl font-semibold
                             transform transition-all duration-300 
                             hover:from-gray-200 hover:to-gray-300 
                             hover:scale-105 hover:shadow-lg
                             active:scale-95 border border-gray-300"
                >
                  <span className="relative z-10">Cancel</span>
                </button>
                
                <button
                  onClick={confirmDelete}
                  className="group relative overflow-hidden px-6 py-3 
                             bg-gradient-to-r from-red-600 to-rose-500 
                             text-white rounded-xl font-semibold shadow-xl
                             transform transition-all duration-300 
                             hover:from-red-500 hover:to-rose-400 
                             hover:scale-105 hover:shadow-red-500/30
                             active:scale-95 flex items-center
                             border border-red-400/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                 transform -skew-x-12 -translate-x-full 
                                 group-hover:translate-x-full transition-transform duration-600"></div>
                  
                  <div className="h-4 w-4 mr-2 relative z-10 transition-transform duration-300 
                                 group-hover:rotate-12">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <span className="relative z-10">Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;