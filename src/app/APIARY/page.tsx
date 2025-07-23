'use client'

import React from 'react';
import { MapPin, Database, Activity, ChevronRight } from 'lucide-react';

interface Apiary {
  id: string;
  name: string;
  location: string;
  totalHives: number;
  activeHives: number;
  imageUrl: string;
}

const apiaries: Apiary[] = [
  {
    id: 'honey-park-dibba',
    name: 'Honey Park Dibba',
    location: 'Dibba, UAE',
    totalHives: 13,
    activeHives: 12,
    imageUrl: 'dibba.png'
  },
  {
    id: 'frc-abudhabi',
    name: 'FRC Abu Dhabi',
    location: 'Abu Dhabi, UAE',
    totalHives: 8,
    activeHives: 7,
    imageUrl: 'abudhabi.png'
  },
  
];

const ApiaryCard: React.FC<{ apiary: Apiary; onClick: () => void }> = ({ apiary, onClick }) => {
  const activePercentage = (apiary.activeHives / apiary.totalHives) * 100;
  
  return (
    <div 
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden group border border-white/20"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={apiary.imageUrl}
          alt={apiary.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4">
          <div className={`w-4 h-4 rounded-full ${activePercentage > 90 ? 'bg-green-400' : activePercentage > 70 ? 'bg-yellow-400' : 'bg-red-400'} shadow-lg animate-pulse`} />
        </div>
      </div>
      
      {/* Data Section */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
            {apiary.name}
          </h3>
          <ChevronRight 
            size={20} 
            className="text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" 
          />
        </div>
        
        <div className="flex items-center text-gray-600">
          <MapPin size={16} className="mr-2 text-amber-500" />
          <span className="text-sm">{apiary.location}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Database size={16} className="mr-2 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{apiary.totalHives}</p>
              <p className="text-xs text-gray-500">Total Hives</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Activity size={16} className="mr-2 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-600">{apiary.activeHives}</p>
              <p className="text-xs text-gray-500">Active Hives</p>
            </div>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Health Status</span>
            <span>{activePercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                activePercentage > 90 ? 'bg-green-500' : 
                activePercentage > 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${activePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FloatingHexagon: React.FC<{ delay: number; size: string; position: string }> = ({ delay, size, position }) => (
  <div 
    className={`absolute ${position} ${size} opacity-10 animate-pulse`}
    style={{ animationDelay: `${delay}s`, animationDuration: '4s' }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-400">
      <polygon points="50,5 85,25 85,75 50,95 15,75 15,25" />
    </svg>
  </div>
);

const ApiaryDashboard: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Stunning Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-200">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/30 via-transparent to-orange-200/30 animate-pulse" 
             style={{ animationDuration: '8s' }} />
        
        {/* Geometric patterns */}
        <div className="absolute inset-0">
          {/* Large hexagonal pattern */}
          <FloatingHexagon delay={0} size="w-32 h-32" position="top-10 left-10" />
          <FloatingHexagon delay={1} size="w-24 h-24" position="top-32 right-20" />
          <FloatingHexagon delay={2} size="w-40 h-40" position="bottom-20 left-32" />
          <FloatingHexagon delay={3} size="w-28 h-28" position="bottom-40 right-10" />
          <FloatingHexagon delay={1.5} size="w-20 h-20" position="top-1/2 left-1/4" />
          <FloatingHexagon delay={2.5} size="w-36 h-36" position="top-1/3 right-1/3" />
        </div>
        
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: `radial-gradient(circle at 25px 25px, rgba(251, 191, 36, 0.3) 2px, transparent 2px)`,
                 backgroundSize: '50px 50px'
               }} />
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full opacity-60 animate-bounce" 
             style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-400 rounded-full opacity-60 animate-bounce" 
             style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-yellow-400 rounded-full opacity-60 animate-bounce" 
             style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-amber-500 rounded-full opacity-60 animate-bounce" 
             style={{ animationDelay: '1.5s', animationDuration: '3.5s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 border-4 border-white/30">
                <span className="text-3xl animate-pulse">🐝</span>
              </div>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
              Apiary Management System
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              Monitor and manage your beehive operations across multiple locations in the UAE
            </p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-xl text-center border border-white/20 hover:bg-white/90 transition-all duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {apiaries.length}
              </div>
              <div className="text-gray-600 font-medium">Total Apiaries</div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-xl text-center border border-white/20 hover:bg-white/90 transition-all duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                {apiaries.reduce((sum, apiary) => sum + apiary.totalHives, 0)}
              </div>
              <div className="text-gray-600 font-medium">Total Hives</div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-xl text-center border border-white/20 hover:bg-white/90 transition-all duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                {apiaries.reduce((sum, apiary) => sum + apiary.activeHives, 0)}
              </div>
              <div className="text-gray-600 font-medium">Active Hives</div>
            </div>
          </div>
          
          {/* Apiary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apiaries.map((apiary) => (
              <ApiaryCard
                key={apiary.id}
                apiary={apiary}
                onClick={() => console.log(`Navigate to ${apiary.id}`)}
              />
            ))}
          </div>
          
          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 font-medium bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 inline-block border border-white/30">
              © 2025 UAE Beekeeping Initiative. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiaryDashboard;