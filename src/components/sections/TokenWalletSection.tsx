import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface TokenStats {
  totalTokens: number;
  remainingTokens: number;
  originOnly: number;
  qualityOnly: number;
  bothCertifications: number;
  usedTokens: number;
}

interface Batch {
  id: string;
  batchNumber: string;
  batchName: string;
  name: string;
  createdAt: string;
  status: string;
  totalKg: number;
  jarsProduced: number;
  apiaries: any[];
  certificationStatus: any;
  containerType: string;
  labelType: string;
  weightKg: number;
  jarUsed: number;
  // Certification data fields
  originOnly: number;
  qualityOnly: number;
  bothCertifications: number;
  uncertified: number;
  // Progress tracking
  completedChecks: number;
  totalChecks: number;
  // Optional dates
  certificationDate?: string;
  expiryDate?: string;
  // Optional file paths
  productionReportPath?: string;
  labReportPath?: string;
  // JSON field - this contains the jar certifications data
  jarCertifications?: any;
  // Honey data fields
  honeyCertified?: number;
  honeyRemaining?: number;
  totalHoneyCollected?: number;
  // Relations
  userId: number;
}

interface TokenWalletOverviewProps {
  batches?: Batch[];
  tokenBalance: number;
  tokenStats?: TokenStats[];
}

const getTokenFromStorage = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authtoken') ||
           localStorage.getItem('auth_token') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('authtoken') ||
           sessionStorage.getItem('auth_token') ||
           sessionStorage.getItem('token');
  }
  return null;
};


