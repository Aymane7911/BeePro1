import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Layers, Database, Tag, Package, RefreshCw, Menu, X, Home, Settings, Users, Activity, HelpCircle, Wallet, PlusCircle, MapPin, CheckCircle, Trash2, Globe, FileText, AlertCircle, Sparkles, LogOut, Plus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface ApiaryLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  createdAt?: string;
}

interface ApiaryFormData {
  name: string;
  number: string;
  hiveCount: number;
  honeyCollected: number;
  location: ApiaryLocation | null;
  locationName?: string; // Add optional location name field
}

interface CreateApiaryModalProps {
  showApiaryModal: boolean;
  setShowApiaryModal: (show: boolean) => void;
  apiaryFormData: ApiaryFormData;
  setApiaryFormData: (data: ApiaryFormData | ((prev: ApiaryFormData) => ApiaryFormData)) => void;
  savedApiaryLocations: ApiaryLocation[];
  mapsLinkInput: string;
  setMapsLinkInput: (value: string) => void;
  handleMapsLinkSubmit: () => void;
  miniMapRef: React.RefObject<HTMLDivElement>;
  miniGoogleMapRef: React.MutableRefObject<any>;
  saveApiaryToDatabase: (apiary: ApiaryFormData) => Promise<void>;
  refreshApiariesFromDatabase: () => Promise<void>;
  isLoadingApiaries: boolean;
}

