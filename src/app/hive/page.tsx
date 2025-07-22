'use client'

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Thermometer, Droplets, Weight, Battery, MapPin, Camera, Volume2, Calendar, Folder, X, ChevronRight } from 'lucide-react';

// Types
interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  weight: number;
  battery: number;
  externalTemperature?: number;
  externalHumidity?: number;
}

interface MediaFile {
  id: string;
  name: string;
  url: string;
  timestamp: string;
  type: 'image' | 'audio';
}

interface Hive {
  id: number;
  name: string;
  data: SensorData[];
  isActive: boolean;
  gps?: { lat: number; lng: number };
  images?: MediaFile[];
  sounds?: MediaFile[];
}

// Sample data generator
const generateSampleData = (days: number = 7, isCentral: boolean = false): SensorData[] => {
  const data: SensorData[] = [];
  const now = new Date();
  
  for (let i = days * 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseData: SensorData = {
      timestamp: timestamp.toISOString(),
      temperature: 20 + Math.random() * 15 + Math.sin(i / 24) * 5,
      humidity: 40 + Math.random() * 30 + Math.sin(i / 12) * 10,
      weight: 45 + Math.random() * 10 + Math.sin(i / 168) * 5,
      battery: Math.min(100, Math.max(20, 100 - (i / 24) * 2 + Math.random() * 10))
    };
    
    // Add external sensors for central hive
    if (isCentral) {
      baseData.externalTemperature = 15 + Math.random() * 20 + Math.sin(i / 24) * 8;
      baseData.externalHumidity = 30 + Math.random() * 40 + Math.sin(i / 12) * 15;
    }
    
    data.push(baseData);
  }
  return data;
};

