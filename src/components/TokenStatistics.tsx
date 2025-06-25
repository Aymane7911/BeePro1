import React from 'react';
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
}

const TokenStatistics: React.FC<TokenStatisticsProps> = ({ selectedBatches, batches }) => {
  // Calculate token statistics
  const selectedBatchData = selectedBatches.map(id => batches.find(b => b.id === id)).filter(Boolean);
  const totalOriginOnly = selectedBatchData.reduce((sum, batch) => sum + (batch.originOnly || 0), 0);
  const totalQualityOnly = selectedBatchData.reduce((sum, batch) => sum + (batch.qualityOnly || 0), 0);
  const totalBothCerts = selectedBatchData.reduce((sum, batch) => sum + (batch.bothCertifications || 0), 0);
  const totalUncertified = selectedBatchData.reduce((sum, batch) => sum + (batch.uncertified || 0), 0);
  
  const totalCertified = totalOriginOnly + totalQualityOnly + totalBothCerts;
  const tokensUsed = Math.round(totalCertified);
  const tokensAvailable = Math.round(totalUncertified);
  const totalTokensPossible = tokensUsed + tokensAvailable;

  const barData = [
    { name: 'Origin', value: totalOriginOnly, color: '#3182CE' },
    { name: 'Quality', value: totalQualityOnly, color: '#38A169' },
    { name: 'Both', value: totalBothCerts, color: '#805AD5' },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Certification Tokens</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Token Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total tokens used:</span>
              <span className="font-medium">{tokensUsed}</span>
            </div>
            <div className="flex justify-between">
              <span>Available for certification:</span>
              <span className="font-medium">{tokensAvailable}</span>
            </div>
            <div className="flex justify-between">
              <span>Total possible:</span>
              <span className="font-medium">{totalTokensPossible}</span>
            </div>
            {totalTokensPossible > 0 && (
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${(tokensUsed / totalTokensPossible) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{((tokensUsed / totalTokensPossible) * 100).toFixed(1)}% certified</span>
                  <span>{tokensUsed} / {totalTokensPossible}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Token Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kg`, 'Certified']} />
                <Bar dataKey="value" name="Tokens" fill="#FBBF24">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {selectedBatches.length === 0 && (
        <div className="text-center py-4 text-gray-500 italic">
          Select batches to view token statistics
        </div>
      )}
    </div>
  );
};

export default TokenStatistics;