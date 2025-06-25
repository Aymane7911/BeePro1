import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Layers, Database, Tag, Package, RefreshCw, Menu, X, Home, Settings, Users, Activity, HelpCircle, Wallet, PlusCircle, MapPin, CheckCircle, Trash2, Globe, FileText, AlertCircle, Sparkles, LogOut, Plus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';



interface BackdropProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Backdrop = ({ sidebarOpen, toggleSidebar }: BackdropProps) => (
  sidebarOpen && (
    <div 
      className="fixed inset-0 backdrop-blur-md bg-black/30 z-10 transition-all duration-500"
      onClick={toggleSidebar}
    ></div>
  )
);

export default Backdrop; 