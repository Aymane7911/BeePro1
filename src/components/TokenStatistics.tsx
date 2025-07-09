import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface TokenStats {
  originOnly: number;
  qualityOnly: number;
  remainingTokens: number;
  totalTokens: number;
  usedTokens?: number;
}

const getTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null; // SSR safe
  return (
    localStorage.getItem('authtoken') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('authtoken') ||
    sessionStorage.getItem('auth_token') ||
    sessionStorage.getItem('token')
  );
};

const TokenStatistics: React.FC = () => {
  
  // State for API data
  const [apiTokenStats, setApiTokenStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for live updates
  const [liveTokenStats, setLiveTokenStats] = useState({
    originOnly: 0,
    qualityOnly: 0,
    totalUsed: 0,
    uncertified: 0
  });
  
  const [hasReceivedValidData, setHasReceivedValidData] = useState(false);
  const [recentActivity, setRecentActivity] = useState<{
    type: 'completed' | 'rollback';
    tokensUsed: number;
    certificationBreakdown: any;
    timestamp: number;
  } | null>(null);
  
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Auth state with localStorage support
   const [authToken, setAuthToken] = useState<string | null>(getTokenFromStorage);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getTokenFromStorage());

  // Default stats
  const defaultStats: TokenStats = {
    originOnly: 0,
    qualityOnly: 0,
    remainingTokens: 0,
    totalTokens: 0
  };

  const getAuthHeaders = () => {
    // Try to get token from state first, then localStorage as fallback
    const token = authToken || localStorage.getItem('authToken');
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

  // Fetch token stats from API
  const fetchTokenStats = async () => {
    try {
      setLoading(true);
      
      const headers = getAuthHeaders();
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      };

      const response = await fetch('/api/token-stats/update', fetchOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error('Authentication required. Please log in.');
        }
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      // Map API response to our structure with defaults
      const stats: TokenStats = {
        originOnly: data.originOnly || 0,
        qualityOnly: data.qualityOnly || 0,
        remainingTokens: data.remainingTokens || 0,
        totalTokens: data.totalTokens || 0,
        usedTokens: data.usedTokens || 0
      };
      
      setApiTokenStats(stats);
      setError(null);
      setIsAuthenticated(true);
      
      // Calculate initial live stats
      const totalUsed = stats.totalTokens - stats.remainingTokens;
      const hasValidData = stats.totalTokens > 0 || totalUsed > 0 || 
                          stats.originOnly > 0 || stats.qualityOnly > 0;
      
      if (hasValidData || !hasReceivedValidData) {
        setLiveTokenStats({
          originOnly: stats.originOnly,
          qualityOnly: stats.qualityOnly,
          totalUsed,
          uncertified: stats.remainingTokens
        });
        
        if (hasValidData) setHasReceivedValidData(true);
      }
      
    } catch (err) {
      console.error('Error fetching token stats:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load token statistics';
      setError(errorMessage);
      
      // Set demo data if API fails
      if (!hasReceivedValidData) {
        const demoStats = {
          originOnly: 150,
          qualityOnly: 200,
          totalUsed: 350,
          uncertified: 650
        };
        setLiveTokenStats(demoStats);
        setApiTokenStats({
          ...defaultStats,
          totalTokens: 1000,
          remainingTokens: 650,
          originOnly: 150,
          qualityOnly: 200
        });
        setHasReceivedValidData(true);
        console.log('Using demo data due to API failure');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTokenStats();
  }, []);

  // Handle batch completion events
  useEffect(() => {
    const handleBatchCompleted = (event: CustomEvent) => {
      const { 
        certificationBreakdown, 
        tokensUsed, 
        originOnlyTokens, 
        qualityOnlyTokens
      } = event.detail || {};
      
      setIsUpdating(true);
      setHasReceivedValidData(true);

      setLiveTokenStats(prev => {
        const newStats = {
          originOnly: prev.originOnly + Math.floor(originOnlyTokens || certificationBreakdown?.originOnly || 0),
          qualityOnly: prev.qualityOnly + Math.floor(qualityOnlyTokens || certificationBreakdown?.qualityOnly || 0),
          totalUsed: prev.totalUsed + Math.floor(tokensUsed || 0),
          uncertified: Math.max(0, prev.uncertified - Math.floor(tokensUsed || 0))
        };
        
        return newStats;
      });

      setRecentActivity({
        type: 'completed',
        tokensUsed: Math.floor(tokensUsed || 0),
        certificationBreakdown: certificationBreakdown || {
          originOnly: Math.floor(originOnlyTokens || 0),
          qualityOnly: Math.floor(qualityOnlyTokens || 0)
        },
        timestamp: Date.now()
      });

      setTimeout(() => setIsUpdating(false), 1000);
      setTimeout(() => setRecentActivity(null), 3000);
      
      // Refresh data from API after delay to ensure consistency
      setTimeout(fetchTokenStats, 2000);
    };

    const handleBatchRollback = (event: CustomEvent) => {
      const { certificationBreakdown, tokensRestored } = event.detail || {};
      
      setIsUpdating(true);

      setLiveTokenStats(prev => {
        const newStats = {
          originOnly: Math.max(0, prev.originOnly - Math.floor(certificationBreakdown?.originOnly || 0)),
          qualityOnly: Math.max(0, prev.qualityOnly - Math.floor(certificationBreakdown?.qualityOnly || 0)),
          totalUsed: Math.max(0, prev.totalUsed - Math.floor(tokensRestored || 0)),
          uncertified: prev.uncertified + Math.floor(tokensRestored || 0)
        };
        
        return newStats;
      });

      setRecentActivity({
        type: 'rollback',
        tokensUsed: Math.floor(tokensRestored || 0),
        certificationBreakdown: certificationBreakdown || {},
        timestamp: Date.now()
      });

      setTimeout(() => setIsUpdating(false), 1000);
      setTimeout(() => setRecentActivity(null), 3000);
      
      // Refresh data from API
      setTimeout(fetchTokenStats, 2000);
    };

    window.addEventListener('batchCompleted', handleBatchCompleted as EventListener);
    window.addEventListener('batchRollback', handleBatchRollback as EventListener);

    return () => {
      window.removeEventListener('batchCompleted', handleBatchCompleted as EventListener);
      window.removeEventListener('batchRollback', handleBatchRollback as EventListener);
    };
  }, []);

  // Use API stats if available, otherwise defaults
  const stats = apiTokenStats || defaultStats;

  // Prepare data for charts
  const pieData = [
    { name: 'Origin Only', value: liveTokenStats.originOnly, color: '#3182CE' },
    { name: 'Quality Only', value: liveTokenStats.qualityOnly, color: '#38A169' },
    { name: 'Uncertified', value: liveTokenStats.uncertified, color: '#E2E8F0' }
  ].filter(item => item.value > 0);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = Math.max(stats.totalTokens, liveTokenStats.totalUsed + liveTokenStats.uncertified, 1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-600">
            {`${((payload[0].value / total) * 100).toFixed(1)}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Login function with localStorage persistence
  const handleLogin = async () => {
    try {
      // For demo purposes, simulate a successful login
      const token = 'demo-token-123';
      
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      setAuthToken(token);
      setIsAuthenticated(true);
      setError(null);
      
      await fetchTokenStats();
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setIsAuthenticated(false);
    setApiTokenStats(null);
    setLiveTokenStats({
      originOnly: 0,
      qualityOnly: 0,
      totalUsed: 0,
      uncertified: 0
    });
    setHasReceivedValidData(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading token statistics...</p>
        </div>
      </div>
    );
  }

  // Error state with auth check
  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-red-600">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={fetchTokenStats}
          >
            Retry
          </button>
          {!isAuthenticated && (
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              onClick={handleLogin}
            >
              Login (Demo)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Certification Tokens</h2>
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">● Connected</span>
              <button 
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Logout
              </button>
            </div>
          )}
          {isUpdating && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm text-blue-600">Updating...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Activity Banner */}
      {recentActivity && (
        <div className={`mb-4 p-3 rounded-lg border-l-4 transition-all duration-300 ${
          recentActivity.type === 'completed' 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                recentActivity.type === 'completed' ? 'text-green-800' : 'text-red-800'
              }`}>
                {recentActivity.type === 'completed' ? 'Batch Completed!' : 'Batch Rolled Back'}
              </p>
              <p className="text-xs text-gray-600">
                {recentActivity.type === 'completed' ? 'Tokens Used: ' : 'Tokens Restored: '}
                {recentActivity.tokensUsed}
              </p>
            </div>
            <div className={`text-2xl ${
              recentActivity.type === 'completed' ? 'text-green-600' : 'text-red-600'
            }`}>
              {recentActivity.type === 'completed' ? '✓' : '↻'}
            </div>
          </div>
        </div>
      )}
      
      {/* Token Summary Section */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Token Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className={`text-2xl font-bold text-blue-600 transition-transform duration-200 ${isUpdating ? 'scale-110' : ''}`}>
              {liveTokenStats.originOnly}
            </div>
            <div className="text-xs text-gray-600">Origin Only</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-green-600 transition-transform duration-200 ${isUpdating ? 'scale-110' : ''}`}>
              {liveTokenStats.qualityOnly}
            </div>
            <div className="text-xs text-gray-600">Quality Only</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-yellow-600 transition-transform duration-200 ${isUpdating ? 'scale-110' : ''}`}>
              {liveTokenStats.totalUsed}
            </div>
            <div className="text-xs text-gray-600">Total Used</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-gray-600 transition-transform duration-200 ${isUpdating ? 'scale-110' : ''}`}>
              {liveTokenStats.uncertified}
            </div>
            <div className="text-xs text-gray-600">Uncertified</div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      {pieData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Token Distribution</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Global Token Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Global Token Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total tokens:</span>
              <span className="font-medium">{stats.totalTokens}</span>
            </div>
            <div className="flex justify-between">
              <span>Tokens used:</span>
              <span className="font-medium">{liveTokenStats.totalUsed}</span>
            </div>
            <div className="flex justify-between">
              <span>Available:</span>
              <span className="font-medium">{liveTokenStats.uncertified}</span>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${stats.totalTokens > 0 ? (liveTokenStats.totalUsed / stats.totalTokens) * 100 : 0}%` }}
                  className="bg-green-500 transition-all duration-500"
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  {stats.totalTokens > 0 ? ((liveTokenStats.totalUsed / stats.totalTokens) * 100).toFixed(1) : 0}% used
                </span>
                <span>{stats.totalTokens} total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Token Usage Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Token Usage Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Origin Only:
              </span>
              <span className="font-medium">{liveTokenStats.originOnly}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Quality Only:
              </span>
              <span className="font-medium">{liveTokenStats.qualityOnly}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total Used:</span>
                <span>{liveTokenStats.totalUsed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Efficiency */}
      {liveTokenStats.totalUsed > 0 && (
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Usage Efficiency</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {liveTokenStats.totalUsed > 0 ? ((liveTokenStats.originOnly / liveTokenStats.totalUsed) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-gray-600">Origin Certified</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {liveTokenStats.totalUsed > 0 ? ((liveTokenStats.qualityOnly / liveTokenStats.totalUsed) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-gray-600">Quality Certified</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {liveTokenStats.totalUsed > 0 ? ((liveTokenStats.originOnly + liveTokenStats.qualityOnly) / (liveTokenStats.totalUsed * 2) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-gray-600">Total Certification Coverage</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenStatistics;