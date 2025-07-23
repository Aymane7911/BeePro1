'use client'

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Thermometer, Droplets, Weight, Battery, MapPin, Camera, Volume2, Calendar, Folder, X, ChevronRight, Menu, Home, BarChart3, Settings, Bell, Users } from 'lucide-react';

// Leaflet imports for maps
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

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
      // Adjusted weight to range strictly between 15-30kg
      weight: Math.max(15, Math.min(30, 22.5 + (Math.random() - 0.5) * 6 + Math.sin(i / 168) * 3)),
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
    gps: { lat: 25.577861, lng: 56.269278 },
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

const FloatingHexagon: React.FC<{ delay: number; size: string; position: string; opacity?: string }> = ({ 
  delay, 
  size, 
  position, 
  opacity = "opacity-10" 
}) => (
  <div 
    className={`absolute ${position} ${size} ${opacity} animate-pulse`}
    style={{ animationDelay: `${delay}s`, animationDuration: '4s' }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-400">
      <polygon points="50,5 85,25 85,75 50,95 15,75 15,25" />
    </svg>
  </div>
);

const FloatingBee: React.FC<{ delay: number; position: string; size?: string }> = ({ delay, position, size = "text-2xl" }) => (
  <div 
    className={`absolute ${position} ${size} animate-bounce opacity-30`}
    style={{ animationDelay: `${delay}s`, animationDuration: '6s' }}
  >
    🐝
  </div>
);

const HiveCard: React.FC<{ hive: Hive; onClick: () => void }> = ({ hive, onClick }) => {
  const latestData = hive.data[hive.data.length - 1];
  
  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-green-500';
    if (battery > 30) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div 
      className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-2xl transform hover:scale-105 h-full flex flex-col border-white/30 ${
        hive.isActive ? 'hover:border-green-400' : 'hover:border-gray-400'
      } ${hive.id === 0 ? 'bg-gradient-to-br from-blue-50/90 to-indigo-50/90 hover:border-blue-400' : ''}`}
      onClick={onClick}
    >
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-bold text-lg ${hive.id === 0 ? 'text-blue-700' : 'text-gray-800'}`}>
            {hive.name}
          </h3>
          <div className={`w-3 h-3 rounded-full animate-pulse ${hive.isActive ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-400'}`} />
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
            <span className="text-black">{latestData.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center">
            <Droplets size={16} className="mr-2 text-blue-500" />
            <span className="text-black">{latestData.humidity.toFixed(1)}%</span>
          </div>
          <div className="flex items-center">
            <Weight size={16} className="mr-2 text-purple-500" />
            <span className="text-black">{latestData.weight.toFixed(1)}kg</span>
          </div>
          <div className="flex items-center">
            <Battery size={16} className={`mr-2 ${getBatteryColor(latestData.battery)}`} />
            <span className="text-black">{latestData.battery.toFixed(0)}%</span>
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
              Ext: {latestData.externalHumidity.toFixed(1)}%</div>
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

const DataChart: React.FC<{ data: SensorData[]; type: string; title: string }> = ({ data, type, title }) => {
  const chartData = data.slice(-24).map(d => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));
  
  const config = {
    temperature: { color: '#ef4444', unit: '°C', icon: Thermometer },
    humidity: { color: '#3b82f6', unit: '%', icon: Droplets },
    weight: { color: '#8b5cf6', unit: 'kg', icon: Weight },
    battery: { color: '#10b981', unit: '%', icon: Battery },
    externalTemperature: { color: '#f59e0b', unit: '°C', icon: Thermometer },
    externalHumidity: { color: '#06b6d4', unit: '%', icon: Droplets }
  };
  
  const { color, unit, icon: Icon } = config[type as keyof typeof config];
  
  // Set custom domain for weight chart
  const yAxisProps = type === 'weight' ? { domain: [15, 30] } : {};
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Icon size={20} className="mr-2" style={{ color }} />
          <h4 className="font-semibold text-black">{title}</h4>
        </div>
        <span className="text-sm font-medium text-gray-600 bg-gray-100/80 px-2 py-1 rounded">
          {unit}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis 
            label={{ value: unit, angle: -90, position: 'insideLeft' }} 
            {...yAxisProps}
          />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} ${unit}`, title]} />
          <Area type="monotone" dataKey={type} stroke={color} fill={color} fillOpacity={0.1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const MediaGallery: React.FC<{ files: MediaFile[]; type: 'image' | 'audio' }> = ({ files, type }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/20">
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

const GPSDisplay: React.FC<{ 
  gps: { lat: number; lng: number };
  onUpdate: (newGps: { lat: number; lng: number }) => void;
}> = ({ gps, onUpdate }) => {
  const [position, setPosition] = useState(gps);
  
  // Update both local state and parent state when position changes
  useEffect(() => {
    setPosition(gps);
  }, [gps]);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const newPos = {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    };
    setPosition(newPos);
    onUpdate(newPos);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-white/20">
      <div className="flex items-center mb-4">
        <MapPin size={20} className="mr-2 bg-red-50" />
        <h4 className="text-black">GPS Location</h4>
      </div>
      <div className="space-y-2 text-black">
        <p><strong>Latitude:</strong> {position.lat.toFixed(6)}</p>
        <p><strong>Longitude:</strong> {position.lng.toFixed(6)}</p>
        <div className="mt-4 h-48 bg-gray-200/80 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20">
          <MapContainer 
            center={[position.lat, position.lng]} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.lat, position.lng]}>
              <Popup className="font-bold">
                Hive Location
              </Popup>
            </Marker>
            
            {/* Add click event handler */}
            {typeof window !== 'undefined' && (
              <EventComponent event="click" handler={handleMapClick} />
            )}
          </MapContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click anywhere on the map to update location
        </p>
      </div>
    </div>
  );
};

// Add this event component to handle map clicks
const EventComponent = dynamic(
  () => 
    import('react-leaflet').then((mod) => {
      return function EventComponent({ event, handler }: any) {
        const map = mod.useMapEvents({ [event]: handler });
        return null;
      };
    }),
  { ssr: false }
);

const HiveModal: React.FC<{ 
  hive: Hive | null; 
  onClose: () => void;
  onUpdateGPS: (hiveId: number, newGps: { lat: number; lng: number }) => void;
}> = ({ hive, onClose, onUpdateGPS }) => {
  if (!hive) return null;

  const handleGPSUpdate = (newGps: { lat: number; lng: number }) => {
    if (hive) {
      onUpdateGPS(hive.id, newGps);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-xl max-w-7xl max-h-[90vh] w-full overflow-hidden shadow-2xl border border-white/30">
        {/* Header */}
        <div className="p-6 border-b border-white/30 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-2xl text-black">{hive.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className={`font-semibold ${hive.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {hive.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-white/50 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Sensor Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataChart data={hive.data} type="temperature" title="Internal Temperature" />
              <DataChart data={hive.data} type="humidity" title="Internal Humidity" />
              <DataChart data={hive.data} type="weight" title="Weight" />
              <DataChart data={hive.data} type="battery" title="Battery Level" />
              
              {/* External sensors for central hive */}
              {hive.id === 0 && hive.data[0]?.externalTemperature && (
                <>
                  <DataChart data={hive.data} type="externalTemperature" title="External Temperature" />
                  <DataChart data={hive.data} type="externalHumidity" title="External Humidity" />
                </>
              )}
            </div>
            
            {/* Central hive additional content */}
            {hive.id === 0 && (
              <div className="space-y-6">
                {/* GPS Section */}
                {hive.gps && <GPSDisplay gps={hive.gps}  onUpdate={handleGPSUpdate} />}
                
                {/* Media Sections */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {hive.images && <MediaGallery files={hive.images} type="image" />}
                  {hive.sounds && <MediaGallery files={hive.sounds} type="audio" />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============== ADDED SIDEBAR COMPONENT ==============
const Sidebar: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: Bell, label: 'Alerts', active: false },
    { icon: Users, label: 'Apiaries', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar - Now hidden by default on all screen sizes */}
      <div className={`
        fixed top-0 left-0 h-full bg-white/90 backdrop-blur-lg shadow-2xl border-r border-white/30 z-50 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64
      `}>
        <div className="p-6">
          {/* Close button inside sidebar */}
          <div className="flex justify-between items-center mb-8">
            <div className="w-32 h-16">
              <img 
                src="/FRC_logo.png" 
                alt="FRC Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg rounded-lg">FRC</div>';
                  }
                }}
              />
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className={`
                  w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${item.active 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-800'
                  }
                `}
              >
                <item.icon size={20} className="mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};


// ============== MODIFIED DASHBOARD COMPONENT ==============
const HiveMonitoringDashboard: React.FC = () => {
  const [hives, setHives] = useState<Hive[]>([]);
  const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleUpdateGPS = (hiveId: number, newGps: { lat: number; lng: number }) => {
    setHives(prevHives => 
      prevHives.map(hive => 
        hive.id === hiveId ? { ...hive, gps: newGps } : hive
      )
    );
  };
  
  useEffect(() => {
    setHives(generateHives());
  }, []);
  
  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="w-full">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-100 to-teal-200">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-green-200/30 via-transparent to-blue-200/30 animate-pulse" 
               style={{ animationDuration: '8s' }} />
          
          {/* Geometric patterns - Hexagons for honeycomb */}
          <div className="absolute inset-0">
            <FloatingHexagon delay={0} size="w-32 h-32" position="top-10 left-10" />
            <FloatingHexagon delay={1} size="w-24 h-24" position="top-32 right-20" />
            <FloatingHexagon delay={2} size="w-40 h-40" position="bottom-20 left-32" />
            <FloatingHexagon delay={3} size="w-28 h-28" position="bottom-40 right-10" />
            <FloatingHexagon delay={1.5} size="w-20 h-20" position="top-1/2 left-1/4" />
            <FloatingHexagon delay={2.5} size="w-36 h-36" position="top-1/3 right-1/3" />
            <FloatingHexagon delay={0.5} size="w-16 h-16" position="top-3/4 left-1/2" opacity="opacity-5" />
            <FloatingHexagon delay={3.5} size="w-44 h-44" position="top-1/6 left-2/3" opacity="opacity-5" />
          </div>
          
          {/* Floating bees */}
          <div className="absolute inset-0">
            <FloatingBee delay={0} position="top-1/4 left-1/5" />
            <FloatingBee delay={2} position="top-1/2 right-1/4" />
            <FloatingBee delay={4} position="bottom-1/3 left-1/2" />
            <FloatingBee delay={1} position="top-2/3 right-1/5" size="text-xl" />
            <FloatingBee delay={3} position="bottom-1/4 left-1/3" size="text-lg" />
          </div>
          
          {/* Honeycomb pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" 
                 style={{
                   backgroundImage: `radial-gradient(circle at 25px 25px, rgba(251, 191, 36, 0.3) 2px, transparent 2px)`,
                   backgroundSize: '50px 50px'
                 }} />
          </div>
          
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-bounce" 
               style={{ animationDelay: '0s', animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-bounce" 
               style={{ animationDelay: '1s', animationDuration: '4s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-teal-400 rounded-full opacity-60 animate-bounce" 
               style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-green-500 rounded-full opacity-60 animate-bounce" 
               style={{ animationDelay: '1.5s', animationDuration: '3.5s' }} />
        </div>
        
         {/* Content */}
        <div className="relative z-10">
          {/* Header with blurry background colors */}
          <div className="bg-gradient-to-r from-green-100/60 via-blue-100/60 to-teal-200/60 backdrop-blur-xl border-b border-white/30 shadow-lg">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center py-6">
               {/* Hamburger menu button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-3 rounded-lg hover:bg-white/20 transition-all duration-200 mb-4 md:mb-0"
                >
                  <Menu size={24} className="text-gray-700" />
                </button>
                
                {/* Title */}
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <h1 className="relative text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-teal-700 to-gray-800 bg-clip-text text-transparent mb-2 -left-80">
                    HoneyPark - Dibba
                  </h1>
                  <p className=" relative text-gray-700 text-lg font-medium -left-80">
                    Real-time monitoring and management of your beehive network
                  </p>
                </div>
                
                {/* FRC Logo */}
                <div className="w-40 h-16 md:w-48 md:h-20">
                  <img 
                    src="/FRC_logo.png" 
                    alt="FRC Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center text-white font-bold text-lg rounded-lg py-2 px-4">FRC</div>';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="container mx-auto px-4 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-lg rounded-lg p-6 shadow-xl border border-white/20 hover:bg-white/90 transition-all duration-300">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Hives</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">{hives.length}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-lg p-6 shadow-xl border border-white/20 hover:bg-white/90 transition-all duration-300">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Hives</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{hives.filter(h => h.isActive).length}</p>
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
          </div>
          
          {/* Modal */}
          {selectedHive && (
            <HiveModal
              hive={selectedHive}
              onClose={() => setSelectedHive(null)}
              onUpdateGPS={handleUpdateGPS}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HiveMonitoringDashboard;