'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
    department: 'operations',
    useEmail: true,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData(prev => ({ ...prev, useEmail: !prev.useEmail }));
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (!formData.adminCode) {
      setError('Admin authorization code is required');
      setIsLoading(false);
      return;
    }

    const { firstname, lastname, email, phonenumber, password, adminCode, department, useEmail } = formData;

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname,
          lastname,
          password,
          adminCode,
          department,
          role: 'admin',
          ...(useEmail ? { email } : { phonenumber }),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        console.log('Admin registration successful:', data);
        router.push('/admin/dashboard');
      } else {
        setError(data?.error || data?.message || 'Admin registration failed. Please try again.');
        console.error('Admin registration failed:', data);
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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900">
        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-16 h-16 bg-blue-400/20 transform rotate-45 animate-pulse"></div>
          <div className="absolute top-32 right-20 w-12 h-12 bg-indigo-300/30 transform rotate-12 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-slate-300/15 transform -rotate-45 animate-pulse delay-300"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-blue-300/25 transform rotate-30 animate-bounce delay-700"></div>
          <div className="absolute bottom-1/3 right-10 w-14 h-14 bg-indigo-400/20 transform rotate-60 animate-pulse delay-500"></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5"></div>
      </div>

      {/* Circuit Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <pattern id="circuit" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
              <rect width="25" height="25" fill="none"/>
              <circle cx="5" cy="5" r="1" fill="currentColor"/>
              <circle cx="20" cy="5" r="1" fill="currentColor"/>
              <circle cx="5" cy="20" r="1" fill="currentColor"/>
              <circle cx="20" cy="20" r="1" fill="currentColor"/>
              <path d="M5,5 L20,5 M5,20 L20,20 M5,5 L5,20 M20,5 L20,20" stroke="currentColor" strokeWidth="0.5" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" className="text-blue-200"/>
        </svg>
      </div>

      {/* Logo - Clickable */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 animate-fade-in">
        <div 
          className="relative cursor-pointer transition-transform hover:scale-105"
          onClick={() => router.push('/')}
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-xl"></div>
          <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Portal</h1>
                <p className="text-xs text-gray-200">System Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-32 pb-8">
        <div className="w-full max-w-lg">
          {/* Register Card */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Card */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Admin Registration
                </h1>
                <p className="text-gray-600 text-lg">Create administrator account</p>
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
                {/* Admin Authorization Code */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 01-2 2m0 0a2 2 0 010 4h4a2 2 0 010-4zM9 7H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="adminCode"
                    placeholder="Admin Authorization Code"
                    value={formData.adminCode}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                </div>

                {/* Name Fields Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Department Selection */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 appearance-none"
                  >
                    <option value="operations">Operations</option>
                    <option value="quality_control">Quality Control</option>
                    <option value="certification">Certification</option>
                    <option value="system_admin">System Administration</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </div>

                {/* Email or Phone Input */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {formData.useEmail ? (
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    )}
                  </div>
                  {formData.useEmail ? (
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your official email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                  ) : (
                    <input
                      type="text"
                      name="phonenumber"
                      placeholder="Enter your phone number"
                      value={formData.phonenumber}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                  )}
                </div>

                {/* Toggle Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
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
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter secure password (min 8 chars)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-blue-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-blue-700 text-sm font-medium">Security Notice</p>
                      <p className="text-blue-600 text-xs mt-1">Admin accounts have elevated privileges. Contact your system administrator for the authorization code.</p>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="relative w-full group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 rounded-xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Creating Admin Account...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Create Admin Account</span>
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
                    Already have an admin account?{' '}
                    <a 
                      href="/admin/login" 
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all duration-300"
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
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}