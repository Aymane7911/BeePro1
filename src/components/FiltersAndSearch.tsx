import React from 'react';
import { Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';

// Define a type for sortable keys to ensure type safety
export type SortableKey = 'createdAt' | 'batchNumber' | 'totalKg' | 'name' | 'status';

interface FiltersAndSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  sortBy: SortableKey
  setSortBy: (value: SortableKey) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
}

const FiltersAndSearch: React.FC<FiltersAndSearchProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  // Define sort options with proper typing
  const sortOptions: { value: SortableKey; label: string }[] = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'batchNumber', label: 'Batch Number' },
    { value: 'totalKg', label: 'Total Kilograms' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center">
          <div className="relative mr-4 w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortableKey)}
            className="border border-gray-300 rounded-md px-2 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            {sortOrder === 'asc' ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersAndSearch;