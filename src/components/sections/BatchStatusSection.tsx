// src/components/BatchStatusSection.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  X, Package, MapPin, Trash2, CheckCircle, AlertCircle, Star, 
  Globe, PlusCircle, LogOut, Sparkles, Home, Layers, Activity, 
  Wallet, Users, Settings, HelpCircle, FileText 
} from 'lucide-react';

interface Batch {
  id: string;
  name: string;
  status: string;
  completedChecks: number;
  totalChecks: number;
  originOnly: number;
  qualityOnly: number;
  uncertified: number;
  jarsUsed: number;
  containerType: string;
  labelType: string;
  totalKg?: number;
  certificationDate?: string;
}

interface InventoryItem {
  batchName: string;
  batchId: string;
  category: string;
  weight: number;
  jars: number;
  containerType: string;
  labelType: string;
  stockLevel: string;
  location: string;
  lastUpdated: string;
}

interface BatchStatusSectionProps {
  filteredBatches: Batch[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showAllBatches: boolean;
  setShowAllBatches: (show: boolean) => void;
  expandedBatches: string[];
  toggleBatchExpansion: (id: string) => void;
  selectedItem: InventoryItem | null;
  setSelectedItem: (item: InventoryItem | null) => void;
}

const BatchStatusSection = ({
  filteredBatches,
  searchTerm,
  setSearchTerm,
  showAllBatches,
  setShowAllBatches,
  expandedBatches,
  toggleBatchExpansion,
  selectedItem,
  setSelectedItem
}: BatchStatusSectionProps) => {
  const displayedBatches = showAllBatches 
    ? filteredBatches 
    : filteredBatches.slice(0, 3);

  return (
    <div className="bg-white p-4 rounded-lg shadow text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Batch Certification Status</h2>
        <div className="flex items-center">
          <div className="relative mr-2">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search batches..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full" 
            />
          </div>
          <button 
            onClick={() => setShowAllBatches(!showAllBatches)} 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showAllBatches ? 'Show Less' : `Show All (${filteredBatches.length})`}
          </button>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Inventory Details</h3>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Batch Name</p>
                  <p className="font-medium">{selectedItem.batchName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{selectedItem.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jars</p>
                  <p className="font-medium">{selectedItem.jars}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Container Type</p>
                  <p className="font-medium">{selectedItem.containerType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Label Type</p>
                  <p className="font-medium">{selectedItem.labelType}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Stock Level</span>
                  <span className="text-sm font-medium">
                    {selectedItem.stockLevel || "In Stock"}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Location</span>
                  <span className="text-sm font-medium">
                    {selectedItem.location || "Warehouse A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium">
                    {selectedItem.lastUpdated || new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedItem(null);
                }}
                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
              >
                View in Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {displayedBatches.length > 0 ? (
          displayedBatches.map((batch) => {
            const total = batch.originOnly + batch.qualityOnly + batch.uncertified;
            const originOnlyPercent = total > 0 ? Math.round((batch.originOnly / total) * 100) : 0;
            const qualityOnlyPercent = total > 0 ? Math.round((batch.qualityOnly / total) * 100) : 0;
            const uncertifiedPercent = total > 0 ? Math.round((batch.uncertified / total) * 100) : 0;
            
            const totalJars = batch.jarsUsed || 0;
            const originOnlyJars = total > 0 ? Math.round(batch.originOnly * totalJars / total) : 0;
            const qualityOnlyJars = total > 0 ? Math.round(batch.qualityOnly * totalJars / total) : 0;
            const uncertifiedJars = total > 0 ? Math.round(batch.uncertified * totalJars / total) : 0;
            
            const certificationData = [
              {
                color: "bg-blue-500",
                label: "Origin Certified",
                value: batch.originOnly,
                percent: originOnlyPercent,
                jars: originOnlyJars
              },
              {
                color: "bg-green-500",
                label: "Quality Certified",
                value: batch.qualityOnly,
                percent: qualityOnlyPercent,
                jars: qualityOnlyJars
              },
              {
                color: "bg-gray-400",
                label: "Uncertified",
                value: batch.uncertified,
                percent: uncertifiedPercent,
                jars: uncertifiedJars
              },
            ];
            
            const pieData = [
              { name: 'Origin Certified', value: batch.originOnly, color: '#3B82F6' },
              { name: 'Quality Certified', value: batch.qualityOnly, color: '#10B981' },
              { name: 'Uncertified', value: batch.uncertified, color: '#9CA3AF' }
            ];

            return (
              <div key={batch.id} className="border rounded-lg bg-gray-50 overflow-hidden">
                <div 
                  className="p-3 bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleBatchExpansion(batch.id)}
                >
                  <div className="flex items-center">
                    <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                      batch.status === "Closed" || 
                      (batch.status === "Certified" || batch.status === "Rejected") && batch.completedChecks === batch.totalChecks 
                        ? "bg-green-500" : "bg-yellow-500"
                    }`}></span>
                    <span className="font-medium">{batch.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-3">
                      {batch.status === "Certified" || batch.status === "Rejected" || batch.status === "In Progress" ? 
                        (batch.completedChecks === batch.totalChecks ? "Closed" : "Pending") : 
                        batch.status}
                    </span>
                    <svg 
                      className={`w-4 h-4 transform transition-transform ${expandedBatches.includes(batch.id) ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedBatches.includes(batch.id) && (
                  <div className="p-4 border-t">
                    <div className="flex justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Batch ID</p>
                        <p className="font-medium">{batch.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Certification Date</p>
                        <p className="font-medium">{batch.certificationDate || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Expiry Date</p>
                        <p className="font-medium">{"-"}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Certification Progress</span>
                        <span className="text-sm font-medium">{batch.completedChecks}/{batch.totalChecks} Checks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            batch.completedChecks === batch.totalChecks ? "bg-green-500" : "bg-yellow-500"
                          }`}
                          style={{ width: `${(batch.completedChecks / batch.totalChecks) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <div className="text-center mb-2">
                          <h3 className="text-md font-semibold">Total Kilograms: {batch.totalKg || 0}</h3>
                          <p className="text-xs text-gray-500">Jars used: {batch.jarsUsed || 0}</p>
                        </div>
                        <div className="h-48 flex items-center justify-center">
                          <div className="relative w-40 h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={60}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} kg`, 'Weight']} />
                              </PieChart>
                            </ResponsiveContainer>
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-sm font-medium">{batch.totalKg || 0} kg</span>
                              <span className="text-xs text-gray-500">{batch.jarsUsed || 0} jars</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="text-md font-semibold mb-3">Certification Progress</h3>
                        <div className="flex flex-wrap justify-between mb-4">
                          {certificationData.map((item, index) => (
                            <div 
                              key={index} 
                              className="p-3 bg-white rounded-lg shadow mb-2 w-full md:w-5/12 cursor-pointer transform transition-transform hover:scale-105 hover:shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem({
                                  batchName: batch.name,
                                  batchId: batch.id,
                                  category: item.label,
                                  weight: item.value,
                                  jars: item.jars,
                                  containerType: batch.containerType,
                                  labelType: batch.labelType,
                                  stockLevel: "In Stock",
                                  location: item.label === "Uncertified" ? "Pending Area" : "Certified Storage",
                                  lastUpdated: new Date().toLocaleDateString()
                                });
                              }}
                            >
                              <div className="flex items-center mb-1">
                                <div className={`h-3 w-3 rounded-full ${item.color} mr-2`}></div>
                                <p className="text-sm font-medium">{item.label}</p>
                              </div>
                              <p className="text-xl font-bold">{item.value} kg</p>
                              <p className="text-xs text-gray-500">
                                {item.jars} jars {item.percent > 0 ? `· ${item.percent}% of batch` : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 mr-2">
                        View Full Details
                      </button>
                      {batch.status === "Pending" && (
                        <button className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700">
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            No batches match your search criteria
          </div>
        )}
      </div>

      {filteredBatches.length > 3 && !showAllBatches && (
        <div className="mt-3 text-center">
          <button 
            onClick={() => setShowAllBatches(true)}
            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
          >
            + Show {filteredBatches.length - 3} more batches
          </button>
        </div>
      )}
    </div>
  );
};

export default BatchStatusSection;