// Generate sample media files
const generateMediaFiles = (type: 'image' | 'audio', count: number = 10): MediaFile[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    name: type === 'image' ? `IMG_${String(i + 1).padStart(3, '0')}.jpg` : `AUDIO_${String(i + 1).padStart(3, '0')}.wav`,
    url: type === 'image' 
      ? `https://picsum.photos/300/200?random=${i + 1}` 
      : `#audio-${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    type
  }));
};

// Generate sample hives
const generateHives = (): Hive[] => {
  const hives: Hive[] = [];
  
  // Central hive (ID 0)
  hives.push({
    id: 0,
    name: 'Central Hive',
    data: generateSampleData(7, true),
    isActive: true,
    gps: { lat: 40.7128, lng: -74.0060 },
    images: generateMediaFiles('image', 15),
    sounds: generateMediaFiles('audio', 8)
  });
  
  // Regular hives
  for (let i = 1; i <= 12; i++) {
    hives.push({
      id: i,
      name: `Hive ${i}`,
      data: generateSampleData(),
      isActive: Math.random() > 0.1
    });
  }
  
  return hives;
};

const HiveCard: React.FC<{ hive: Hive; onClick: () => void }> = ({ hive, onClick }) => {
  const latestData = hive.data[hive.data.length - 1];
  
  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-green-500';
    if (battery > 30) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl transform hover:scale-105 h-full flex flex-col ${
        hive.isActive ? 'border-green-400' : 'border-gray-300'
      } ${hive.id === 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400' : ''}`}
      onClick={onClick}
    >
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-bold text-lg ${hive.id === 0 ? 'text-blue-700' : 'text-gray-800'}`}>
            {hive.name}
          </h3>
          <div className={`w-3 h-3 rounded-full ${hive.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
        </div>
        
        {hive.id === 0 && hive.gps && (
          <div className="flex items-center text-sm text-blue-600 mb-2">
            <MapPin size={14} className="mr-1" />
            GPS: {hive.gps.lat.toFixed(4)}, {hive.gps.lng.toFixed(4)}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <Thermometer size={16} className="mr-2 text-red-500" />
            <span>{latestData.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center">
            <Droplets size={16} className="mr-2 text-blue-500" />
            <span>{latestData.humidity.toFixed(1)}%</span>
          </div>
          <div className="flex items-center">
            <Weight size={16} className="mr-2 text-purple-500" />
            <span>{latestData.weight.toFixed(1)}kg</span>
          </div>
          <div className="flex items-center">
            <Battery size={16} className={`mr-2 ${getBatteryColor(latestData.battery)}`} />
            <span>{latestData.battery.toFixed(0)}%</span>
          </div>
        </div>
        
        {/* Show external sensors for central hive */}
        {hive.id === 0 && latestData.externalTemperature && latestData.externalHumidity && (
          <div className="grid grid-cols-2 gap-3 text-xs mt-2 pt-2 border-t border-blue-200">
            <div className="flex items-center text-blue-600">
              <Thermometer size={12} className="mr-1" />
              Ext: {latestData.externalTemperature.toFixed(1)}°C
            </div>
            <div className="flex items-center text-blue-600">
              <Droplets size={12} className="mr-1" />
              Ext: {latestData.externalHumidity.toFixed(1)}%
            </div>
          </div>
        )}
        
        {hive.id === 0 && (
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-blue-200">
            <div className="flex items-center text-xs text-blue-600">
              <Camera size={12} className="mr-1" />
              {hive.images?.length} images
            </div>
            <div className="flex items-center text-xs text-blue-600">
              <Volume2 size={12} className="mr-1" />
              {hive.sounds?.length} sounds
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DataChart: React.FC<{ data: SensorData[]; type: string }> = ({ data, type }) => {
  const chartData = data.slice(-24).map(d => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));
  
  const config = {
    temperature: { color: '#ef4444', unit: '°C', icon: Thermometer, label: 'Internal Temperature' },
    humidity: { color: '#3b82f6', unit: '%', icon: Droplets, label: 'Internal Humidity' },
    weight: { color: '#8b5cf6', unit: 'kg', icon: Weight, label: 'Weight' },
    battery: { color: '#10b981', unit: '%', icon: Battery, label: 'Battery' },
    externalTemperature: { color: '#f59e0b', unit: '°C', icon: Thermometer, label: 'External Temperature' },
    externalHumidity: { color: '#06b6d4', unit: '%', icon: Droplets, label: 'External Humidity' }
  };
  
  const { color, unit, icon: Icon, label } = config[type as keyof typeof config];
  
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex items-center mb-4">
        <Icon size={20} className="mr-2" style={{ color }} />
        <h4 className="font-semibold">{label}</h4>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} ${unit}`, label]} />
          <Area type="monotone" dataKey={type} stroke={color} fill={color} fillOpacity={0.1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const MediaGallery: React.FC<{ files: MediaFile[]; type: 'image' | 'audio' }> = ({ files, type }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex items-center mb-4">
        {type === 'image' ? <Camera size={20} className="mr-2" /> : <Volume2 size={20} className="mr-2" />}
        <h4 className="font-semibold capitalize">{type}s</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <div key={file.id} className="group">
            {type === 'image' ? (
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={file.url} 
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Volume2 size={32} className="text-gray-600" />
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{new Date(file.timestamp).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const HiveModal: React.FC<{ hive: Hive | null; onClose: () => void }> = ({ hive, onClose }) => {
  const [activeFolder, setActiveFolder] = useState<string>('temperature');
  
  if (!hive) return null;
  
  const folders = hive.id === 0 
    ? ['temperature', 'humidity', 'externalTemperature', 'externalHumidity', 'weight', 'battery', 'images', 'sounds', 'gps']
    : ['temperature', 'humidity', 'weight', 'battery'];
  
  const getFolderLabel = (folder: string) => {
    const labels: { [key: string]: string } = {
      temperature: 'Internal Temperature',
      humidity: 'Internal Humidity',
      externalTemperature: 'External Temperature',
      externalHumidity: 'External Humidity',
      weight: 'Weight',
      battery: 'Battery',
      images: 'Images',
      sounds: 'Sounds',
      gps: 'GPS'
    };
    return labels[folder] || folder;
  };
  
  const renderContent = () => {
    switch (activeFolder) {
      case 'temperature':
      case 'humidity':
      case 'weight':
      case 'battery':
      case 'externalTemperature':
      case 'externalHumidity':
        return <DataChart data={hive.data} type={activeFolder} />;
      case 'images':
        return hive.images ? <MediaGallery files={hive.images} type="image" /> : null;
      case 'sounds':
        return hive.sounds ? <MediaGallery files={hive.sounds} type="audio" /> : null;
      case 'gps':
        return hive.gps ? (
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center mb-4">
              <MapPin size={20} className="mr-2" />
              <h4 className="font-semibold">GPS Location</h4>
            </div>
            <div className="space-y-2">
              <p><strong>Latitude:</strong> {hive.gps.lat}</p>
              <p><strong>Longitude:</strong> {hive.gps.lng}</p>
              <div className="mt-4 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-600">Map View Placeholder</p>
              </div>
            </div>
          </div>
        ) : null;
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl max-h-[90vh] w-full overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{hive.name}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                <Folder size={16} className="mr-2" />
                Data Folders
              </h4>
              <div className="space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeFolder === folder ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm">{getFolderLabel(folder)}</span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HiveMonitoringDashboard: React.FC = () => {
  const [hives, setHives] = useState<Hive[]>([]);
  const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
  
  useEffect(() => {
    setHives(generateHives());
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Hive Monitoring Dashboard</h1>
            <p className="text-gray-600">Monitor your beehive network in real-time</p>
          </div>
          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
            <img 
              src="/FRC_logo.png" 
              alt="FRC"
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-semibold text-gray-600">Total Hives</h3>
            <p className="text-2xl font-bold text-gray-800">{hives.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-semibold text-gray-600">Active Hives</h3>
            <p className="text-2xl font-bold text-green-600">{hives.filter(h => h.isActive).length}</p>
          </div>
        </div>
        
        {/* Hive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {hives.map((hive) => (
            <HiveCard
              key={hive.id}
              hive={hive}
              onClick={() => setSelectedHive(hive)}
            />
          ))}
        </div>
        
        {/* Modal */}
        {selectedHive && (
          <HiveModal
            hive={selectedHive}
            onClose={() => setSelectedHive(null)}
          />
        )}
      </div>
    </div>
  );
};

export default HiveMonitoringDashboard;