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
  tokenStats: TokenStats[];
}

const TokenWalletOverview: React.FC<TokenWalletOverviewProps> = ({ 
  batches = [],
  tokenBalance = 0
}) => {
  
  // State to track real-time token usage
  const [realTimeTokenStats, setRealTimeTokenStats] = useState<TokenStats | null>(null);
  
  // Listen for batch completion events
  useEffect(() => {
    const handleBatchCompleted = (event: CustomEvent) => {
      const { detail } = event;
      console.log('TokenWalletOverview received batch completion event:', detail);
      
      // Force recalculation of token stats
      const newStats = calculateTokenStats();
      setRealTimeTokenStats(newStats);
      
      // Optional: You can also trigger a re-render by updating a local state
      setTimeout(() => {
        setRealTimeTokenStats(calculateTokenStats());
      }, 500);
    };

    const handleBatchRollback = (event: CustomEvent) => {
      console.log('TokenWalletOverview received batch rollback event:', event.detail);
      // Recalculate stats after rollback
      const newStats = calculateTokenStats();
      setRealTimeTokenStats(newStats);
    };

    // Add event listeners
    window.addEventListener('batchCompleted', handleBatchCompleted as EventListener);
    window.addEventListener('batchRollback', handleBatchRollback as EventListener);

    return () => {
      // Cleanup event listeners
      window.removeEventListener('batchCompleted', handleBatchCompleted as EventListener);
      window.removeEventListener('batchRollback', handleBatchRollback as EventListener);
    };
  }, [batches, tokenBalance]);

  // Calculate token usage from completed batches
  const calculateTokenStats = (): TokenStats => {
    let originOnlyTokens = 0;
    let qualityOnlyTokens = 0;
    let bothCertificationsTokens = 0;
    
    // Early return if no batches
    if (!batches || !Array.isArray(batches)) {
      return {
        totalTokens: tokenBalance,
        remainingTokens: tokenBalance,
        originOnly: 0,
        qualityOnly: 0,
        bothCertifications: 0,
        usedTokens: 0
      };
    }
    
    // Process completed batches to count tokens used
    batches.forEach(batch => {
      // Add safety check for batch object
      if (!batch || typeof batch !== 'object') {
        return;
      }
      
      if (batch.status === 'completed' || batch.status === 'partially_completed') {
        // Check if batch has jarCertifications data
        if (batch.jarCertifications && typeof batch.jarCertifications === 'object') {
          // Count tokens from jar certifications
          Object.values(batch.jarCertifications).forEach((cert: any) => {
            if (cert && typeof cert === 'object') {
              // Count based on certification type
              if (cert.origin && cert.quality) {
                bothCertificationsTokens += 1;
              } else if (cert.origin) {
                originOnlyTokens += 1;
              } else if (cert.quality) {
                qualityOnlyTokens += 1;
              }
            }
          });
        }
        
        // Fallback to direct counts from batch data if available
        if (batch.originOnly && typeof batch.originOnly === 'number') {
          originOnlyTokens += batch.originOnly;
        }
        if (batch.qualityOnly && typeof batch.qualityOnly === 'number') {
          qualityOnlyTokens += batch.qualityOnly;
        }
        if (batch.bothCertifications && typeof batch.bothCertifications === 'number') {
          bothCertificationsTokens += batch.bothCertifications;
        }
      }
    });
    
    const usedTokens = originOnlyTokens + qualityOnlyTokens + bothCertificationsTokens;
    const remainingTokens = Math.max(0, tokenBalance - usedTokens);
    
    return {
      totalTokens: tokenBalance,
      remainingTokens,
      originOnly: originOnlyTokens,
      qualityOnly: qualityOnlyTokens,
      bothCertifications: bothCertificationsTokens,
      usedTokens
    };
  };

  // Use real-time stats if available, otherwise calculate from batches
  const tokenStats = realTimeTokenStats || calculateTokenStats();

  // Calculate pending tokens from processing batches
  const pendingTokens = batches.reduce((pending, batch) => {
    if (batch.status === 'processing' && batch.jarCertifications) {
      Object.values(batch.jarCertifications).forEach((cert: any) => {
        if (cert.origin && cert.quality) {
          pending.bothCertifications += 1;
        } else if (cert.origin) {
          pending.originOnly += 1;
        } else if (cert.quality) {
          pending.qualityOnly += 1;
        }
      });
    }
    return pending;
  }, { originOnly: 0, qualityOnly: 0, bothCertifications: 0 });

  // Calculate total used including pending
  const totalUsedIncludingPending = tokenStats.usedTokens + 
    pendingTokens.originOnly + pendingTokens.qualityOnly + pendingTokens.bothCertifications;
  const availableTokens = Math.max(0, tokenBalance - totalUsedIncludingPending);

  return (
    <div className="bg-white p-4 rounded-lg shadow text-black">
      <h2 className="text-lg font-semibold mb-4">Token Wallet Overview</h2>
      <div className="space-y-6">
        
        {/* Token Usage Breakdown */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-md font-semibold mb-3">Token Usage Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center mb-1">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                <p className="text-sm font-medium">Origin Only</p>
              </div>
              <p className="text-xl font-bold">{tokenStats.originOnly + pendingTokens.originOnly}</p>
              <p className="text-xs text-gray-500">tokens used</p>
              {pendingTokens.originOnly > 0 && (
                <p className="text-xs text-blue-500">+{pendingTokens.originOnly} pending</p>
              )}
            </div>
            
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center mb-1">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <p className="text-sm font-medium">Quality Only</p>
              </div>
              <p className="text-xl font-bold">{tokenStats.qualityOnly + pendingTokens.qualityOnly}</p>
              <p className="text-xs text-gray-500">tokens used</p>
              {pendingTokens.qualityOnly > 0 && (
                <p className="text-xs text-green-500">+{pendingTokens.qualityOnly} pending</p>
              )}
            </div>
            
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center mb-1">
                <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                <p className="text-sm font-medium">Both Certifications</p>
              </div>
              <p className="text-xl font-bold">{tokenStats.bothCertifications + pendingTokens.bothCertifications}</p>
              <p className="text-xs text-gray-500">tokens used</p>
              {pendingTokens.bothCertifications > 0 && (
                <p className="text-xs text-purple-500">+{pendingTokens.bothCertifications} pending</p>
              )}
            </div>
            
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center mb-1">
                <div className="h-3 w-3 rounded-full bg-gray-400 mr-2"></div>
                <p className="text-sm font-medium">Available</p>
              </div>
              <p className="text-xl font-bold">{availableTokens}</p>
              <p className="text-xs text-gray-500">tokens remaining</p>
            </div>
          </div>
          
          {/* Usage Summary */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-yellow-800">Total Tokens Used:</span>
              <span className="text-lg font-bold text-yellow-900">{totalUsedIncludingPending}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-yellow-700">Usage Rate:</span>
              <span className="text-sm font-medium text-yellow-900">
                {tokenBalance > 0 ? ((totalUsedIncludingPending / tokenBalance) * 100).toFixed(1) : 0}%
              </span>
            </div>
            {realTimeTokenStats && (
              <div className="mt-2 text-xs text-green-600">
                ✓ Updated in real-time
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenWalletOverview;