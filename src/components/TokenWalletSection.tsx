import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Layers, Database, Tag, Package, RefreshCw, Menu, X, Home, Settings, Users, Activity, HelpCircle, Wallet, PlusCircle, MapPin, CheckCircle, Trash2, Globe, FileText, AlertCircle, Sparkles, LogOut, Plus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';



interface TokenStats {
  originOnly: number;
  qualityOnly: number;
  remainingTokens: number;
}

interface TokenWalletSectionProps {
  tokenStats: TokenStats;
}

const TokenWalletSection = ({ tokenStats }: TokenWalletSectionProps) => {
  const tokenDistributionData = [
    { name: 'Origin Certified', value: tokenStats.originOnly, color: '#3B82F6' },
    { name: 'Quality Certified', value: tokenStats.qualityOnly, color: '#10B981' },
    { name: 'Remaining Tokens', value: tokenStats.remainingTokens, color: '#9CA3AF' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow text-black">
      <h2 className="text-lg font-semibold mb-4">Token Wallet Overview</h2>
      <div className="space-y-6">
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-md font-semibold mb-3">Token Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center mb-1">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                <p className="text-sm font-medium">Origin certified</p>
              </div>
              <p className="text-xl font-bold">{tokenStats.originOnly} tokens</p>
              <p className="text-xs text-gray-500">Applied to {tokenStats.originOnly} kg of honey</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center mb-1">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <p className="text-sm font-medium">Quality certified</p>
              </div>
              <p className="text-xl font-bold">{tokenStats.qualityOnly} tokens</p>
              <p className="text-xs text-gray-500">Applied to {tokenStats.qualityOnly} kg of honey</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow">
              <div className="flex items-center mb-1">
                <div className="h-3 w-3 rounded-full bg-gray-400 mr-2"></div>
                <p className="text-sm font-medium">Remaining Tokens</p>
              </div>
              <p className="text-xl font-bold">{tokenStats.remainingTokens} tokens</p>
              <p className="text-xs text-gray-500">Available for use</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={tokenDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {tokenDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} tokens`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TokenWalletSection; 