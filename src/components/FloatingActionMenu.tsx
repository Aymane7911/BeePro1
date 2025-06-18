'use client'

import React, { useState } from 'react';
import { Plus, X, MapPin, Package, Sparkles } from 'lucide-react';

const FloatingActionMenu = ({ onCreateApiary, onCreateBatch }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (action) => {
    setIsOpen(false);
    setTimeout(() => {
      if (action === 'apiary') {
        onCreateApiary();
      } else if (action === 'batch') {
        onCreateBatch();
      }
    }, 200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Background overlay when menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Menu Options */}
      <div className={`absolute bottom-20 right-0 space-y-3 transform transition-all duration-300 ease-out ${
        isOpen 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
      }`}>
        
        {/* Create Batch Option */}
        <div className="flex items-center space-x-3">
          <div className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg border text-sm font-medium whitespace-nowrap">
            Create New Batch
          </div>
          <button
            onClick={() => handleOptionClick('batch')}
            className="group relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
          >
            <Package className="h-6 w-6" />
            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
          </button>
        </div>

        {/* Create Apiary Option */}
        <div className="flex items-center space-x-3">
          <div className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg border text-sm font-medium whitespace-nowrap">
            Create New Apiary
          </div>
          <button
            onClick={() => handleOptionClick('apiary')}
            className="group relative bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
          >
            <MapPin className="h-6 w-6" />
            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Main FAB Button */}
      <button
        onClick={toggleMenu}
        className={`group relative bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 border-2 border-white/20 ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
        }`}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
        
        {/* Icon */}
        <div className="relative z-10">
          {isOpen ? (
            <X className="h-7 w-7 transition-transform duration-300" />
          ) : (
            <Plus className="h-7 w-7 transition-transform duration-300" />
          )}
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200" />
        
        {/* Sparkle effects */}
        <div className="absolute -top-2 -right-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
          <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
          <div className="w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
        </div>
      </button>

      {/* Subtle pulsing ring when closed */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping pointer-events-none" />
      )}
    </div>
  );
};

export default FloatingActionMenu;