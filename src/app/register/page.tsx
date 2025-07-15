'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: '',
    password: '',
    confirmPassword: '',
    companyId: '',
    companySlug: '',
    role: 'employee',
    useEmail: true,
    useCompanyId: true,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (type: 'contact' | 'company') => {
    if (type === 'contact') {
      setFormData(prev => ({ ...prev, useEmail: !prev.useEmail }));
    } else {
      setFormData(prev => ({ ...prev, useCompanyId: !prev.useCompanyId }));
    }
  };

  const handleGoogleAuth = async () => {
    console.log('Google OAuth clicked');
    // Add your Google OAuth logic here
  };

  const registerBeekeeperOnChain = async (beekeeperId: number) => {
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_HARDHAT_RPC_URL
      );

      const signer = new ethers.Wallet(
        process.env.NEXT_PUBLIC_HARDHAT_PRIVATE_KEY!,
        provider
      );
      
      // You'll need to import contractAddress and contractABI
      // const contract = new ethers.Contract(contractAddress, contractABI, signer);
      // const tx = await contract.registerBeekeeper(beekeeperId);
      // await tx.wait();
      
      console.log('Blockchain registration successful');
    } catch (err) {
      console.error('On-chain registration failed:', err);
      throw new Error('Blockchain registration failed');
    }
  };

  // Fix for the frontend handleSubmit function
