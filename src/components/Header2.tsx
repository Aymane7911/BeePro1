import React from 'react';
import { Menu, RefreshCw, Upload, Download, TrendingUp } from 'lucide-react';

interface AnalyticsHeaderProps {
  toggleSidebar: () => void;
  refreshData: () => void;
  handleUpload: () => void;
  handleExport: () => void;
  currentSlide: number;
  slideConfigs: Array<{
    title: string;
    icon: string;
    color: string;
  }>;
  lastUpdated: string;
  apiStatus: 'connected' | 'error' | 'checking';
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  toggleSidebar,
  refreshData,
  handleUpload,
  handleExport,
  currentSlide,
  slideConfigs,
  lastUpdated,
  apiStatus
}) => {
  const currentConfig = slideConfigs[currentSlide];
  
  const getColorClasses = (color: string, variant = 'primary') => {
    const colorMap = {
      blue: {
        primary: 'from-blue-500 to-purple-600',
        secondary: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
        accent: 'border-blue-300 bg-blue-50 hover:bg-blue-100',
        gradient: 'from-blue-500/5 via-transparent to-purple-500/5',
        glow: 'from-blue-400/10 to-transparent'
      },
      green: {
        primary: 'from-green-500 to-blue-600',
        secondary: 'bg-green-100 text-green-600 hover:bg-green-200',
        accent: 'border-green-300 bg-green-50 hover:bg-green-100',
        gradient: 'from-green-500/5 via-transparent to-blue-500/5',
        glow: 'from-green-400/10 to-transparent'
      },
      yellow: {
        primary: 'from-yellow-500 to-orange-600',
        secondary: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
        accent: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100',
        gradient: 'from-yellow-500/5 via-transparent to-orange-500/5',
        glow: 'from-yellow-400/10 to-transparent'
      }
    };
    return colorMap[color][variant];
  };

  return (
    <header className="relative bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 text-black overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${getColorClasses(currentConfig.color, 'gradient')}`}></div>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getColorClasses(currentConfig.color, 'glow')} rounded-full blur-2xl`}></div>
      
      <div className="relative z-10 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-6 p-3 rounded-xl hover:bg-gray-100/50 transition-all duration-300 hover:scale-110 hover:rotate-12"
          >
            <Menu className="h-7 w-7" />
          </button>
          <div className="flex items-center">
            <div className={`mr-4 bg-gradient-to-br ${getColorClasses(currentConfig.color)} p-3 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300`}>
              <div className="text-3xl">{currentConfig.icon}</div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Analytics Hub
              </h1>
              <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-500 font-medium">{currentConfig.title}</p>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  apiStatus === 'connected' 
                    ? 'bg-green-100 text-green-700' 
                    : apiStatus === 'error' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {apiStatus === 'connected' ? '🟢 Connected' : apiStatus === 'error' ? '🔴 Disconnected' : '🟡 Checking...'}
                </div>
              </div>
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
            onClick={handleUpload}
            className={`group relative overflow-hidden px-6 py-3 rounded-xl font-semibold shadow-2xl
                       transform transition-all duration-500 flex items-center
                       bg-gradient-to-r ${getColorClasses(currentConfig.color)} text-white
                       hover:scale-105 hover:shadow-lg hover:-translate-y-2
                       active:scale-95 active:translate-y-0
                       border border-white/20`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                           transform -skew-x-12 -translate-x-full 
                           group-hover:translate-x-full transition-transform duration-600"></div>
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getColorClasses(currentConfig.color)} 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`}></div>
            <div className="absolute top-1 right-2 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
            <Upload className="h-5 w-5 mr-3 relative z-10 transition-all duration-300 
                             group-hover:rotate-12 group-hover:scale-110" />
            <span className="relative z-10 transition-all duration-300 group-hover:tracking-wider">
              Upload Data
            </span>
          </button>

          <button
            onClick={handleExport}
            className="group relative overflow-hidden px-6 py-3 rounded-xl font-semibold shadow-2xl
                       transform transition-all duration-500 flex items-center
                       bg-gradient-to-r from-emerald-600 to-green-500 text-white
                       hover:from-emerald-500 hover:to-green-400 
                       hover:scale-105 hover:shadow-green-500/30 hover:-translate-y-2
                       active:scale-95 active:translate-y-0
                       border border-green-400/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                           transform -skew-x-12 -translate-x-full 
                           group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-green-400 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <div className="absolute top-1 right-2 w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <Download className="h-5 w-5 mr-3 relative z-10 transition-all duration-300 
                               group-hover:-rotate-12 group-hover:scale-110" />
            <span className="relative z-10 transition-all duration-300 group-hover:tracking-wider">
              Export
            </span>
            <TrendingUp className="w-4 h-4 ml-2 relative z-10 opacity-0 transition-all duration-300 
                                group-hover:opacity-100 group-hover:rotate-180" />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 relative z-10">
        <p className="text-gray-600 text-sm opacity-75">
          Last updated: {lastUpdated}
        </p>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            Dashboard: {currentSlide + 1} of {slideConfigs.length}
          </div>
          <div className="flex space-x-1">
            {slideConfigs.map((config, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? `${config.color === 'blue' ? 'bg-blue-500' : config.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'} scale-125` 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AnalyticsHeader;