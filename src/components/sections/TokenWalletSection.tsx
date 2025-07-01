import React from 'react';
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
  batches?: Batch[]; // Made optional with ?
  tokenBalance: number; // Changed from userTokenBalance to tokenBalance to match Header prop
  tokenStats: TokenStats[];
}

const TokenWalletOverview: React.FC<TokenWalletOverviewProps> = ({ 
  batches = [], // Default to empty array
  tokenBalance = 0 // Changed from userTokenBalance to tokenBalance
}) => {
  
  // Calculate token usage from completed batches
  const calculateTokenStats = (): TokenStats => {
    let originOnlyTokens = 0;
    let qualityOnlyTokens = 0;
    let bothCertificationsTokens = 0;
    
    // Early return if no batches
    if (!batches || !Array.isArray(batches)) {
      return {
        totalTokens: tokenBalance, // Updated to use tokenBalance
        remainingTokens: tokenBalance, // Updated to use tokenBalance
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
        // Parse jar certifications if it exists
        let jarCertifications: any = {};
        
        if (batch.jarCertifications) {
          try {
            jarCertifications = typeof batch.jarCertifications === 'string' 
              ? JSON.parse(batch.jarCertifications) 
              : batch.jarCertifications;
          } catch (e) {
            console.warn('Failed to parse jarCertifications for batch', batch.id);
          }
        }
        
        // Count tokens based on jar certifications
        // Each jar uses 1 token regardless of certification type
        if (jarCertifications && typeof jarCertifications === 'object') {
          Object.keys(jarCertifications).forEach(jarId => {
            const certification = jarCertifications[jarId];
            if (certification) {
              // Find the jar quantity (this would need to be stored in the batch data)
              // For now, we'll assume 1 token per jar certification entry
              // You might need to adjust this based on how jar quantities are stored
              
              if (certification.origin && certification.quality) {
                bothCertificationsTokens += 1; // or += jarQuantity if available
              } else if (certification.origin && !certification.quality) {
                originOnlyTokens += 1; // or += jarQuantity if available
              } else if (certification.quality && !certification.origin) {
                qualityOnlyTokens += 1; // or += jarQuantity if available
              }
            }
          });
        }
        
        // Alternative: if you have direct counts in the batch data
        if (batch.originOnly && typeof batch.originOnly === 'number') {
          originOnlyTokens += batch.originOnly;
        }
        if (batch.qualityOnly && typeof batch.qualityOnly === 'number') {
          qualityOnlyTokens += batch.qualityOnly;
        }
        if (batch.bothCertifications && typeof batch.bothCertifications === 'number') {
          bothCertificationsTokens += batch.bothCertifications;
        }
        
        // Or if you have jarUsed field that represents total tokens used for this batch
        // This would be the most straightforward approach if available
        // totalUsedTokens += batch.jarUsed || 0;
      }
    });
    
    const usedTokens = originOnlyTokens + qualityOnlyTokens + bothCertificationsTokens;
    const remainingTokens = Math.max(0, tokenBalance - usedTokens); // Updated to use tokenBalance
    
    return {
      totalTokens: tokenBalance, // Updated to use tokenBalance
      remainingTokens,
      originOnly: originOnlyTokens,
      qualityOnly: qualityOnlyTokens,
      bothCertifications: bothCertificationsTokens,
      usedTokens
    };
  };

  const tokenStats = calculateTokenStats();
  
  // Prepare data for pie chart
  const tokenDistributionData = [
    {
      name: 'Origin Only',
      value: tokenStats.originOnly,
      color: '#3B82F6', // blue-500
    },
    {
      name: 'Quality Only', 
      value: tokenStats.qualityOnly,
      color: '#10B981', // green-500
    },
    {
      name: 'Both Certifications',
      value: tokenStats.bothCertifications,
      color: '#8B5CF6', // purple-500
    },
    {
      name: 'Available',
      value: tokenStats.remainingTokens,
      color: '#6B7280', // gray-500
    }
  ].filter(item => item.value > 0); // Only show segments with values > 0

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
              <p className="text-xl font-bold">{tokenStats.originOnly}</p>
              <p className="text-xs text-gray-500">tokens used</p>
            </div>
            
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center mb-1">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <p className="text-sm font-medium">Quality Only</p>
              </div>
              <p className="text-xl font-bold">{tokenStats.qualityOnly}</p>
              <p className="text-xs text-gray-500">tokens used</p>
            </div>
            
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center mb-1">
                <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                <p className="text-sm font-medium">Both Certifications</p>
              </div>
              <p className="text-xl font-bold">{tokenStats.bothCertifications}</p>
              <p className="text-xs text-gray-500">tokens used</p>
            </div>
            
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center mb-1">
                <div className="h-3 w-3 rounded-full bg-gray-400 mr-2"></div>
                <p className="text-sm font-medium">Available</p>
              </div>
              <p className="text-xl font-bold">{tokenStats.remainingTokens}</p>
              <p className="text-xs text-gray-500">tokens remaining</p>
            </div>
          </div>
          
          {/* Usage Summary */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-yellow-800">Total Tokens Used:</span>
              <span className="text-lg font-bold text-yellow-900">{tokenStats.usedTokens}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-yellow-700">Usage Rate:</span>
              <span className="text-sm font-medium text-yellow-900">
                {tokenStats.totalTokens > 0 ? ((tokenStats.usedTokens / tokenStats.totalTokens) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

       

       
        
      </div>
    </div>
  );
};

export default TokenWalletOverview;