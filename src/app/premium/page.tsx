'use client'

import { useEffect, useState } from 'react';
import { Check, X, Crown, AlertCircle, Zap, Bot, FileText, BarChart, Shield, ArrowRight, ChevronLeft, Menu, Package, Database, Home, Settings, Users, Activity, HelpCircle, Wallet, CreditCard, Lock } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useSession } from 'next-auth/react';


interface User {
  passportId?: string;
  passportFile?: string;
  // Add other user properties as needed
  id?: string;
  name?: string;
  email?: string;
  isProfileComplete: boolean;
  isPremium: boolean;
}


export default function Premium() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [user, setUser] = useState<User | null>(null);
  const [isPremiumActive, setIsPremiumActive] = useState(false); // Added this missing state
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    billingAddress: {
      line1: '',
      city: '',
      postalCode: '',
      country: 'US'
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    if (plan === 'premium') {
      setShowPaymentModal(true);
    } else {
      setShowModal(true);
    }
  };

  const handlePaymentInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPaymentForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPaymentForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      handlePaymentInputChange('cardNumber', formatted);
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      handlePaymentInputChange('expiryDate', formatted);
    }
  };


  function getAuthToken() {
  // Try localStorage first
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken') || 
                 localStorage.getItem('token') || 
                 localStorage.getItem('jwt');
    if (token) return token;
    
    // Try cookies as fallback
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token' || name === 'authToken' || name === 'jwt') {
        return value;
      }
    }
  }
  return null;
}

  const handlePaymentSubmit = async (e) => {
  e.preventDefault();
  setPaymentProcessing(true);
  
  try {
    // Get authentication token
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update premium status in database
    const response = await fetch('/api/user/premium', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include token in Authorization header
      },
      body: JSON.stringify({ isPremium: true }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update premium status');
    }

    const data = await response.json();
    
    // Update local state with database response
    setUser(data.user);
    setIsPremiumActive(true);
    
    setPaymentProcessing(false);
    setShowPaymentModal(false);
    setNotification({
      show: true,
      message: 'Payment successful! You now have access to Premium features. Welcome to HoneyCertify Premium!'
    });
    
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 5000);
    
  } catch (error) {
    console.error('Payment processing error:', error);
    setPaymentProcessing(false);
    setNotification({
      show: true,
      message: `Payment failed: ${error.message}. Please try again or contact support.`
    });
    
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 5000);
  }
};

useEffect(() => {
  // This will trigger a re-render of the sidebar when premium status changes
  if (user?.isPremium && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('premiumStatusChanged'));
  }
}, [user?.isPremium]);

  const handleFreePlanConfirm = () => {
    setShowModal(false);
    setNotification({
      show: true,
      message: 'You are continuing with the Free plan. You can upgrade anytime!'
    });
    
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 5000);
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Basic tools for honey certification',
      features: [
        'Standard certification tracking',
        'Up to 5 batches per month',
        'Basic analytics',
        'Single user access',
        'Manual data entry'
      ],
      nonFeatures: [
        'AI-powered report analysis',
        'Unlimited batches',
        'Advanced analytics',
        'Multi-user access',
        'Priority support'
      ]
    },
    {
      name: 'Premium',
      price: '$49.99',
      period: 'per month',
      description: 'Advanced tools with AI-powered analytics',
      popular: true,
      features: [
        'All Free features',
        'AI-powered report analysis',
        'Unlimited batches',
        'Advanced analytics and forecasting',
        'Multi-user access (up to 5 users)',
        'Priority support',
        'Custom label integration',
        'Automated quality alerts'
      ]
    }
  ];
  useEffect(() => {
   const fetchUserPremiumStatus = async () => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      console.log('No authentication token found');
      return;
    }
    
    const response = await fetch('/api/user/premium', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      setIsPremiumActive(data.user.isPremium);
    } else {
      console.error('Failed to fetch premium status:', await response.json());
    }
  } catch (error) {
    console.error('Error fetching user premium status:', error);
  }
};

    fetchUserPremiumStatus();
  }, [session]);

