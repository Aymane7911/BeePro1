import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Layers, Database, Tag, Package, RefreshCw, Menu, X, Home, Settings, Users, Activity, HelpCircle, Wallet, PlusCircle, MapPin, CheckCircle, Trash2, Globe, FileText, AlertCircle, Sparkles, LogOut, Plus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';





interface FloatingActionMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setShowBatchModal: (show: boolean) => void;
  setShowApiaryModal: (show: boolean) => void;
}

const FloatingActionMenu = ({ 
  isOpen, 
  setIsOpen, 
  setShowBatchModal, 
  setShowApiaryModal 
}: FloatingActionMenuProps) => (
  <div className="fixed bottom-6 right-6 z-50">
    {isOpen && (
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-sm -z-10"
        onClick={() => setIsOpen(false)}
      />
    )}
    
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
          onClick={() => {
            setIsOpen(false);
            setTimeout(() => setShowBatchModal(true), 200);
          }}
          className="group relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
        >
          <Package className="h-6 w-6" />
        </button>
      </div>

      {/* Create Apiary Option */}
      <div className="flex items-center space-x-3">
        <div className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg border text-sm font-medium whitespace-nowrap">
          Create New Apiary
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            setTimeout(() => setShowApiaryModal(true), 200);
          }}
          className="group relative bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
        >
          <MapPin className="h-6 w-6" />
        </button>
      </div>
    </div>

    {/* Main FAB Button */}
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`group relative bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 border-2 border-white/20 ${
        isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
      }`}
    >
      <div className="relative z-10">
        {isOpen ? (
          <X className="h-7 w-7 transition-transform duration-300" />
        ) : (
          <Plus className="h-7 w-7 transition-transform duration-300" />
        )}
      </div>
    </button>
  </div>
);

export default FloatingActionMenu; 