const CreateApiaryModal = ({
  showApiaryModal,
  setShowApiaryModal,
  apiaryFormData,
  setApiaryFormData,
  savedApiaryLocations,
  mapsLinkInput,
  setMapsLinkInput,
  handleMapsLinkSubmit,
  miniMapRef,
  miniGoogleMapRef,
  saveApiaryToDatabase,
  refreshApiariesFromDatabase,
  isLoadingApiaries
}: CreateApiaryModalProps) => {
  
  const resetFormData = (): ApiaryFormData => ({
    name: '',
    number: '',
    hiveCount: 0,
    honeyCollected: 0,
    location: null,
    locationName: '' // Reset location name as well
  });

  return showApiaryModal ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Create New Apiary</h3>
                <p className="text-yellow-100 text-sm">Add a new apiary location to your collection</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowApiaryModal(false);
                setApiaryFormData(resetFormData());
              }}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(90vh - 120px)' }}>
          {/* Left Panel - Form */}
          <div className="lg:w-1/2 p-6 overflow-y-auto bg-gray-50">
            <div className="space-y-6">
              {/* Apiary Details Section */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="bg-blue-100 p-1 rounded mr-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  Apiary Details
                </h4>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Apiary Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apiary Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={apiaryFormData.name}
                      onChange={(e) => setApiaryFormData((prev: ApiaryFormData) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="e.g., Sunrise Meadow Apiary"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Apiary Number/ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apiary Number/ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={apiaryFormData.number}
                      onChange={(e) => setApiaryFormData((prev: ApiaryFormData) => ({ ...prev, number: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="e.g., APY-001"
                      required
                    />
                  </div>

                  {/* Hive Count and Honey Collected */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Hives <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={apiaryFormData.hiveCount}
                        onChange={(e) => setApiaryFormData((prev: ApiaryFormData) => ({ ...prev, hiveCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Settings Section */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="bg-green-100 p-1 rounded mr-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  Location Settings
                </h4>

                {/* Location Name Input - New Addition */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={apiaryFormData.locationName || ''}
                    onChange={(e) => setApiaryFormData((prev: ApiaryFormData) => ({ ...prev, locationName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="e.g., Sunny Valley Farm, Behind Oak Tree, North Field..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Give this location a memorable name. If left empty, coordinates will be used.
                  </p>
                </div>

                {/* Current Location Display */}
                {apiaryFormData.location ? (
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="bg-green-100 p-1 rounded mr-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="font-medium text-green-800">
                            {apiaryFormData.locationName || apiaryFormData.location.name || 'Selected Location'}
                          </p>
                        </div>
                        <p className="text-sm text-green-600 ml-7">
                          📍 {apiaryFormData.location.latitude.toFixed(6)}, {apiaryFormData.location.longitude.toFixed(6)}
                        </p>
                        {apiaryFormData.locationName && (
                          <p className="text-xs text-green-500 ml-7 mt-1">
                            Custom location name will be saved
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setApiaryFormData((prev: ApiaryFormData) => ({ ...prev, location: null }))}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Remove location"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-amber-100 p-1 rounded mr-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      </div>
                      <p className="text-sm text-amber-800">
                        Choose from saved locations, click on the map, or paste a Google Maps link
                      </p>
                    </div>
                  </div>
                )}

                {/* Saved Locations Dropdown */}
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 p-1 rounded mr-2">
                      <Star className="h-4 w-4 text-purple-600" />
                    </div>
                    <h5 className="font-medium text-purple-800">Saved Locations</h5>
                  </div>
                  
                  {savedApiaryLocations && savedApiaryLocations.length > 0 ? (
                    <>
                      <select
                        value=""
                        onChange={(e) => {
                          const locationId = e.target.value;
                          if (locationId) {
                            const selectedLocation = savedApiaryLocations.find(loc => loc.id === parseInt(locationId));
                            if (selectedLocation) {
                              setApiaryFormData((prev: ApiaryFormData) => ({
                                ...prev,
                                location: {
                                  ...selectedLocation,
                                  lat: selectedLocation.latitude,
                                  lng: selectedLocation.longitude
                                },
                                // Pre-fill location name if it exists from saved location
                                locationName: selectedLocation.name || prev.locationName || ''
                              }));
                            }
                            e.target.value = "";
                          }
                        }}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">🏠 Select from your saved locations...</option>
                        {savedApiaryLocations.map(location => (
                          <option key={location.id} value={location.id}>
                            📍 {location.name} - {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-purple-300 mb-2">
                        <Star className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-sm text-purple-600 mb-2">No saved locations yet</p>
                      <button
                        type="button"
                        className="mt-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md text-xs transition-colors"
                      >
                        🔄 Refresh Locations
                      </button>
                    </div>
                  )}
                </div>

                {/* Google Maps Link Input Section */}
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <h5 className="font-medium text-blue-800">Set Location via Link or Coordinates</h5>
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={mapsLinkInput}
                      onChange={(e) => setMapsLinkInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="https://maps.google.com/... or 25.2048, 55.2708"
                    />
                    <button
                      type="button"
                      onClick={handleMapsLinkSubmit}
                      disabled={!mapsLinkInput.trim()}
                      className={`px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center space-x-1 ${
                        mapsLinkInput.trim()
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">Set</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Mini Map */}
          <div className="lg:w-1/2 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <div className="bg-blue-100 p-1 rounded mr-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                </div>
                Interactive Location Map
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Click anywhere on the map to set your apiary location
              </p>
            </div>
            
            <div className="flex-1 p-4">
              <div className="h-full relative">
                <div 
                  ref={miniMapRef}
                  className="w-full h-full rounded-lg border-2 border-gray-300 cursor-crosshair shadow-inner bg-gray-100 relative overflow-hidden"
                  style={{ minHeight: '400px', height: '100%' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading map...</p>
                    </div>
                  </div>
                </div>
                
                {/* Map controls overlay */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
                  <button 
                    className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-xs font-bold"
                    onClick={() => {
                      if (miniGoogleMapRef.current) {
                        const currentZoom = miniGoogleMapRef.current.getZoom();
                        miniGoogleMapRef.current.setZoom(currentZoom + 1);
                      }
                    }}
                  >
                    +
                  </button>
                  <button 
                    className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-xs font-bold"
                    onClick={() => {
                      if (miniGoogleMapRef.current) {
                        const currentZoom = miniGoogleMapRef.current.getZoom();
                        miniGoogleMapRef.current.setZoom(currentZoom - 1);
                      }
                    }}
                  >
                    −
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {apiaryFormData.location ? (
                <div className="flex items-center space-x-4">
                  <span className="text-green-600 font-medium">✓ Location selected</span>
                  {apiaryFormData.locationName && (
                    <span className="text-blue-600 text-xs">📍 Custom name: "{apiaryFormData.locationName}"</span>
                  )}
                </div>
              ) : (
                <span>Location required</span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowApiaryModal(false);
                  setApiaryFormData(resetFormData());
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              
              <button
                onClick={async () => {
                  try {
                    await saveApiaryToDatabase(apiaryFormData);
                    setShowApiaryModal(false);
                    setApiaryFormData(resetFormData());
                    await refreshApiariesFromDatabase();
                  } catch (error) {
                    console.error('Error saving apiary:', error);
                  }
                }}
                disabled={!apiaryFormData.name || !apiaryFormData.number || !apiaryFormData.location || isLoadingApiaries}
                className={`px-8 py-2 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 ${
                  (apiaryFormData.name && apiaryFormData.number && apiaryFormData.location && !isLoadingApiaries)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoadingApiaries ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>Create Apiary</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default CreateApiaryModal;