if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
 if (user?.isPremium) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-yellow-200 to-white text-black">
        {/* Existing header and sidebar code */}
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-6">
              <Crown className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">You're Already Premium!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Thanks for being a Premium subscriber. You have access to all our advanced features.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-yellow-200 to-white text-black">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ease-in-out z-20 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={toggleSidebar} className="p-1 hover:bg-gray-700 rounded">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-700">
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-700">
                <Package className="h-5 w-5 mr-3" />
                Inventory
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-700">
                <Database className="h-5 w-5 mr-3" />
                Batches
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 bg-yellow-500 text-white">
                <Crown className="h-5 w-5 mr-3" />
                Premium
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-700">
                <Activity className="h-5 w-5 mr-3" />
                Analytics
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-700">
                <Wallet className="h-5 w-5 mr-3" />
                Token Wallet
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-700">
                <Users className="h-5 w-5 mr-3" />
                Profile
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-700">
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-4 py-3 hover:bg-gray-700">
                <HelpCircle className="h-5 w-5 mr-3" />
                Help
              </a>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Backdrop overlay when sidebar is open */}
      <Sidebar 
      sidebarOpen={sidebarOpen} 
      toggleSidebar={toggleSidebar} 
      userPremiumStatus={user?.isPremium || isPremiumActive} />

      <header className="bg-white p-4 rounded-lg shadow text-black sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="mr-4 p-1 rounded hover:bg-gray-100 md:mr-6"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="mr-3 bg-yellow-500 p-2 rounded">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM6 14C5.45 14 5 13.55 5 13C5 12.45 5.45 12 6 12C6.55 12 7 12.45 7 13C7 13.55 6.55 14 6 14ZM9 9C8.45 9 8 8.55 8 8C8 7.45 8.45 7 9 7C9.55 7 10 7.45 10 8C10 8.55 9.55 9 9 9ZM15 9C14.45 9 14 8.55 14 8C14 7.45 14.45 7 15 7C15.55 7 16 7.45 16 8C16 8.55 15.55 9 15 9ZM18 14C17.45 14 17 13.55 17 13C17 12.45 17.45 12 18 12C18.55 12 19 12.45 19 13C19 13.55 18.55 14 18 14Z" fill="white"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">HoneyCertify</h1>
            </div>
          </div>
          <div className="flex items-center">
            <button 
            onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center"> 
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-yellow-100 rounded-full mb-4">
            <Crown className="h-6 w-6 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Upgrade to Premium</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock advanced AI-powered tools to analyze your production and enhance your honey certification process
          </p>
        </div>

        {/* Premium Feature Showcase */}
        <div className="bg-yellow-50 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Go Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Report Analysis</h3>
              <p className="text-gray-600">
                Our advanced AI can analyze your lab reports and production data to automatically extract key metrics and certification requirements.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Documentation</h3>
              <p className="text-gray-600">
                Generate certification documentation automatically based on your production data and quality standards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Gain deeper insights into your honey production quality trends and certification rates over time.
              </p>
            </div>
          </div>
        </div>

        {/* Plans Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`bg-white rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 ${plan.popular ? 'border-2 border-yellow-500 relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-white px-4 py-1 uppercase text-xs font-bold tracking-wider">
                  Recommended
                </div>
              )}
              <div className={`p-8 ${plan.popular ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : ''}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-end mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="ml-1 text-sm opacity-80">{plan.period}</span>}
                </div>
                <p className={`text-sm ${plan.popular ? 'text-white opacity-90' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>
              <div className="p-8">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.nonFeatures && plan.nonFeatures.map((feature, index) => (
                    <li key={`non-${index}`} className="flex items-start text-gray-400">
                      <X className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanSelect(plan.name.toLowerCase())}
                  className={`w-full py-3 rounded-lg font-bold transition flex items-center justify-center
                    ${plan.popular 
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                >
                  {plan.popular ? (
                    <>
                      Select Premium <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    'Continue with Free'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* AI Feature Spotlight */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">AI-Powered Report Analysis</h2>
              <p className="mb-6">
                Our premium feature uses advanced AI to extract critical information from your production reports and lab test results automatically.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-yellow-300 mr-2 mt-0.5" />
                  <span>Automatic extraction of quality metrics</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-yellow-300 mr-2 mt-0.5" />
                  <span>Identify certification eligibility instantly</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-yellow-300 mr-2 mt-0.5" />
                  <span>Highlight critical quality issues</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-yellow-300 mr-2 mt-0.5" />
                  <span>Process multiple reports simultaneously</span>
                </li>
              </ul>
              <button 
                onClick={() => handlePlanSelect('premium')}
                className="bg-white text-blue-600 hover:bg-gray-100 py-3 px-6 rounded-lg font-bold transition flex items-center"
              >
                Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Lab Report Analysis</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  AI Processed
                </span>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Moisture Content</span>
                    <span className="font-medium">17.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">✓ Within certification range (16-18%)</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">HMF Level</span>
                    <span className="font-medium">12.5 mg/kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">✓ Below maximum limit (40 mg/kg)</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Pollen Analysis</span>
                    <span className="font-medium">98.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">✓ Origin verified (Acacia)</p>
                </div>
                
                <div className="flex justify-between text-sm font-medium">
                  <span>Certification Eligibility:</span>
                  <span className="text-green-600">Fully Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQs */}
        <div className="bg-white rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">What kind of reports can the AI analyze?</h3>
              <p className="text-gray-600">
                Our AI can analyze standard laboratory reports for honey quality including moisture content, HMF levels, diastase activity, pollen analysis, and more. It also processes production data to help with batch certification.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">How accurate is the AI analysis?</h3>
              <p className="text-gray-600">
                Our AI has been trained on thousands of honey quality reports and achieves accuracy rates of over 95% for standard metrics. All critical decisions still receive human verification as part of our quality assurance process.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I cancel my Premium subscription?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your Premium subscription at any time. Your benefits will continue until the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Do I need special training to use the Premium features?</h3>
              <p className="text-gray-600">
                No special training is required. Our Premium features are designed to be intuitive and easy to use. We also provide comprehensive documentation and support to help you make the most of your subscription.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Stripe Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Complete Your Purchase</h3>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="flex justify-between items-center">
                  <span>HoneyCertify Premium (Monthly)</span>
                  <span className="font-bold">$49.99</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Billed monthly, cancel anytime
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                
                {/* Card Information */}
                <div>
                  <label className="block text-sm font-medium mb-1">Card Information</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={paymentForm.cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 pr-12"
                        placeholder="1234 1234 1234 1234"
                        required
                      />
                      <div className="absolute right-3 top-2">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={paymentForm.expiryDate}
                        onChange={handleExpiryChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="MM/YY"
                        required
                      />
                      <input
                        type="text"
                        value={paymentForm.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 4) {
                            handlePaymentInputChange('cvv', value);
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="CVC"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={paymentForm.cardholderName}
                    onChange={(e) => handlePaymentInputChange('cardholderName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Full name on card"
                    required
                  />
                </div>

                {/* Billing Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">Billing Address</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={paymentForm.billingAddress.line1}
                      onChange={(e) => handlePaymentInputChange('billingAddress.line1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Address line 1"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={paymentForm.billingAddress.city}
                        onChange={(e) => handlePaymentInputChange('billingAddress.city', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="City"
                        required
                      />
                      <input
                        type="text"
                        value={paymentForm.billingAddress.postalCode}
                        onChange={(e) => handlePaymentInputChange('billingAddress.postalCode', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="ZIP"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-start">
                  <Lock className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    Your payment information is encrypted and secure
                    </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold transition flex items-center justify-center"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Subscribe for $49.99/month
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By subscribing, you agree to our Terms of Service and Privacy Policy. 
                  You can cancel anytime from your account settings.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Free Plan Confirmation Modal */}
      {showModal && selectedPlan === 'free' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Continue with Free Plan</h3>
              <p className="text-gray-600 mb-6">
                You'll continue using HoneyCertify with basic features. You can upgrade to Premium anytime to unlock AI-powered analytics and advanced tools.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Go Back
                </button>
                <button
                  onClick={handleFreePlanConfirm}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Continue Free
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-40 max-w-sm">
          <div className="flex items-start">
            <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 p-6 mt-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="mr-3 bg-yellow-500 p-2 rounded">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM6 14C5.45 14 5 13.55 5 13C5 12.45 5.45 12 6 12C6.55 12 7 12.45 7 13C7 13.55 6.55 14 6 14ZM9 9C8.45 9 8 8.55 8 8C8 7.45 8.45 7 9 7C9.55 7 10 7.45 10 8C10 8.55 9.55 9 9 9ZM15 9C14.45 9 14 8.55 14 8C14 7.45 14.45 7 15 7C15.55 7 16 7.45 16 8C16 8.55 15.55 9 15 9ZM18 14C17.45 14 17 13.55 17 13C17 12.45 17.45 12 18 12C18.55 12 19 12.45 19 13C19 13.55 18.55 14 18 14Z" fill="white"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">HoneyCertify</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Professional honey certification and quality management platform for beekeepers and honey producers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-yellow-600">Features</a></li>
                <li><a href="#" className="hover:text-yellow-600">Pricing</a></li>
                <li><a href="#" className="hover:text-yellow-600">API</a></li>
                <li><a href="#" className="hover:text-yellow-600">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-yellow-600">Help Center</a></li>
                <li><a href="#" className="hover:text-yellow-600">Documentation</a></li>
                <li><a href="#" className="hover:text-yellow-600">Contact Us</a></li>
                <li><a href="#" className="hover:text-yellow-600">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-yellow-600">About</a></li>
                <li><a href="#" className="hover:text-yellow-600">Blog</a></li>
                <li><a href="#" className="hover:text-yellow-600">Careers</a></li>
                <li><a href="#" className="hover:text-yellow-600">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2024 HoneyCertify. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-yellow-600">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-600">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-600">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