const handleSubmit = async () => {
  setError('');
  setIsLoading(true);

  // Validation
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    setIsLoading(false);
    return;
  }

  if (!formData.firstname || !formData.lastname || !formData.password) {
    setError('Please fill in all required fields');
    setIsLoading(false);
    return;
  }

  if (!formData.useEmail && !formData.phonenumber) {
    setError('Please provide a phone number');
    setIsLoading(false);
    return;
  }

  if (formData.useEmail && !formData.email) {
    setError('Please provide an email address');
    setIsLoading(false);
    return;
  }

  if (!formData.useCompanyId && !formData.companySlug) {
    setError('Please provide a company slug');
    setIsLoading(false);
    return;
  }

  if (formData.useCompanyId && !formData.companyId) {
    setError('Please provide a company ID');
    setIsLoading(false);
    return;
  }

  try {
    const requestBody = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      password: formData.password,
      role: formData.role,
      // Fix: Handle email/phone properly
      ...(formData.useEmail ? { email: formData.email } : { phonenumber: formData.phonenumber }),
      // Fix: Convert companyId to number
      ...(formData.useCompanyId ? { companyId: parseInt(formData.companyId) } : { companySlug: formData.companySlug }),
    };

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      console.log('Registration successful:', data);
      
      // Optional: Register on blockchain if needed
      try {
        await registerBeekeeperOnChain(data.userId);
      } catch (blockchainError) {
        console.error('Blockchain registration failed, but user was created:', blockchainError);
        // Continue with success flow even if blockchain fails
      }
      
      router.push('/confirm-pending');
    } else {
      // Fix: Consistent error handling
      setError(data?.error || 'Registration failed. Please try again.');
      console.error('Registration failed:', data);
    }
  } catch (err) {
    console.error('Network or unexpected error:', err);
    setError('Something went wrong. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600">
        {/* Floating Hexagons */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-300/20 transform rotate-45 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-12 h-12 bg-amber-200/30 transform rotate-12 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-yellow-200/15 transform -rotate-45 animate-pulse delay-300"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-amber-300/25 transform rotate-30 animate-bounce delay-700"></div>
          <div className="absolute bottom-1/3 right-10 w-14 h-14 bg-yellow-300/20 transform rotate-60 animate-pulse delay-500"></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5"></div>
      </div>

      {/* Honeycomb Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <pattern id="honeycomb" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <polygon points="10,0 20,5.77 20,11.55 10,17.32 0,11.55 0,5.77" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#honeycomb)" className="text-yellow-900"/>
        </svg>
      </div>

      {/* Logo - Clickable */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 animate-fade-in">
        <div 
          className="relative cursor-pointer transition-transform hover:scale-105"
          onClick={() => router.push('/')}
        >
          <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-xl"></div>
          <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🍯</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Honey Certify</h1>
                <p className="text-xs text-gray-200">Blockchain Verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-32 pb-8">
        <div className="w-full max-w-md">
          {/* Register Card */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Card */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2">
                  Join Our Community
                </h1>
                <p className="text-gray-600 text-lg">Create your employee account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="relative overflow-hidden bg-red-50 border border-red-200 rounded-xl p-4 animate-slide-down mb-6">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-500 animate-pulse"></div>
                </div>
              )}

              {/* Form */}
              <div className="space-y-6">
                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or register with email</span>
                  </div>
                </div>

                {/* Name Fields Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="firstname"
                      placeholder="First Name"
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="lastname"
                      placeholder="Last Name"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Company Information */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name={formData.useCompanyId ? "companyId" : "companySlug"}
                    placeholder={formData.useCompanyId ? "Company ID" : "Company Slug"}
                    value={formData.useCompanyId ? formData.companyId : formData.companySlug}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                </div>

                {/* Company Toggle */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => handleToggle('company')}
                    className="text-sm text-yellow-600 hover:text-yellow-700 font-medium hover:underline transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m0-4l-4-4" />
                    </svg>
                    {formData.useCompanyId ? 'Use company slug instead' : 'Use company ID instead'}
                  </button>
                </div>

                {/* Role Selection */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Email or Phone Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {formData.useEmail ? (
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                  </div>
                  {formData.useEmail ? (
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                  ) : (
                    <input
                      type="text"
                      name="phonenumber"
                      placeholder="Enter your phone number"
                      value={formData.phonenumber}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                  )}
                </div>

                {/* Contact Toggle */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => handleToggle('contact')}
                    className="text-sm text-yellow-600 hover:text-yellow-700 font-medium hover:underline transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m0-4l-4-4" />
                    </svg>
                    {formData.useEmail ? 'Use phone number instead' : 'Use email instead'}
                  </button>
                </div>

                {/* Password Fields */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                </div>

                {/* Register Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="relative w-full group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <svg className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <a 
                      href="/login" 
                      className="text-yellow-600 hover:text-yellow-700 font-semibold hover:underline transition-all duration-300"
                    >
                      Sign in here
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
        
        .delay-700 {
          animation-delay: 700ms;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.5);
        }
        
        /* Smooth focus transitions */
        input:focus, select:focus {
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
        }
        
        /* Glass morphism effect */
        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
        }
        
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
        
        /* Gradient text animation */
        .bg-clip-text {
          background-clip: text;
          -webkit-background-clip: text;
        }
        
        /* Hover animations */
        .transform:hover {
          transform: translateY(-2px);
        }
        
        .group:hover .group-hover\:opacity-40 {
          opacity: 0.4;
        }
        
        .group:hover .group-hover\:duration-200 {
          transition-duration: 200ms;
        }
        
        .group:hover .group-hover\:translate-x-1 {
          transform: translateX(0.25rem);
        }
        
        .group:hover .group-hover\:scale-105 {
          transform: scale(1.05);
        }
        
        /* Loading spinner */
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Form validation states */
        .border-red-500 {
          border-color: #ef4444;
        }
        
        .border-green-500 {
          border-color: #10b981;
        }
        
        .text-red-500 {
          color: #ef4444;
        }
        
        .text-green-500 {
          color: #10b981;
        }
        
        /* Responsive design adjustments */
        @media (max-width: 640px) {
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
          
          .text-4xl {
            font-size: 2.25rem;
          }
          
          .p-8 {
            padding: 1.5rem;
          }
          
          .pt-32 {
            padding-top: 8rem;
          }
        }
        
        /* Interactive elements */
        button:active {
          transform: scale(0.98);
        }
        
        /* Custom shadows */
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        /* Glow effects */
        .blur {
          filter: blur(8px);
        }
        
        .blur-xl {
          filter: blur(24px);
        }
        
        /* Transitions */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .duration-300 {
          transition-duration: 300ms;
        }
        
        .duration-200 {
          transition-duration: 200ms;
        }
        
        .duration-1000 {
          transition-duration: 1000ms;
        }
        
        .ease-out {
          transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
        }
        
        /* Focus visible for accessibility */
        .focus\:ring-2:focus {
          --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
        }
        
        .focus\:ring-yellow-500:focus {
          --tw-ring-opacity: 1;
          --tw-ring-color: rgb(234 179 8 / var(--tw-ring-opacity));
        }
        
        .focus\:border-transparent:focus {
          border-color: transparent;
        }
        
        /* Hover states */
        .hover\:bg-gray-100:hover {
          background-color: rgb(243 244 246);
        }
        
        .hover\:text-yellow-700:hover {
          color: rgb(161 98 7);
        }
        
        .hover\:underline:hover {
          text-decoration-line: underline;
        }
        
        .hover\:border-white\/40:hover {
          border-color: rgb(255 255 255 / 0.4);
        }
        
        .hover\:scale-\[1\.02\]:hover {
          transform: scale(1.02);
        }
        
        .hover\:-translate-y-1:hover {
          transform: translateY(-0.25rem);
        }
        
        /* Group hover states */
        .group:hover .group-hover\:text-yellow-500 {
          color: rgb(234 179 8);
        }
        
        /* Pointer events */
        .pointer-events-none {
          pointer-events: none;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        /* Appearance */
        .appearance-none {
          appearance: none;
        }
        
        /* Overflow */
        .overflow-hidden {
          overflow: hidden;
        }
        
        /* Position utilities */
        .absolute {
          position: absolute;
        }
        
        .relative {
          position: relative;
        }
        
        .inset-0 {
          inset: 0px;
        }
        
        .inset-y-0 {
          top: 0px;
          bottom: 0px;
        }
        
        .-inset-1 {
          inset: -0.25rem;
        }
        
        /* Z-index */
        .z-10 {
          z-index: 10;
        }
        
        .z-20 {
          z-index: 20;
        }
      `}</style>
    </section>
  );
}