'use client'

import React from 'react';
import { MapPin, Database, Activity, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'
  },
  {
    id: 'frc-fujairah',
    name: 'FRC Fujairah',
    location: 'Fujairah, UAE',
    totalHives: 8,
    activeHives: 7,
    imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&h=400&fit=crop'
  },
  {
    id: 'manahil-fujairah',
    name: 'Manahil Fujairah',
    location: 'Manahil, Fujairah, UAE',
    totalHives: 15,
    activeHives: 14,
    imageUrl: 'https://images.unsplash.com/photo-1571981122606-bc18c2cd7e5c?w=600&h=400&fit=crop'
  }
];

const ApiaryCard: React.FC<{ apiary: Apiary; onClick: () => void }> = ({ apiary, onClick }) => {
  const router = useRouter();
  
  const handleClick = () => {
    // Navigate to the hive page with apiary ID as a query parameter
    router.push(`/hive?apiary=${apiary.id}`);
  };
  
  const activePercentage = (apiary.activeHives / apiary.totalHives) * 100;
  
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden group"
      onClick={handleClick}
    >
      {/* Image Section - Takes up 60% of the card */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={apiary.imageUrl}
          alt={apiary.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4">
          <div className={`w-4 h-4 rounded-full ${activePercentage > 90 ? 'bg-green-400' : activePercentage > 70 ? 'bg-yellow-400' : 'bg-red-400'} shadow-lg`} />
        </div>
      </div>
      
      {/* Data Section - Takes up 40% of the card */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {apiary.name}
          </h3>
          <ChevronRight 
            size={20} 
            className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" 
          />
        </div>
        
        <div className="flex items-center text-gray-600">
          <MapPin size={16} className="mr-2 text-blue-500" />
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

const ApiaryDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🐝</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Apiary Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor and manage your beehive operations across multiple locations in the UAE
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600">
              {apiaries.length}
            </div>
            <div className="text-gray-600">Total Apiaries</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600">
              {apiaries.reduce((sum, apiary) => sum + apiary.totalHives, 0)}
            </div>
            <div className="text-gray-600">Total Hives</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600">
              {apiaries.reduce((sum, apiary) => sum + apiary.activeHives, 0)}
            </div>
            <div className="text-gray-600">Active Hives</div>
          </div>
        </div>
        
        {/* Apiary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apiaries.map((apiary) => (
            <ApiaryCard
              key={apiary.id}
              apiary={apiary}
              onClick={() => {}} // No longer needed, handled in ApiaryCard
            />
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p>© 2025 UAE Beekeeping Initiative. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};



export default ApiaryDashboard;