'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistrationSelection() {
  const [selectedType, setSelectedType] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const handleSelection = (type: any) => {
    setSelectedType(type);
    setIsAnimating(true);
    
    // Add a small delay for animation effect
    setTimeout(() => {
      if (type === 'beekeeper') {
        router.push('/register');
      } else if (type === 'company') {
        router.push('/register-company');
      }
    }, 300);
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
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-30">
        <div className="w-full max-w-4xl">
          {/* Selection Card */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Card */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-4">
                  Choose Your Registration
                </h1>
                <p className="text-gray-600 text-lg md:text-xl">Select the type of account you want to create</p>
              </div>

              {/* Selection Options */}
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Beekeeper Option */}
                <div 
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    selectedType === 'beekeeper' ? 'scale-105' : 'hover:scale-105'
                  } ${isAnimating && selectedType === 'beekeeper' ? 'animate-pulse' : ''}`}
                  onClick={() => handleSelection('beekeeper')}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-white/50 hover:border-yellow-300 transition-all duration-300 shadow-xl group-hover:shadow-2xl h-full">
                    {/* Icon */}
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-4xl">🐝</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Beekeeper</h3>
                      <p className="text-gray-600">Individual honey producers and small apiaries</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {[
                        'Individual certification',
                        'Small batch verification',
                        'Personal branding',
                        'Direct-to-consumer sales',
                        'Artisan honey certification'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Button */}
                    <div className="relative group/btn">
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl blur opacity-70 group-hover/btn:opacity-100 transition duration-300"></div>
                      <div className="relative bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl">
                        <span>Register as Beekeeper</span>
                        <svg className="h-5 w-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Option */}
                <div 
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    selectedType === 'company' ? 'scale-105' : 'hover:scale-105'
                  } ${isAnimating && selectedType === 'company' ? 'animate-pulse' : ''}`}
                  onClick={() => handleSelection('company')}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-white/50 hover:border-amber-300 transition-all duration-300 shadow-xl group-hover:shadow-2xl h-full">
                    {/* Icon */}
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-4xl">🏢</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Company</h3>
                      <p className="text-gray-600">Commercial honey producers and distributors</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {[
                        'Bulk certification',
                        'Enterprise verification',
                        'Multi-location support',
                        'Wholesale distribution',
                        'Commercial brand protection'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Button */}
                    <div className="relative group/btn">
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur opacity-70 group-hover/btn:opacity-100 transition duration-300"></div>
                      <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl">
                        <span>Register as Company</span>
                        <svg className="h-5 w-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Login */}
              <div className="text-center pt-8 border-t border-gray-200 mt-8">
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

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </section>
  );
}