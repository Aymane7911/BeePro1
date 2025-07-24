import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Layers, Database, Tag, Package, RefreshCw, Menu, X, Home, Settings, Users, Activity, HelpCircle, Wallet, PlusCircle, MapPin, CheckCircle, Trash2, Globe, FileText, AlertCircle, Sparkles, LogOut, Plus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

// Unified Apiary interface compatible with both versions
interface ApiaryLocation {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
}

interface Apiary {
  id: string;
  name: string;
  number: number;
  hiveCount: number;
  // Support both naming conventions
  honeyCollected?: number;
  kilosCollected?: number;
  location: ApiaryLocation;
  createdAt?: string;
}

interface ApiaryDetailsModalProps {
  apiary: Apiary;
  onClose: () => void;
}

const ApiaryDetailsModal = ({ apiary, onClose }: ApiaryDetailsModalProps) => {
  // Get honey collected value regardless of property name
  const honeyCollected = apiary.honeyCollected ?? apiary.kilosCollected ?? 0;
  
  // Get coordinates using any valid property name
  const latitude = apiary.location?.latitude ?? apiary.location?.lat;
  const longitude = apiary.location?.longitude ?? apiary.location?.lng;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{apiary.name}</h3>
                <p className="text-blue-100 text-sm">Apiary Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Apiary ID:</span>
              <span className="font-semibold text-gray-800">{apiary.number}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Number of Hives:</span>
              <span className="font-semibold text-gray-800">{apiary.hiveCount}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Honey Collected:</span>
              <span className="font-semibold text-gray-800">{honeyCollected}</span>
            </div>

            {latitude !== undefined && longitude !== undefined && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600 block mb-2">Location:</span>
                <div className="text-sm text-gray-800">
                  <div>Latitude: {latitude.toFixed(6)}</div>
                  <div>Longitude: {longitude.toFixed(6)}</div>
                </div>
              </div>
            )}

            {apiary.createdAt && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Created:</span>
                <span className="text-sm text-gray-800">
                  {new Date(apiary.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ApiaryMapSectionProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  selectedApiary: Apiary | null;
  setSelectedApiary: React.Dispatch<React.SetStateAction<Apiary | null>>;
}

const ApiaryMapSection = ({ 
  mapRef, 
  selectedApiary, 
  setSelectedApiary 
}: ApiaryMapSectionProps) => (
  <div className="bg-white p-4 rounded-lg shadow text-black h-fit">
    <h2 className="text-lg font-semibold mb-4">Apiary Locations</h2>
    <p className="text-sm text-gray-600 mb-3">View all your apiaries on the map. Click markers to see details.</p>
    <div 
      ref={mapRef}
      className="w-full rounded-lg border border-gray-300"
      style={{ height: '450px' }}
    />
    {selectedApiary && (
      <ApiaryDetailsModal 
        apiary={selectedApiary} 
        onClose={() => setSelectedApiary(null)} 
      />
    )}
  </div>
);

export default ApiaryMapSection;