const TokenWalletOverview: React.FC<TokenWalletOverviewProps> = ({ 
  batches = [],
  tokenBalance = 0
}) => {
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingTokens, setPendingTokens] = useState({ 
    originOnly: 0, 
    qualityOnly: 0, 
    bothCertifications: 0 
  });

  // Authentication state
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
  const token = getTokenFromStorage();
  if (token) {
    setAuthToken(token);
    setIsAuthenticated(true);
  } else {
    setIsAuthenticated(false);
  }
}, []);

   // Get authentication headers
  const getAuthHeaders = () => {
    const token = authToken || getTokenFromStorage();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  };

  // Fetch token stats from backend
  const fetchTokenStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check authentication before making request
      const token = authToken || getTokenFromStorage();
      if (!token) {
        setError('Authentication required. Please log in.');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/token-stats/update', {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error('Authentication required. Please log in.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTokenStats(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch token stats', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch token stats');
      
      // Fallback to default values
      setTokenStats({
        totalTokens: 0,
        remainingTokens: 0,
        originOnly: 0,
        qualityOnly: 0,
        bothCertifications: 0,
        usedTokens: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTokenStats();
  }, []);

  // Handle batch events
  useEffect(() => {
    const handleBatchEvent = () => fetchTokenStats();

    window.addEventListener('batchCompleted', handleBatchEvent);
    window.addEventListener('batchRollback', handleBatchEvent);

    return () => {
      window.removeEventListener('batchCompleted', handleBatchEvent);
      window.removeEventListener('batchRollback', handleBatchEvent);
    };
  }, []);

  // Calculate pending tokens
  useEffect(() => {
    const pending = batches.reduce((acc, batch) => {
      if (batch.status === 'processing' && batch.jarCertifications) {
        Object.values(batch.jarCertifications).forEach((cert: any) => {
          if (cert.origin && cert.quality) acc.bothCertifications += 1;
          else if (cert.origin) acc.originOnly += 1;
          else if (cert.quality) acc.qualityOnly += 1;
        });
      }
      return acc;
    }, { originOnly: 0, qualityOnly: 0, bothCertifications: 0 });

    setPendingTokens(pending);
  }, [batches]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow text-black">
        <h2 className="text-lg font-semibold mb-4">Token Wallet Overview</h2>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading token statistics...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow text-black">
        <h2 className="text-lg font-semibold mb-4">Token Wallet Overview</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="h-4 w-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-red-800 font-medium">Error Loading Token Stats</span>
          </div>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <button 
            onClick={fetchTokenStats}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ensure tokenStats is not null at this point
  if (!tokenStats) {
    return null;
  }

  // Calculate total pending tokens
  const totalPendingTokens = pendingTokens.originOnly + pendingTokens.qualityOnly + pendingTokens.bothCertifications;
  
  // Use the remainingTokens from the database, subtract pending tokens
  const availableTokens = Math.max(0, tokenStats.remainingTokens - totalPendingTokens);

  return (
    <div className="bg-white p-4 rounded-lg shadow text-black">
      <h2 className="text-lg font-semibold mb-4">Token Wallet Overview</h2>
      
      {/* Token Usage Section */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-md font-semibold mb-3">Token Usage Distribution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Origin Only */}
          <div className="p-3 bg-white rounded-lg shadow">
            <div className="flex items-center mb-1">
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
              <p className="text-sm font-medium">Origin Only</p>
            </div>
            <p className="text-xl font-bold">
              {tokenStats.originOnly + pendingTokens.originOnly}
            </p>
            <p className="text-xs text-gray-500">tokens used</p>
            {pendingTokens.originOnly > 0 && (
              <p className="text-xs text-blue-500">
                +{pendingTokens.originOnly} pending
              </p>
            )}
          </div>
          
          {/* Quality Only */}
          <div className="p-3 bg-white rounded-lg shadow">
            <div className="flex items-center mb-1">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <p className="text-sm font-medium">Quality Only</p>
            </div>
            <p className="text-xl font-bold">
              {tokenStats.qualityOnly + pendingTokens.qualityOnly}
            </p>
            <p className="text-xs text-gray-500">tokens used</p>
            {pendingTokens.qualityOnly > 0 && (
              <p className="text-xs text-green-500">
                +{pendingTokens.qualityOnly} pending
              </p>
            )}
          </div>
          
          {/* Both Certifications */}
          <div className="p-3 bg-white rounded-lg shadow">
            <div className="flex items-center mb-1">
              <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
              <p className="text-sm font-medium">Both Certifications</p>
            </div>
            <p className="text-xl font-bold">
              {tokenStats.bothCertifications + pendingTokens.bothCertifications}
            </p>
            <p className="text-xs text-gray-500">tokens used</p>
            {pendingTokens.bothCertifications > 0 && (
              <p className="text-xs text-purple-500">
                +{pendingTokens.bothCertifications} pending
              </p>
            )}
          </div>
          
          {/* Available Tokens - NOW MATCHES TOKEN BALANCE */}
          <div className="p-3 bg-white rounded-lg shadow">
            <div className="flex items-center mb-1">
              <div className="h-3 w-3 rounded-full bg-gray-400 mr-2"></div>
              <p className="text-sm font-medium">Available</p>
            </div>
            <p className="text-xl font-bold">{availableTokens}</p>
            <p className="text-xs text-gray-500">tokens remaining</p>
            {totalPendingTokens > 0 && (
              <p className="text-xs text-orange-500">
                -{totalPendingTokens} pending
              </p>
            )}
          </div>
        </div>
        
        {/* Usage Summary */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-yellow-800">
              Total Tokens Used:
            </span>
            <span className="text-lg font-bold text-yellow-900">
              {tokenStats.totalTokens - tokenStats.remainingTokens}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-yellow-700">Usage Rate:</span>
            <span className="text-sm font-medium text-yellow-900">
              {tokenStats.totalTokens > 0 
                ? (((tokenStats.totalTokens - tokenStats.remainingTokens) / tokenStats.totalTokens) * 100).toFixed(1) 
                : 0}%
            </span>
          </div>
          {totalPendingTokens > 0 && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-orange-700">Pending Tokens:</span>
              <span className="text-sm font-medium text-orange-900">
                {totalPendingTokens}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenWalletOverview;