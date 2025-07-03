'use client';

import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0); // 0 for invoices, 1 for production, 2 for beehive

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

  useEffect(() => {
    checkHealth();
    fetchInvoices();
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
        accent: 'border-blue-300 bg-blue-50 hover:bg-blue-100'
      },
      green: {
        primary: 'from-green-500 to-blue-600',
        secondary: 'bg-green-100 text-green-600 hover:bg-green-200',
        accent: 'border-green-300 bg-green-50 hover:bg-green-100'
      },
      yellow: {
        primary: 'from-yellow-500 to-orange-600',
        secondary: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
        accent: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
      }
    };
    return colorMap[color][variant];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-yellow-100 text-black">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-yellow-400 rounded-full opacity-15 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${getColorClasses(currentConfig.color)} rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300`}>
            <div className="text-3xl">{currentConfig.icon}</div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {currentConfig.title}
          </h1>
          <div className="flex items-center justify-center space-x-4">
            <p className="text-gray-600 text-lg">{currentConfig.description}</p>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${apiStatus === 'connected' ? 'bg-green-100 text-green-700' : apiStatus === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {apiStatus === 'connected' ? '🟢 API Connected' : apiStatus === 'error' ? '🔴 API Disconnected' : '🟡 Checking API...'}
            </div>
          </div>
        </div>

        {/* Sliding Navigation */}
        <div className="flex justify-center">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentConfig.statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <span>{stat.trend === 'up' ? '↗️' : '↘️'}</span>
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sliding Dashboard Container */}
        <div className="flex justify-center">
          <div className="w-full max-w-7xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8">
              {loading ? (
                <div className="flex items-center justify-center min-h-96">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600">Loading dashboard data...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    onTouchStart={handleSwipeStart}
                    onTouchEnd={handleSwipeEnd}
                    onMouseDown={handleSwipeStart}
                    onMouseUp={handleSwipeEnd}
                  >
                    {slideConfigs.map((config, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
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
                          <div className="w-full h-[700px]">
                            <iframe 
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

        {/* Upload Section */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Upload {currentConfig.title.split(' ')[0]} Data
                  </h3>
                  <div className="space-y-4">
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${getColorClasses(currentConfig.color, 'accent')}`}>
                      <input
                        type="file"
                        multiple
                        accept={currentConfig.acceptedFiles}
                        onChange={handleFileSelect}
                        className="hidden"
                        id="fileInput"
                      />
                      <label htmlFor="fileInput" className="cursor-pointer">
                        <div className={`text-4xl mb-4 ${currentConfig.color === 'blue' ? 'text-blue-600' : currentConfig.color === 'green' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {currentConfig.icon}
                        </div>
                        <p className="text-lg font-medium text-gray-700">
                          Click to select {currentConfig.acceptedFiles === '.pdf' ? 'PDF files' : 'files'}
                        </p>
                        <p className="text-gray-500">or drag and drop files here</p>
                      </label>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-medium text-gray-700 mb-2">Selected Files:</h4>
                        <ul className="space-y-1">
                          {selectedFiles.map((file, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              {currentConfig.icon} {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={uploadFiles}
                        disabled={selectedFiles.length === 0 || uploadLoading}
                        className={`px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${getColorClasses(currentConfig.color)} text-white`}
                      >
                        {uploadLoading ? '⏳ Processing...' : '🚀 Upload & Process'}
                      </button>
                      <button
                        onClick={currentSlide === 0 ? fetchInvoices : () => {}}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                      >
                        🔄 Refresh Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-3">
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

        {/* Footer Space */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default Analytics;