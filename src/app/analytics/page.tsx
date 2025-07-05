'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, RefreshCw, Upload, Download, TrendingUp, X, Home, Settings, Users, Activity, HelpCircle, Wallet, Crown, Lock, MessageCircle } from 'lucide-react';
import Sidebar   from '@/components/Sidebar'; // Importing the Sidebar component



interface BackdropProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Backdrop = ({ sidebarOpen, toggleSidebar }: BackdropProps) => (
  sidebarOpen && (
    <div 
      className="fixed inset-0 backdrop-blur-md bg-black/30 z-10 transition-all duration-500"
      onClick={toggleSidebar}
    ></div>
  )
);

const Analytics = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [isPremium, setIsPremium] = useState(true); // Assume premium access for analytics
  const fileInputRef = useRef(null);
  
  const invoiceApiBaseUrl = 'https://invoicesdashapi.onrender.com';
  const productionApiBaseUrl = 'https://productionapidash.onrender.com';
  const beehiveApiBaseUrl = 'https://beehivedah.onrender.com';

  // Slide configurations
  const slideConfigs = [
    {
      title: 'Invoice Analytics Dashboard',
      icon: '📄',
      description: 'AI-powered invoice processing and analysis',
      iframeUrl: `${invoiceApiBaseUrl}/dash_app/`,
      uploadEndpoint: `${invoiceApiBaseUrl}/upload-invoices/`,
      acceptedFiles: '.pdf',
      color: 'blue',
      statsCards: [
        { label: 'Total Invoices', value: '0', change: '+5.2%', trend: 'up' },
        { label: 'Processed Invoices', value: '0', change: '+12.1%', trend: 'up' },
        { label: 'Total Value', value: '$0.00', change: '+18.3%', trend: 'up' },
        { label: 'Avg Invoice Value', value: '$0.00', change: '+3.7%', trend: 'up' }
      ]
    },
    {
      title: 'Production Analytics Dashboard',
      icon: '🏭',
      description: 'Real-time production monitoring and analytics',
      iframeUrl: `${productionApiBaseUrl}/dash_app/`,
      uploadEndpoint: `${productionApiBaseUrl}/upload-production/`,
      acceptedFiles: '*',
      color: 'green',
      statsCards: [
        { label: 'Production Units', value: '2,547', change: '+8.3%', trend: 'up' },
        { label: 'Efficiency Rate', value: '94.2%', change: '+2.1%', trend: 'up' },
        { label: 'Quality Score', value: '98.7%', change: '+1.5%', trend: 'up' },
        { label: 'Output Target', value: '105%', change: '+5.0%', trend: 'up' }
      ]
    },
    {
      title: 'Beehive Analytics Dashboard',
      icon: '🐝',
      description: 'Comprehensive beehive monitoring and analytics',
      iframeUrl: `${beehiveApiBaseUrl}/dash_app/`,
      uploadEndpoint: `${beehiveApiBaseUrl}/upload-beehive/`,
      acceptedFiles: '*',
      color: 'yellow',
      statsCards: [
        { label: 'Active Hives', value: '24', change: '+4.2%', trend: 'up' },
        { label: 'Honey Production', value: '156kg', change: '+7.8%', trend: 'up' },
        { label: 'Hive Health Score', value: '96.3%', change: '+2.3%', trend: 'up' },
        { label: 'Queen Activity', value: '98.5%', change: '+1.2%', trend: 'up' }
      ]
    }
  ];

  // Fetch processed invoices from API
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${invoiceApiBaseUrl}/invoices/`);
      const result = await response.json();
      
      console.log('API Response:', result);
      
      if (response.ok && result.invoices) {
        setInvoices(result.invoices);
        setApiStatus('connected');
        updateInvoiceStats(result.invoices);
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  // Update invoice stats based on real data
  const updateInvoiceStats = (invoiceData) => {
    if (!invoiceData.length) return;

    const totalValue = invoiceData.reduce((sum, invoice) => {
      const total = parseFloat(invoice.total?.replace(/[^0-9.-]/g, '') || 0);
      return sum + total;
    }, 0);

    const avgValue = totalValue / invoiceData.length;

    slideConfigs[0].statsCards = [
      { label: 'Total Invoices', value: invoiceData.length.toString(), change: '+5.2%', trend: 'up' },
      { label: 'Processed Invoices', value: invoiceData.length.toString(), change: '+12.1%', trend: 'up' },
      { label: 'Total Value', value: `$${totalValue.toFixed(2)}`, change: '+18.3%', trend: 'up' },
      { label: 'Avg Invoice Value', value: `$${avgValue.toFixed(2)}`, change: '+3.7%', trend: 'up' }
    ];
  };

  // Check API health
  const checkHealth = async () => {
    try {
      const response = await fetch(`${invoiceApiBaseUrl}/health/`);
      const result = await response.json();
      
      if (response.ok && result.status === 'healthy') {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      setApiStatus('error');
    }
  };

  // Generic upload function
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }

    const currentConfig = slideConfigs[currentSlide];
    
    try {
      setUploadLoading(true);
      
      const formData = new FormData();
      for (let file of selectedFiles) {
        // Check file type for invoice uploads
        if (currentSlide === 0 && !file.name.toLowerCase().endsWith('.pdf')) {
          alert(`${file.name} is not a PDF file. Only PDF files are allowed for invoices.`);
          return;
        }
        formData.append('files', file);
      }

      const response = await fetch(currentConfig.uploadEndpoint, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setSelectedFiles([]);
        if (currentSlide === 0) {
          await fetchInvoices();
        }
        alert(`${currentConfig.title.split(' ')[0]} data uploaded and processed successfully!`);
      } else {
        alert('Upload failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Upload error: ' + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const refreshData = async () => {
    if (currentSlide === 0) {
      await fetchInvoices();
    } else {
      // Force iframe refresh by changing key
      setIframeKey(prev => prev + 1);
    }
    setLastUpdated(new Date().toLocaleString());
  };

  const handleHeaderUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleExport = () => {
    alert("Export functionality is not implemented yet.");
  };

  useEffect(() => {
    checkHealth();
    fetchInvoices();
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const currentConfig = slideConfigs[currentSlide];

  const handleFileSelect = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const slideLeft = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slideConfigs.length - 1));
    setSelectedFiles([]);
  };

  const slideRight = () => {
    setCurrentSlide((prev) => (prev < slideConfigs.length - 1 ? prev + 1 : 0));
    setSelectedFiles([]);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setSelectedFiles([]);
  };

  const handleSwipeStart = (e) => {
    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    e.target.dataset.startX = startX;
  };

  const handleSwipeEnd = (e) => {
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const startX = parseFloat(e.target.dataset.startX);
    const diff = startX - endX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        slideRight();
      } else {
        slideLeft();
      }
    }
  };

  const getColorClasses = (color, variant = 'primary') => {
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
  
const [chatbotOpen, setChatbotOpen] = useState(false);
const toggleChatbot = () => setChatbotOpen(!chatbotOpen);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-yellow-100 text-black flex">

       <Backdrop sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
       
      {/* Sidebar Component */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isPremium={isPremium} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-yellow-400 rounded-full opacity-15 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header Section */}
          <div className="p-6 pb-4">
            <AnalyticsHeader
              toggleSidebar={toggleSidebar}
              refreshData={refreshData}
              handleUpload={handleHeaderUpload}
              handleExport={handleExport}
              currentSlide={currentSlide}
              slideConfigs={slideConfigs}
              lastUpdated={lastUpdated}
              apiStatus={apiStatus}
            />
          </div>

          {/* Sliding Navigation */}
          <div className="flex justify-center px-6 pb-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
              <div className="flex space-x-2">
                {slideConfigs.map((config, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      currentSlide === index 
                        ? `bg-gradient-to-r ${getColorClasses(config.color)} text-white shadow-lg` 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {config.icon} {config.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full Screen Dashboard Container */}
          <div className="flex-1 px-6 pb-6">
            <div className="h-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="h-1000 p-8">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-600">Loading dashboard data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full overflow-hidden">
                    <div 
                      className="h-full flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                      onTouchStart={handleSwipeStart}
                      onTouchEnd={handleSwipeEnd}
                      onMouseDown={handleSwipeStart}
                      onMouseUp={handleSwipeEnd}
                    >
                      {slideConfigs.map((config, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0">
                          <div className="bg-white rounded-2xl p-6 shadow-lg h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-700">{config.title}</h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={slideLeft}
                                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                  ◀️
                                </button>
                                <button
                                  onClick={slideRight}
                                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                  ▶️
                                </button>
                              </div>
                            </div>
                            <div className="flex-1">
                              <iframe 
                                key={`${config.iframeUrl}-${iframeKey}`}
                                src={config.iframeUrl} 
                                title={config.title} 
                                className="w-full h-full rounded-xl border-0"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-3 pb-6">
            {slideConfigs.map((config, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? `${config.color === 'blue' ? 'bg-blue-500' : config.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'} scale-125` 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Floating Chatbot */}
<div className="fixed bottom-6 right-6 z-50">
  {chatbotOpen && (
    <div className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-2">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">HoneyCertify Assistant</h3>
            <p className="text-blue-100 text-sm">Ask me anything about beekeeping!</p>
          </div>
        </div>
        <button
          onClick={toggleChatbot}
          className="text-white hover:text-blue-200 transition-colors p-1 hover:bg-white/10 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="h-96 w-80">
        <iframe 
          src="https://ibtissam19-beekeeperschatbot.hf.space/?__theme=light" 
          title="HoneyCertify Chatbot" 
          className="w-full h-130 border-0"
          loading="lazy"
        />
      </div>
    </div>
  )}
  
  <button
    onClick={toggleChatbot}
    className={`group relative overflow-hidden p-4 rounded-full shadow-2xl transform transition-all duration-500 hover:scale-110 hover:shadow-xl active:scale-95 ${
      chatbotOpen 
        ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500' 
        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500'
    }`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
    <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
    {chatbotOpen ? (
      <X className="h-6 w-6 text-white relative z-10 transition-all duration-300 group-hover:rotate-180" />
    ) : (
      <MessageCircle className="h-6 w-6 text-white relative z-10 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
    )}
  </button>
</div>
    </div>
  );
};

export default Analytics;

// AnalyticsHeader component
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
                HoneyCertify Analytics
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