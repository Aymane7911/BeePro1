import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Layers, Database, Tag, Package, RefreshCw, Menu, X, Home, Settings, Users, Activity, HelpCircle, Wallet, PlusCircle, MapPin, CheckCircle, Trash2, Globe, FileText, AlertCircle, Sparkles, LogOut, Plus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';



interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ sidebarOpen, toggleSidebar }: SidebarProps) => (
  <div className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-500 ease-in-out z-20 ${sidebarOpen ? 'w-72' : 'w-0'} overflow-hidden shadow-2xl`}>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
    <div className="relative z-10">
      <div className="p-6 flex justify-between items-center border-b border-gray-700/50">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">Navigation</h2>
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-300">
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-8 px-4">
        <ul className="space-y-3">
          {[
            { icon: Home, label: 'Dashboard', href: '/dashboard' },
            { icon: Layers, label: 'Batches', href: '/batches' },
            { icon: Activity, label: 'Analytics', href: '#' },
            { icon: Wallet, label: 'Token Wallet', href: '#' },
            { icon: Users, label: 'Profile', href: '/profile' },
            { icon: Settings, label: 'Settings', href: '#' },
            { icon: HelpCircle, label: 'Help', href: '#' }
          ].map((item, index) => (
            <li key={index}>
              <a href={item.href} className="group flex items-center px-4 py-4 rounded-xl hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-amber-500/20 transition-all duration-300 transform hover:translate-x-2">
                <item.icon className="h-6 w-6 mr-4 transition-all duration-300 group-hover:text-yellow-400 group-hover:scale-110" />
                <span className="font-medium group-hover:text-yellow-300 transition-colors duration-300">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </div>
);

export default Sidebar; 