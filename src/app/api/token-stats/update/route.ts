import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CertificationStatus {
  originOnly: number;
  qualityOnly: number;
  bothCertifications: number;
  uncertified: number;
}

interface Apiary {
  batchId: string;
  batchNumber: string;
  name: string;
  number: string;
  hiveCount: number;
  latitude: number;
  longitude: number;
  honeyCollected: number;
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
  apiaries: Apiary[];
  certificationStatus: CertificationStatus;
  containerType: string;
  labelType: string;
  weightKg: number;
  jarUsed: number;
  // Certification data fields
  originOnly: number;
  qualityOnly: number;
  bothCertifications: number;
  uncertified: number;
  // Percentage fields
  originOnlyPercent: number;
  qualityOnlyPercent: number;
  bothCertificationsPercent: number;
  uncertifiedPercent: number;
  // Progress tracking
  completedChecks: number;
  totalChecks: number;
  
  // Optional dates
  certificationDate?: string;
  expiryDate?: string;
  
  // Optional file paths
  productionReportPath?: string;
  labReportPath?: string;
  
  // JSON field
  jarCertifications?: any;
  
  // Honey data fields
  honeyCertified?: number;
  honeyRemaining?: number;
  totalHoneyCollected?: number;
  // Relations
  userId: number;
}

interface TokenStatisticsProps {
  selectedBatches: string[];
  batches: Batch[];
  onStatsUpdate?: (stats: any) => void;
}

const TokenStatistics: React.FC<TokenStatisticsProps> = ({ selectedBatches, batches, onStatsUpdate }) => {
  // State for live token statistics
  const [liveTokenStats, setLiveTokenStats] = useState({
    originOnly: 0,
    qualityOnly: 0,
    bothCertifications: 0,
    totalUsed: 0,
    uncertified: 0
  });

  // State for animation and recent activity
  const [recentActivity, setRecentActivity] = useState<{
    type: 'completed' | 'rollback';
    tokensUsed: number;
    certificationBreakdown: any;
    timestamp: number;
  } | null>(null);

  // State for progress tracking
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate token statistics from selected batches
  const calculateTokenStatistics = () => {
    const selectedBatchData = selectedBatches.map(id => batches.find(b => b.id === id)).filter(Boolean);
    const totalOriginOnly = Math.floor(selectedBatchData.reduce((sum, batch) => sum + (batch.originOnly || 0), 0));
    const totalQualityOnly = Math.floor(selectedBatchData.reduce((sum, batch) => sum + (batch.qualityOnly || 0), 0));
    const totalBothCerts = Math.floor(selectedBatchData.reduce((sum, batch) => sum + (batch.bothCertifications || 0), 0));
    const totalUncertified = Math.floor(selectedBatchData.reduce((sum, batch) => sum + (batch.uncertified || 0), 0));
    
    const totalCertified = totalOriginOnly + totalQualityOnly + totalBothCerts;
    const tokensUsed = totalCertified;
    const tokensAvailable = totalUncertified;
    const totalTokensPossible = tokensUsed + tokensAvailable;

    return {
      totalOriginOnly,
      totalQualityOnly,
      totalBothCerts,
      totalUncertified,
      totalCertified,
      tokensUsed,
      tokensAvailable,
      totalTokensPossible
    };
  };

  const tokenStats = calculateTokenStatistics();

  // Listen for batch completion events to update live statistics
  useEffect(() => {
    const handleBatchCompleted = (event: CustomEvent) => {
      const { 
        certificationBreakdown, 
        tokensUsed, 
        originOnlyTokens, 
        qualityOnlyTokens, 
        bothCertificationsTokens,
        totalCertified,
        newTokenBalance
      } = event.detail;
      
      console.log('TokenStatistics: Batch completed event received', {
        certificationBreakdown,
        tokensUsed,
        originOnlyTokens,
        qualityOnlyTokens,
        bothCertificationsTokens
      });

      setIsUpdating(true);

      // Update live token statistics
      setLiveTokenStats(prev => {
        const newStats = {
          originOnly: prev.originOnly + Math.floor(originOnlyTokens || certificationBreakdown?.originOnly || 0),
          qualityOnly: prev.qualityOnly + Math.floor(qualityOnlyTokens || certificationBreakdown?.qualityOnly || 0),
          bothCertifications: prev.bothCertifications + Math.floor(bothCertificationsTokens || certificationBreakdown?.bothCertifications || 0),
          totalUsed: prev.totalUsed + Math.floor(tokensUsed || 0),
          uncertified: Math.max(0, prev.uncertified - Math.floor(tokensUsed || 0))
        };

        console.log('TokenStatistics: Updated live stats', { prev, newStats });
        return newStats;
      });

      // Set recent activity for animation
      setRecentActivity({
        type: 'completed',
        tokensUsed: Math.floor(tokensUsed || 0),
        certificationBreakdown: certificationBreakdown || {
          originOnly: Math.floor(originOnlyTokens || 0),
          qualityOnly: Math.floor(qualityOnlyTokens || 0),
          bothCertifications: Math.floor(bothCertificationsTokens || 0)
        },
        timestamp: Date.now()
      });

      // Notify parent component of stats update
      if (onStatsUpdate) {
        onStatsUpdate({
          originOnly: Math.floor(originOnlyTokens || certificationBreakdown?.originOnly || 0),
          qualityOnly: Math.floor(qualityOnlyTokens || certificationBreakdown?.qualityOnly || 0),
          bothCertifications: Math.floor(bothCertificationsTokens || certificationBreakdown?.bothCertifications || 0),
          tokensUsed: Math.floor(tokensUsed || 0),
          totalCertified: totalCertified,
          newTokenBalance: newTokenBalance
        });
      }

      // Reset updating state after animation
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);

      // Clear recent activity after 3 seconds
      setTimeout(() => {
        setRecentActivity(null);
      }, 3000);
    };

    const handleBatchRollback = (event: CustomEvent) => {
      const { certificationBreakdown, tokensRestored, error } = event.detail;
      
      console.log('TokenStatistics: Batch rollback event received', {
        certificationBreakdown,
        tokensRestored,
        error
      });

      setIsUpdating(true);

      // Rollback live token statistics
      setLiveTokenStats(prev => {
        const newStats = {
          originOnly: Math.max(0, prev.originOnly - Math.floor(certificationBreakdown?.originOnly || 0)),
          qualityOnly: Math.max(0, prev.qualityOnly - Math.floor(certificationBreakdown?.qualityOnly || 0)),
          bothCertifications: Math.max(0, prev.bothCertifications - Math.floor(certificationBreakdown?.bothCertifications || 0)),
          totalUsed: Math.max(0, prev.totalUsed - Math.floor(tokensRestored || 0)),
          uncertified: prev.uncertified + Math.floor(tokensRestored || 0)
        };

        console.log('TokenStatistics: Rolled back stats', { prev, newStats });
        return newStats;
      });

      // Set recent activity for rollback indication
      setRecentActivity({
        type: 'rollback',
        tokensUsed: Math.floor(tokensRestored || 0),
        certificationBreakdown: certificationBreakdown || {},
        timestamp: Date.now()
      });

      // Reset updating state after animation
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);

      // Clear recent activity after 3 seconds
      setTimeout(() => {
        setRecentActivity(null);
      }, 3000);
    };

    // Add event listeners
    window.addEventListener('batchCompleted', handleBatchCompleted as EventListener);
    window.addEventListener('batchRollback', handleBatchRollback as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('batchCompleted', handleBatchCompleted as EventListener);
      window.removeEventListener('batchRollback', handleBatchRollback as EventListener);
    };
  }, [onStatsUpdate]);

  // Initialize live stats from batches on component mount
  useEffect(() => {
    const allBatches = batches || [];
    const initialStats = {
      originOnly: Math.floor(allBatches.reduce((sum, batch) => sum + (batch.originOnly || 0), 0)),
      qualityOnly: Math.floor(allBatches.reduce((sum, batch) => sum + (batch.qualityOnly || 0), 0)),
      bothCertifications: Math.floor(allBatches.reduce((sum, batch) => sum + (batch.bothCertifications || 0), 0)),
      totalUsed: Math.floor(allBatches.reduce((sum, batch) => sum + (batch.originOnly || 0) + (batch.qualityOnly || 0) + (batch.bothCertifications || 0), 0)),
      uncertified: Math.floor(allBatches.reduce((sum, batch) => sum + (batch.uncertified || 0), 0))
    };
    
    console.log('TokenStatistics: Initialized with stats', initialStats);
    setLiveTokenStats(initialStats);
  }, [batches]);

  // Prepare data for charts
  const pieData = [
    { name: 'Origin Only', value: liveTokenStats.originOnly, color: '#3182CE' },
    { name: 'Quality Only', value: liveTokenStats.qualityOnly, color: '#38A169' },
    { name: 'Both Certifications', value: liveTokenStats.bothCertifications, color: '#805AD5' },
    { name: 'Uncertified', value: liveTokenStats.uncertified, color: '#E2E8F0' }
  ].filter(item => item.value > 0);

  const barData = [
    { name: 'Origin', value: tokenStats.totalOriginOnly, color: '#3182CE' },
    { name: 'Quality', value: tokenStats.totalQualityOnly, color: '#38A169' },
    { name: 'Both', value: tokenStats.totalBothCerts, color: '#805AD5' },
  ].filter(item => item.value > 0);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-600">
            {`${((payload[0].value / liveTokenStats.totalUsed) * 100).toFixed(1)}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Certification Tokens</h2>
        {isUpdating && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-blue-600">Updating...</span>
          </div>
        )}
      </div>
      
      {/* Recent Activity Banner */}
      {recentActivity && (
        <div className={`mb-4 p-3 rounded-lg border-l-4 ${
          recentActivity.type === 'completed' 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        } transition-all duration-500 ease-in-out`}>
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
                {recentActivity.certificationBreakdown && (
                  <span className="ml-2">
                    (Origin: {recentActivity.certificationBreakdown.originOnly || 0}, 
                    Quality: {recentActivity.certificationBreakdown.qualityOnly || 0}, 
                    Both: {recentActivity.certificationBreakdown.bothCertifications || 0})
                  </span>
                )}
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
      
      {/* Live Token Statistics Summary */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Live Token Statistics (All Batches)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className={`text-2xl font-bold text-blue-600 transition-all duration-300 ${
              isUpdating ? 'scale-110' : ''
            }`}>
              {liveTokenStats.originOnly}
            </div>
            <div className="text-xs text-gray-600">Origin Only</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-green-600 transition-all duration-300 ${
              isUpdating ? 'scale-110' : ''
            }`}>
              {liveTokenStats.qualityOnly}
            </div>
            <div className="text-xs text-gray-600">Quality Only</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-purple-600 transition-all duration-300 ${
              isUpdating ? 'scale-110' : ''
            }`}>
              {liveTokenStats.bothCertifications}
            </div>
            <div className="text-xs text-gray-600">Both Certs</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-yellow-600 transition-all duration-300 ${
              isUpdating ? 'scale-110' : ''
            }`}>
              {liveTokenStats.totalUsed}
            </div>
            <div className="text-xs text-gray-600">Total Used</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-gray-600 transition-all duration-300 ${
              isUpdating ? 'scale-110' : ''
            }`}>
              {liveTokenStats.uncertified}
            </div>
            <div className="text-xs text-gray-600">Uncertified</div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      {pieData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Token Distribution (All Batches)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Selected Batches</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {barData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Batches Token Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Selected Batches Token Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total tokens used:</span>
              <span className="font-medium">{tokenStats.tokensUsed}</span>
            </div>
            <div className="flex justify-between">
              <span>Available for certification:</span>
              <span className="font-medium">{tokenStats.tokensAvailable}</span>
            </div>
            <div className="flex justify-between">
              <span>Total possible:</span>
              <span className="font-medium">{tokenStats.totalTokensPossible}</span>
            </div>
            {tokenStats.totalTokensPossible > 0 && (
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${(tokenStats.tokensUsed / tokenStats.totalTokensPossible) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{((tokenStats.tokensUsed / tokenStats.totalTokensPossible) * 100).toFixed(1)}% used</span>
                  <span>{tokenStats.totalTokensPossible} total</span>
                </div>
              </div>
            )}
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
              <span className="font-medium">{tokenStats.totalOriginOnly}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Quality Only:
              </span>
              <span className="font-medium">{tokenStats.totalQualityOnly}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Both Certifications:
              </span>
              <span className="font-medium">{tokenStats.totalBothCerts}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total Selected:</span>
                <span>{tokenStats.tokensUsed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Efficiency Metrics */}
      {liveTokenStats.totalUsed > 0 && (
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Usage Efficiency</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {liveTokenStats.totalUsed > 0 ? 
                  ((liveTokenStats.originOnly / liveTokenStats.totalUsed) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-gray-600">Origin Certified</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {liveTokenStats.totalUsed > 0 ? 
                  ((liveTokenStats.qualityOnly / liveTokenStats.totalUsed) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-gray-600">Quality Certified</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {liveTokenStats.totalUsed > 0 ? 
                  ((liveTokenStats.bothCertifications / liveTokenStats.totalUsed) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-gray-600">Dual Certified</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenStatistics;