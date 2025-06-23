import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Layers, Database, Tag, Package, RefreshCw, Menu, X, Home, Settings, Users, Activity, HelpCircle, Wallet, PlusCircle, MapPin, CheckCircle, Trash2, Globe, FileText, AlertCircle, Sparkles, LogOut, Plus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';





interface Batch {
  certificationDate?: string;
  originOnly: number;
  qualityOnly: number;
  uncertified: number;
}

interface CertificationChartProps {
  filteredBatches: Batch[];
  timeRange: string;
  setTimeRange: (range: string) => void;
}

const CertificationChart = ({ 
  filteredBatches, 
  timeRange, 
  setTimeRange 
}: CertificationChartProps) => {
  const chartData = filteredBatches.reduce((acc, batch) => {
    const month = batch.certificationDate ? 
      new Date(batch.certificationDate).toLocaleString('default', { month: 'short' }) : 'Unknown';
    
    let monthEntry = acc.find(entry => entry.month === month);
    if (!monthEntry) {
      monthEntry = { 
        month, 
        originOnly: 0, 
        qualityOnly: 0, 
        uncertified: 0 
      };
      acc.push(monthEntry);
    }
    
    monthEntry.originOnly += Number(batch.originOnly || 0);
    monthEntry.qualityOnly += Number(batch.qualityOnly || 0);
    monthEntry.uncertified += Number(batch.uncertified || 0);
    
    return acc;
  }, [] as { month: string; originOnly: number; qualityOnly: number; uncertified: number }[])
  .sort((a, b) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(a.month) - months.indexOf(b.month);
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow text-black mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Certification Overview</h2>
        <div className="relative">
          <select 
            className="bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '0.375rem', 
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              itemStyle={{ padding: '2px 0' }}
              formatter={(value) => [`${value} kg`, null]}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            <Line 
              type="monotone" 
              dataKey="originOnly" 
              name="Origin Certified" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="qualityOnly" 
              name="Quality Certified" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="uncertified" 
              name="Uncertified" 
              stroke="#9CA3AF" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-4 border-t pt-4">
        <div className="text-center">
          <p className="text-gray-500">Origin Certified</p>
          <p className="text-2xl font-bold">
            {filteredBatches.reduce((total, batch) => total + Number(batch.originOnly || 0), 0)} kg
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Quality Certified</p>
          <p className="text-2xl font-bold">
            {filteredBatches.reduce((total, batch) => total + Number(batch.qualityOnly || 0), 0)} kg
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Uncertified</p>
          <p className="text-2xl font-bold">
            {filteredBatches.reduce((total, batch) => total + Number(batch.uncertified || 0), 0)} kg
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificationChart; 