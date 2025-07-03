import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Layers, Database, Tag, Package, RefreshCw, Menu, X, Home, Settings, Users, Activity, HelpCircle, Wallet, PlusCircle, MapPin, CheckCircle, Trash2, Globe, FileText, AlertCircle, Sparkles, LogOut, Plus, Star, Lock, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isPremium?: boolean;
}

const Sidebar = ({ sidebarOpen, toggleSidebar, isPremium }: SidebarProps) => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const router = useRouter();
  const handleAnalyticsClick = (e) => {
    e.preventDefault();
    if (!isPremium) {
      setShowPremiumModal(true);
    } else {
      // Navigate to analytics - user has premium access
      router.push('/analytics'); // or use your router
    }
  };
  const closePremiumModal = () => {
    setShowPremiumModal(false);
  };
  return (
    <>
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
                { icon: Home, label: 'Dashboard', href: '/dashboard', locked: false },
                { icon: Layers, label: 'Batches', href: '/batches', locked: false },
                { icon: Activity, label: 'Analytics', href: '/analytics', locked: !isPremium },
                { icon: Wallet, label: 'Token Wallet', href: '#', locked: false },
                { icon: Users, label: 'Profile', href: '/profile', locked: false },
                { icon: Settings, label: 'Settings', href: '#', locked: false },
                { icon: HelpCircle, label: 'Help', href: '#', locked: false }
              ].map((item, index) => (
                <li key={index}>
                  {item.locked ? (
                    <button 
                      onClick={handleAnalyticsClick}
                      className="group flex items-center justify-between w-full px-4 py-4 rounded-xl hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-500/10 transition-all duration-300 cursor-pointer border border-amber-500/30"
                    >
                      <div className="flex items-center">
                        <item.icon className="h-6 w-6 mr-4 transition-all duration-300 text-amber-400" />
                        <span className="font-medium text-amber-300">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-amber-400" />
                        <Lock className="h-4 w-4 text-amber-400" />
                      </div>
                    </button>
                  ) : (
                    <a href={item.href} className="group flex items-center px-4 py-4 rounded-xl hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-amber-500/20 transition-all duration-300 transform hover:translate-x-2">
                      <item.icon className="h-6 w-6 mr-4 transition-all duration-300 group-hover:text-yellow-400 group-hover:scale-110" />
                      <span className="font-medium group-hover:text-yellow-300 transition-colors duration-300">{item.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Premium Access Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-amber-500/30">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-3 rounded-full">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Premium Feature</h3>
              <p className="text-gray-300 mb-6">
                Analytics is a premium feature. Upgrade to unlock detailed insights and advanced analytics for your data.
              </p>
              
              <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 p-4 rounded-xl mb-6 border border-amber-500/30">
                <h4 className="text-amber-400 font-semibold mb-2">Premium Features Include:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-amber-400 mr-2" />
                    Advanced Analytics Dashboard
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-amber-400 mr-2" />
                    Real-time Data Insights
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-amber-400 mr-2" />
                    Custom Reports & Exports
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 text-amber-400 mr-2" />
                    Priority Support
                  </li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={closePremiumModal}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-300"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    // Handle premium upgrade logic here
                    router.push('/premium');
                    closePremiumModal();
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl transition-all duration-300 font-semibold"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;