import React from 'react';
import { Menu, RefreshCw, Trash2, Printer, Sparkles } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  refreshData: () => void;
  handleDelete: () => void;
  handlePrint: () => void;
  selectedBatches: string[];
  lastUpdated: string;
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  refreshData,
  handleDelete,
  handlePrint,
  selectedBatches,
  lastUpdated
}) => {
  return (
    <header className="relative bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 text-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-amber-500/5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative z-10 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-6 p-3 rounded-xl hover:bg-yellow-100/50 transition-all duration-300 hover:scale-110 hover:rotate-12"
          >
            <Menu className="h-7 w-7" />
          </button>
          <div className="flex items-center">
            <div className="mr-4 bg-gradient-to-br from-yellow-500 to-amber-500 p-3 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM6 14C5.45 14 5 13.55 5 13C5 12.45 5.45 12 6 12C6.55 12 7 12.45 7 13C7 13.55 6.55 14 6 14ZM9 9C8.45 9 8 8.55 8 8C8 7.45 8.45 7 9 7C9.55 7 10 7.45 10 8C10 8.55 9.55 9 9 9ZM15 9C14.45 9 14 8.55 14 8C14 7.45 14.45 7 15 7C15.55 7 16 7.45 16 8C16 8.55 15.55 9 15 9ZM18 14C17.45 14 17 13.55 17 13C17 12.45 17.45 12 18 12C18.55 12 19 12.45 19 13C19 13.55 18.55 14 18 14Z" fill="white"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">HoneyCertify</h1>
              <p className="text-sm text-gray-500 font-medium">Batch Management</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshData}
            className="group relative overflow-hidden p-3 
                       bg-gradient-to-r from-blue-600 to-indigo-500 
                       text-white rounded-xl shadow-2xl
                       transform transition-all duration-500 
                       hover:from-blue-500 hover:to-indigo-400 
                       hover:scale-110 hover:shadow-blue-500/30 hover:-translate-y-1
                       active:scale-95 active:translate-y-0
                       border border-blue-400/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                           transform -skew-x-12 -translate-x-full 
                           group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <RefreshCw className="h-6 w-6 relative z-10 transition-all duration-300 
                               group-hover:rotate-180 group-hover:scale-110" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={selectedBatches.length === 0}
            className={`group relative overflow-hidden px-6 py-3 rounded-xl font-semibold shadow-2xl
                       transform transition-all duration-500 flex items-center
                       ${selectedBatches.length === 0 
                         ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                         : `bg-gradient-to-r from-red-600 to-rose-500 text-white
                            hover:from-red-500 hover:to-rose-400 
                            hover:scale-105 hover:shadow-red-500/30 hover:-translate-y-2
                            active:scale-95 active:translate-y-0
                            border border-red-400/20`
                       }`}
          >
            {selectedBatches.length > 0 && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                               transform -skew-x-12 -translate-x-full 
                               group-hover:translate-x-full transition-transform duration-600"></div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400 to-rose-400 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="absolute top-1 right-2 w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
              </>
            )}
            <Trash2 className={`h-5 w-5 mr-3 relative z-10 transition-all duration-300 
                              ${selectedBatches.length > 0 ? 'group-hover:-rotate-12 group-hover:scale-110' : ''}`} />
            <span className={`relative z-10 transition-all duration-300 
                            ${selectedBatches.length > 0 ? 'group-hover:tracking-wider' : ''}`}>
              Delete {selectedBatches.length > 0 ? `(${selectedBatches.length})` : ''}
            </span>
            {selectedBatches.length > 0 && (
              <div className="w-1 h-1 ml-2 relative z-10 bg-red-200 rounded-full 
                             opacity-0 group-hover:opacity-100 animate-ping"></div>
            )}
          </button>

          <button
            onClick={handlePrint}
            disabled={selectedBatches.length === 0}
            className={`group relative overflow-hidden px-6 py-3 rounded-xl font-semibold shadow-2xl
                       transform transition-all duration-500 flex items-center
                       ${selectedBatches.length === 0 
                         ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                         : `bg-gradient-to-r from-emerald-600 to-green-500 text-white
                            hover:from-emerald-500 hover:to-green-400 
                            hover:scale-105 hover:shadow-green-500/30 hover:-translate-y-2
                            active:scale-95 active:translate-y-0
                            border border-green-400/20`
                       }`}
          >
            {selectedBatches.length > 0 && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                               transform -skew-x-12 -translate-x-full 
                               group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-green-400 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="absolute top-1 right-2 w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              </>
            )}
            <Printer className={`h-5 w-5 mr-3 relative z-10 transition-all duration-300 
                               ${selectedBatches.length > 0 ? 'group-hover:rotate-12 group-hover:scale-110' : ''}`} />
            <span className={`relative z-10 transition-all duration-300 
                            ${selectedBatches.length > 0 ? 'group-hover:tracking-wider' : ''}`}>
              Print {selectedBatches.length > 0 ? `(${selectedBatches.length})` : ''}
            </span>
            {selectedBatches.length > 0 && (
              <Sparkles className="w-4 h-4 ml-2 relative z-10 opacity-0 transition-all duration-300 
                                group-hover:opacity-100 group-hover:rotate-180" />
            )}
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mt-4 relative z-10 opacity-75">
        Last updated: {lastUpdated}
      </p>
    </header>
  );
};

export default Header;