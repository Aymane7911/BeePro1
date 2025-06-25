import React, { useState } from 'react';
import { 
  X, Package, PlusCircle, MapPin, Trash2, AlertCircle, Check, 
  Upload, Sparkles, FileText, Globe, Map, Plus, AlertTriangle, Wallet
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';


interface Apiary {
  batchId: string;
  batchNumber: string;
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

// Add missing interfaces
interface JarDefinition {
  id: string;
  size: number;
  quantity: number;
  unit: string;
}

interface Certification {
  origin?: boolean;
  quality?: boolean;
  both?: boolean;
  selectedType?: 'origin' | 'quality' | 'both';
}

interface FileData {
  productionReport?: File | null;
  labReport?: File | null;
  [key: string]: any;
}

interface CompleteBatchFormProps {
  show: boolean;
  setShow: (value: boolean) => void;
  selectedBatches: string[];
  batches: Batch[];
  batchJars: JarDefinition[];
  setBatchJars: (jars: JarDefinition[]) => void;
  jarCertifications: Record<string, Certification>;
  setJarCertifications: (certifications: Record<string, Certification>) => void;
  formData: FileData;
  setFormData: (data: FileData) => void;
  tokenBalance: number;
  predefinedJarSizes: number[];
  newJarSize: string;
  setNewJarSize: (size: string) => void;
  newJarUnit: string;
  setNewJarUnit: (unit: string) => void;
  newJarQuantity: number;
  setNewJarQuantity: (quantity: number) => void;
  getTotalHoneyFromBatch: () => number;
  getAllocatedHoneyFromJars: () => number;
  getMaxQuantity: () => number;
  removeJarFromBatch: (id: string) => void;
  addNewJarSize: (size: number) => void;
  removeJarSize: (size: number) => void;
  convertToGrams: (value: string, unit: string) => number;
  getSelectedType: (certification: Certification) => string;
  needsProductionReport: () => boolean;
  needsLabReport: () => boolean;
  hasRequiredCertifications: () => boolean;
  isFormValid: () => boolean;
  handleCompleteBatch: (e: React.FormEvent) => void;
  wouldExceedMaximum?: () => boolean;
  router: any;
}

const CompleteBatchForm: React.FC<CompleteBatchFormProps> = ({
  show,
  setShow,
  selectedBatches,
  batches,
  batchJars,
  setBatchJars,
  jarCertifications,
  setJarCertifications,
  formData,
  setFormData,
  tokenBalance,
  predefinedJarSizes,
  newJarSize,
  setNewJarSize,
  newJarUnit,
  setNewJarUnit,
  newJarQuantity,
  setNewJarQuantity,
  removeJarFromBatch,
  addNewJarSize,
  removeJarSize,
  convertToGrams,
  getSelectedType,
  needsProductionReport,
  needsLabReport,
  hasRequiredCertifications,
  isFormValid,
  handleCompleteBatch,
  router
}) => {
  if (!show) return null;

  // Helper functions
  const getTotalRemainingHoneyFromBatch = () => {
  return selectedBatches.reduce((total, batchId) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return total;
    
    // Get remaining honey for this batch (original - already certified)
    const remainingHoney = getRemainingHoneyForBatch(batch);
    return total + remainingHoney;
  }, 0);
};
  const getAllocatedHoneyFromJars = () => {
  return batchJars.reduce((total, jar) => {
    return total + (jar.size * jar.quantity) / 1000; // Convert grams to kg
  }, 0);
};
  const getTotalHoneyFromBatch = () => {
  return selectedBatches.reduce((total, batchId) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return total;
    
    const originalHoney = batch.weightKg || batch.totalHoneyCollected || 0;
    return total + originalHoney;
  }, 0);
};
  const getRemainingHoneyForBatch = (batch: Batch) => {
    const original = batch.weightKg || batch.totalHoneyCollected || 0;
    const certified = batch.honeyCertified || 0;
    return original - certified;
  };
  const wouldExceedMaximum = () => {
  return getAllocatedHoneyFromJars() > getTotalHoneyFromBatch();
};

const getMaxQuantity = () => {
  if (!newJarSize) return 0;
  
  const sizeInGrams = convertToGrams(newJarSize, newJarUnit);
  const sizeInKg = sizeInGrams / 1000;
  
  // Calculate remaining honey available for allocation (not yet allocated to jars)
  const remainingHoneyAvailable = getTotalRemainingHoneyFromBatch() - getAllocatedHoneyFromJars();
  
  if (remainingHoneyAvailable <= 0) return 0;
  
  // Maximum jars we can create with remaining honey
  const maxByHoney = Math.floor(remainingHoneyAvailable / sizeInKg);
  
  // Maximum jars we can afford with current tokens
  const currentJarCount = batchJars.reduce((sum, jar) => sum + jar.quantity, 0);
  const maxByTokens = tokenBalance - currentJarCount;
  
  return Math.min(maxByHoney, Math.max(0, maxByTokens));
};
const [apiaryJars, setApiaryJars] = useState<{[key: number]: CustomJar[]}>({});

const getTotalJarsAcrossApiaries = () => {
  return Object.values(apiaryJars).flat().reduce((sum, jar) => sum + jar.quantity, 0);
};

const addJarToBatch = (sizeInGrams: number, quantity: number) => {
  if (!sizeInGrams || !quantity) return;
  
  const sizeInKg = sizeInGrams / 1000;
  const totalWeightToAdd = sizeInKg * quantity;
  
  // Check if this would exceed remaining honey
  const currentAllocated = getAllocatedHoneyFromJars();
  const remainingHoney = getTotalRemainingHoneyFromBatch();
  
  if (currentAllocated + totalWeightToAdd > remainingHoney) {
    // Calculate maximum quantity we can actually add
    const availableHoney = remainingHoney - currentAllocated;
    const maxQuantity = Math.floor(availableHoney / sizeInKg);
    
    if (maxQuantity <= 0) {
      alert(`Cannot add jars: No remaining honey available for certification.\nRemaining: ${availableHoney.toFixed(2)} kg`);
      return;
    }
    
    alert(`Cannot add ${quantity} jars of ${sizeInGrams}g each.\nThis would require ${totalWeightToAdd.toFixed(2)} kg, but only ${availableHoney.toFixed(2)} kg is available.\nMaximum jars you can add: ${maxQuantity}`);
    return;
  }
  
  // Check token limit
  const totalTokensNeeded = getTotalJarsAcrossApiaries() + quantity;
  if (totalTokensNeeded > tokenBalance) {
    alert(`Insufficient tokens. You need ${totalTokensNeeded} tokens but only have ${tokenBalance}.`);
    return;
  }
  
  // Add the jar
  const newJar = {
    id: Date.now() + Math.random(),
    size: sizeInGrams,
    quantity: quantity
  };
  
  setBatchJars([...batchJars, newJar]);
  
  // Reset form
  setNewJarSize('');
  setNewJarQuantity(1);
};

const isAllHoneyAllocated = () => {
  const remainingHoney = getTotalRemainingHoneyFromBatch();
  const allocatedHoney = getAllocatedHoneyFromJars();
  
  // Consider fully allocated if difference is less than 0.01 kg (10g)
  return Math.abs(remainingHoney - allocatedHoney) < 0.01;
};

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        [fileType]: file
      });
    }
  };

  const handleCertificationChange = (jarId: string, type: 'origin' | 'quality' | 'both') => {
    setJarCertifications({
      ...jarCertifications,
      [jarId]: {
        ...jarCertifications[jarId],
        selectedType: type,
        [type]: true,
        // Reset other types
        ...(type !== 'origin' && { origin: false }),
        ...(type !== 'quality' && { quality: false }),
        ...(type !== 'both' && { both: false })
      }
    });
  };

  return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Complete Batch Information</h3>
        <button
          onClick={() => setShow(false)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <form onSubmit={handleCompleteBatch}>
        <div className="space-y-6">
          
         {/* Enhanced Selected Batches Info - Updated to use weightKg */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800">
                Selected Batches ({selectedBatches.length})
              </h4>
              <span className="text-sm text-gray-500">
                {getTotalRemainingHoneyFromBatch()} kg total available
              </span>
            </div>
            
            <div className="space-y-3">
              {selectedBatches.map(batchId => {
                const batch = batches.find(b => b.id === batchId);
                if (!batch) return null;
                
                const remainingHoney = getRemainingHoneyForBatch(batch);
                // FIXED: Use weightKg as the source of truth for original honey
                const originalHoney = batch.weightKg || batch.totalHoneyCollected || 0;
                const totalCertified = batch.honeyCertified || 0;
                const hasBeenCertified = totalCertified > 0;
                const isFullyProcessed = batch.status === 'completed';
                const isPartiallyProcessed = batch.status === 'partially_completed';
                
                return (
                  <div key={batchId} className="border border-gray-200 rounded-md p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {batch.batchNumber}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isFullyProcessed 
                            ? 'bg-green-100 text-green-800' 
                            : isPartiallyProcessed 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isFullyProcessed ? 'Completed' : isPartiallyProcessed ? 'Partial' : 'New'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {remainingHoney} kg
                        </div>
                        <div className="text-xs text-gray-500">available</div>
                      </div>
                    </div>
                    
                    {/* Progress bar and details */}
                    <div className="space-y-2">
                      {hasBeenCertified && (
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(totalCertified / originalHoney) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-600 whitespace-nowrap">
                            {totalCertified} / {originalHoney} kg
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Original: {originalHoney} kg</span>
                        {hasBeenCertified && (
                          <span>Certified: {totalCertified} kg</span>
                        )}
                        <span className={remainingHoney > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                          Remaining: {remainingHoney} kg
                        </span>
                      </div>
                      
                      {/* Warning for no remaining honey */}
                      {remainingHoney === 0 && (
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-orange-700 text-xs">
                          ⚠️ No honey available for certification
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary Section */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-blue-900 font-semibold">{getTotalRemainingHoneyFromBatch()} kg</div>
                  <div className="text-blue-600 text-xs">Available for Certification</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-green-900 font-semibold">
                    {selectedBatches.reduce((total, id) => {
                      const batch = batches.find(b => b.id === id);
                      return total + (batch?.honeyCertified || 0);
                    }, 0)} kg
                  </div>
                  <div className="text-green-600 text-xs">Previously Certified</div>
                </div>
              </div>
            </div>
            
            {/* Global warning if no honey available */}
            {getTotalRemainingHoneyFromBatch() === 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center text-red-700">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium">No honey available for certification</div>
                    <div className="text-sm">All selected batches have been fully processed.</div>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Token Balance Display */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wallet className="h-6 w-6 text-yellow-600 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800">Your Token Balance</h4>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-yellow-900">{tokenBalance}</p>
                    {getTotalJarsAcrossApiaries() > 0 && (
                      <>
                        <span className="text-gray-400">→</span>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.max(0, tokenBalance - getTotalJarsAcrossApiaries())}
                        </p>
                        <span className="text-sm text-gray-500">(after completion)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-yellow-700">Tokens Needed: {getTotalJarsAcrossApiaries()}</p>
                <p className={`font-bold ${tokenBalance - getTotalJarsAcrossApiaries() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Remaining: {tokenBalance - getTotalJarsAcrossApiaries()} tokens
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm text-yellow-700">
                Need more tokens? 
              </div>
              <button
                type="button"
                onClick={() => router.push('/buy-token')}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center text-sm"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Buy Tokens
              </button>
            </div>
            {tokenBalance - getTotalJarsAcrossApiaries() < 0 && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-red-700 text-sm">
                  ⚠️ Insufficient tokens! You need {Math.abs(tokenBalance - getTotalJarsAcrossApiaries())} more tokens.
                  <button
                    type="button"
                    onClick={() => router.push('/buy-token')}
                    className="ml-2 underline hover:no-underline"
                  >
                    Buy tokens now
                  </button>
                </p>
              </div>
            )}
          </div>

         {/* Custom Jar Definition Section - BATCH BASED with Integrated Jar Size Management */}
<div className="border rounded-md p-4 mb-4">
  <h4 className="font-medium mb-3">Define Jars for This Batch</h4>
  <p className="text-sm text-gray-600 mb-4">
    Select jar sizes and quantities based on the total honey collected from all selected batches.
  </p>

  {/* Batch Summary */}
  <div className="bg-blue-50 p-4 rounded-lg mb-6">
    <h5 className="font-medium text-blue-800 mb-2">Batch Summary</h5>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div>
        <span className="text-gray-600">Selected Batches:</span>
        <span className="ml-2 font-bold">{selectedBatches.length}</span>
      </div>
      <div>
        <span className="text-gray-600">Total Honey Available:</span>
        <span className="ml-2 font-bold text-blue-600">{getTotalHoneyFromBatch()} kg</span>
      </div>
      <div>
        <span className="text-gray-600">Remaining for Jars:</span>
        <span className="ml-2 font-bold text-green-600">
          {(getTotalHoneyFromBatch() - getAllocatedHoneyFromJars()).toFixed(2)} kg
        </span>
      </div>
    </div>
  </div>

  {/* Available Jar Sizes Display */}
  {predefinedJarSizes.length > 0 && (
    <div className="mb-4">
      <p className="text-sm text-gray-600 mb-2">Available jar sizes:</p>
      <div className="flex flex-wrap gap-2">
        {predefinedJarSizes.map((size, index) => (
          <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {size}g
            <button
              type="button"
              onClick={() => removeJarSize(size)}
              className="ml-1 text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )}

  {/* Add New Jar Form */}
  <div className={`bg-white p-4 rounded-lg mb-4 ${isAllHoneyAllocated() ? 'opacity-50' : ''}`}>
    <h6 className="font-medium mb-3">
      Add Jars to Batch
      {isAllHoneyAllocated() && (
        <span className="ml-2 text-sm text-green-600 font-normal">
          ✓ All honey allocated
        </span>
      )}
    </h6>

    {!isAllHoneyAllocated() && getTotalHoneyFromBatch() > 0 ? (
      <div className="space-y-4">
        {/* Jar Size Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jar Size
            </label>
            
            {/* Jar Size Input with Unit Dropdown */}
            <div className="flex">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={newJarSize}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewJarSize(value);
                  
                  // Auto-add to predefined sizes when typing a valid number
                  const numValue = parseFloat(value);
                  if (numValue > 0) {
                    // Convert to grams for storage
                    const sizeInGrams = convertToGrams(value, newJarUnit);
                    if (sizeInGrams > 0 && !predefinedJarSizes.includes(sizeInGrams)) {
                      addNewJarSize(sizeInGrams);
                    }
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  const numValue = parseFloat(value);
                  if (numValue > 0) {
                    const sizeInGrams = convertToGrams(value, newJarUnit);
                    if (sizeInGrams > 0 && !predefinedJarSizes.includes(sizeInGrams)) {
                      addNewJarSize(sizeInGrams);
                    }
                  }
                }}
                placeholder="Enter size..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={newJarUnit}
                onChange={(e) => setNewJarUnit(e.target.value)}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="g">grams</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
            
            {/* Show conversion info */}
            {newJarSize && newJarUnit && (
              <div className="mt-1 text-xs text-gray-500">
                {newJarUnit === 'lbs' ? (
                  <span>≈ {convertToGrams(newJarSize, newJarUnit)}g</span>
                ) : (
                  <span>≈ {(parseFloat(newJarSize) / 453.592).toFixed(3)} lbs</span>
                )}
              </div>
            )}
            
            {/* Show existing sizes as clickable chips */}
            {predefinedJarSizes.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Quick select:</p>
                <div className="flex flex-wrap gap-1">
                  {predefinedJarSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        if (newJarUnit === 'lbs') {
                          setNewJarSize((size / 453.592).toFixed(3));
                        } else {
                          setNewJarSize(size.toString());
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded-full border ${
                        convertToGrams(newJarSize, newJarUnit) === size
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {size}g
                      <span className="text-gray-400 ml-1">
                        ({(size / 453.592).toFixed(2)}lbs)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity & Actions
            </label>
            
            <div className="space-y-3">
              {/* Quantity Input */}
              <div>
                <input
                  type="number"
                  min="1"
                  max={getMaxQuantity()}
                  value={newJarQuantity}
                  onChange={(e) => setNewJarQuantity(parseInt(e.target.value) || 1)}
                  disabled={!newJarSize}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Quantity"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max: {getMaxQuantity()} jars
                </p>
              </div>

              {/* Weight Preview */}
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                <span className="text-sm">
                  Total: {(() => {
                    if (!newJarSize || !newJarQuantity) return '0 kg';
                    const sizeInGrams = convertToGrams(newJarSize, newJarUnit);
                    return ((sizeInGrams * newJarQuantity) / 1000).toFixed(2) + ' kg';
                  })()}
                </span>
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={() => {
                  // Convert to grams before adding
                  const sizeInGrams = convertToGrams(newJarSize, newJarUnit);
                  addJarToBatch(sizeInGrams, newJarQuantity);
                }}
                disabled={!newJarSize || !parseFloat(newJarSize)}
                className={`w-full px-4 py-2 rounded-md flex items-center justify-center ${
                  newJarSize && parseFloat(newJarSize)
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Jars
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : getTotalHoneyFromBatch() === 0 ? (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800 font-medium">
            No honey available for jar creation
          </p>
        </div>
        <p className="text-red-600 text-sm mt-1">
          Selected batches have 0 kg of honey collected. Cannot create jars without honey.
        </p>
      </div>
    ) : (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800 font-medium">
            All honey from selected batches has been allocated to jars
          </p>
        </div>
        <p className="text-green-600 text-sm mt-1">
          Delete some jars if you want to create different jar configurations
        </p>
      </div>
    )}
  </div>

  {/* Jars list */}
  {batchJars.length > 0 && (
    <div className="space-y-3">
      <h6 className="font-medium">Defined Jars for This Batch</h6>
      {batchJars.map((jar) => (
        <div key={jar.id} className="flex items-center justify-between p-3 bg-white border rounded-md">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-medium">{jar.quantity}x {jar.size}g jars</span>
              <span className="text-gray-400 ml-1">({(jar.size / 453.592).toFixed(2)} lbs)</span>
              <span className="text-gray-500 ml-2">
                = {((jar.size * jar.quantity) / 1000).toFixed(2)} kg total
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeJarFromBatch(jar.id)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      <div className={`p-3 rounded-lg ${isAllHoneyAllocated() ? 'bg-green-50 border border-green-200' : 'bg-blue-50'}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Jars:</span>
            <span className="ml-2 font-bold">
              {batchJars.reduce((sum, jar) => sum + jar.quantity, 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Weight:</span>
            <span className="ml-2 font-bold">
              {batchJars
                .reduce((sum, jar) => sum + (jar.size * jar.quantity) / 1000, 0)
                .toFixed(2)}{' '}
              kg
            </span>
          </div>
          <div>
            <span className="text-gray-600">Remaining:</span>
            <span className={`ml-2 font-bold ${isAllHoneyAllocated() ? 'text-green-600' : 'text-blue-600'}`}>
              {(getTotalHoneyFromBatch() - getAllocatedHoneyFromJars()).toFixed(2)} kg
              {isAllHoneyAllocated() && (
                <span className="ml-1 text-green-500">✓</span>
              )}
            </span>
          </div>
        </div>
        {isAllHoneyAllocated() && (
          <div className="mt-2 text-center">
            <span className="text-green-700 text-sm font-medium">
              🎯 Perfect allocation! All honey from selected batches is assigned to jars.
            </span>
          </div>
        )}
      </div>
    </div>
  )}

  {/* Empty placeholder if no jars defined */}
  {batchJars.length === 0 && !isAllHoneyAllocated() && getTotalHoneyFromBatch() > 0 && (
    <div
      className="border border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
      onClick={() => {
        if (predefinedJarSizes.length > 0 && !newJarSize) {
          setNewJarSize(predefinedJarSizes[0].toString());
          setNewJarQuantity(1);
          setNewJarUnit('g');
        }
      }}
    >
      <PlusCircle className="h-6 w-6 mx-auto text-gray-400 mb-2" />
      <p className="text-gray-500">
        Click to add jars for this batch or enter a custom jar size above
      </p>
    </div>
  )}
  
  {batchJars.length === 0 && getTotalHoneyFromBatch() === 0 && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <AlertCircle className="h-6 w-6 mx-auto text-red-500 mb-2" />
      <p className="text-red-700 font-medium">Cannot add jars - No honey available</p>
      <p className="text-red-600 text-sm">
        Selected batches have 0 kg of honey collected
      </p>
    </div>
  )}

  {/* Overall Summary */}
  {batchJars.length > 0 && (
    <div className={`mt-4 p-4 rounded-lg ${isAllHoneyAllocated() ? 'bg-green-50 border border-green-200' : 'bg-yellow-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium">Overall Summary</h5>
        {isAllHoneyAllocated() && (
          <span className="flex items-center text-green-600 text-sm font-medium">
            <Check className="h-4 w-4 mr-1" />
            Complete Allocation
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Total Jars:</span>
          <span className="ml-2 font-bold">{batchJars.reduce((sum, jar) => sum + jar.quantity, 0)}</span>
        </div>
        <div>
          <span className="text-gray-600">Total Weight:</span>
          <span className="ml-2 font-bold">
            {batchJars.reduce((sum, jar) => sum + (jar.size * jar.quantity / 1000), 0).toFixed(2)} kg
          </span>
        </div>
        <div>
          <span className="text-gray-600">Total Available:</span>
          <span className="ml-2 font-bold text-blue-600">
            {getTotalHoneyFromBatch()} kg
          </span>
        </div>
        <div>
          <span className="text-gray-600">Tokens Needed:</span>
          <span className="ml-2 font-bold text-yellow-600">
            {batchJars.reduce((sum, jar) => sum + jar.quantity, 0)} tokens
          </span>
        </div>
      </div>
    </div>
  )}
</div>

{/* Certification Selection for Jars - BATCH BASED (Updated) */}
{batchJars.length > 0 && (
  <div className="border rounded-md p-4 mb-4">
    <h4 className="font-medium mb-3">Select Certifications for Your Jars</h4>
    <p className="text-sm text-gray-600 mb-4">
      Choose which certifications you want for each jar type. Each jar requires 1 token regardless of certification type.
    </p>
    
    <div className="space-y-4">
      {batchJars.map((jar, index) => (
        <div key={jar.id} className="border rounded-md p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium">
              {jar.quantity}x {jar.size}g jars 
              <span className="text-sm text-gray-500 ml-2">
                ({((jar.size * jar.quantity) / 1000).toFixed(2)} kg total)
              </span>
            </h5>
          </div>
                    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin Certification */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`origin-${jar.id}`}
                checked={jarCertifications[jar.id]?.origin || false}
                onChange={(e) => {
                  const currentCertification = jarCertifications[jar.id] || {};
                  const updatedCertification = {
                    ...currentCertification,
                    origin: e.target.checked,
                    selectedType: getSelectedType({
                      ...currentCertification,
                      origin: e.target.checked
                    })
                  };
                  
                  setJarCertifications({
                    ...jarCertifications,
                    [jar.id]: updatedCertification
                  });
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
              />
              <label htmlFor={`origin-${jar.id}`} className="ml-2 text-sm">
                <span className="font-medium text-blue-600">Origin Certification</span>
                <br />
                <span className="text-xs text-gray-500">Certifies geographic origin</span>
              </label>
            </div>

            {/* Quality Certification */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`quality-${jar.id}`}
                checked={jarCertifications[jar.id]?.quality || false}
                onChange={(e) => {
                  const currentCertification = jarCertifications[jar.id] || {};
                  const updatedCertification = {
                    ...currentCertification,
                    quality: e.target.checked,
                    selectedType: getSelectedType({
                      ...currentCertification,
                      quality: e.target.checked
                    })
                  };
                  
                  setJarCertifications({
                    ...jarCertifications,
                    [jar.id]: updatedCertification
                  });
                }}
                className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
              />
              <label htmlFor={`quality-${jar.id}`} className="ml-2 text-sm">
                <span className="font-medium text-green-600">Quality Certification</span>
                <br />
                <span className="text-xs text-gray-500">Certifies quality standards</span>
              </label>
            </div>
          </div>

          {/* Show warning if no certification selected */}
          {!jarCertifications[jar.id]?.origin && !jarCertifications[jar.id]?.quality && (
            <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded-md">
              <p className="text-orange-700 text-sm">
                ⚠️ Please select at least one certification type for these jars.
              </p>
            </div>
          )}

          {/* Show selected certifications */}
          {(jarCertifications[jar.id]?.origin || jarCertifications[jar.id]?.quality) && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700 text-sm">
                ✓ Selected: {[
                  jarCertifications[jar.id]?.origin && 'Origin',
                  jarCertifications[jar.id]?.quality && 'Quality'
                ].filter(Boolean).join(' + ')}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Certification Summary - Updated for batch jars */}
    <div className="bg-yellow-50 p-4 rounded-lg mt-4">
      <h5 className="font-medium mb-2">Certification Summary</h5>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Origin Only:</span>
          <span className="ml-2 font-bold text-blue-600">
            {batchJars.filter(jar => jarCertifications[jar.id]?.origin && !jarCertifications[jar.id]?.quality).length} jar types
          </span>
        </div>
        <div>
          <span className="text-gray-600">Quality Only:</span>
          <span className="ml-2 font-bold text-green-600">
            {batchJars.filter(jar => jarCertifications[jar.id]?.quality && !jarCertifications[jar.id]?.origin).length} jar types
          </span>
        </div>
        <div>
          <span className="text-gray-600">Both Selected:</span>
          <span className="ml-2 font-bold text-purple-600">
            {batchJars.filter(jar => jarCertifications[jar.id]?.origin && jarCertifications[jar.id]?.quality).length} jar types
          </span>
        </div>
        <div>
          <span className="text-gray-600">Total Tokens:</span>
          <span className="ml-2 font-bold text-yellow-600">
            {batchJars.reduce((sum, jar) => sum + jar.quantity, 0)} tokens
          </span>
        </div>
      </div>
    </div>
  </div>
)}

{/* File Upload Section - Updated for batch-based approach */}
{batchJars.length > 0 && hasRequiredCertifications() && (
  <div className="border rounded-md p-4 mb-4">
    <h4 className="font-medium mb-3">Required Documents</h4>
    
    {/* Production Report Upload - for Origin certification */}
    {needsProductionReport() && (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Production Report <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-2">(Required for Origin certification)</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => setFormData({
              ...formData, 
              productionReport: e.target.files[0]
            })}
            className="hidden"
            id="production-report-upload"
          />
          <label 
            htmlFor="production-report-upload" 
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 text-center">
              {formData.productionReport 
                ? `Selected: ${formData.productionReport.name}`
                : 'Click to upload production report (PDF, DOC, DOCX, JPG, PNG)'
              }
            </p>
          </label>
        </div>
      </div>
    )}

    {/* Lab Report Upload - for Quality certification */}
    {needsLabReport() && (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lab Report <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-2">(Required for Quality certification)</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => setFormData({
              ...formData, 
              labReport: e.target.files[0]
            })}
            className="hidden"
            id="lab-report-upload"
          />
          <label 
            htmlFor="lab-report-upload" 
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 text-center">
              {formData.labReport 
                ? `Selected: ${formData.labReport.name}`
                : 'Click to upload lab report (PDF, DOC, DOCX, JPG, PNG)'
              }
            </p>
          </label>
        </div>
      </div>
    )}
  </div>
)}

{/* Form Actions - Updated token calculation */}
<div className="flex justify-end space-x-3">
  <button
    type="button"
    onClick={() => setShow(false)}
    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
  >
    Cancel
  </button>
  
  <button
    type="submit"
    disabled={!isFormValid()}
    className={`px-4 py-2 rounded-md flex items-center ${
      isFormValid()
        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }`}
  >
    <Check className="h-4 w-4 mr-2" />
    Complete & Pay {batchJars.reduce((sum, jar) => sum + jar.quantity, 0)} Tokens
  </button>
</div>
        </div>
      </form>
    </div>
  </div>
  );
};

export default CompleteBatchForm;