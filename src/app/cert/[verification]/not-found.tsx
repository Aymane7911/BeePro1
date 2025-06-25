// app/cert/[verification]/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Certification Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The verification code you provided is invalid or the certificate may have been revoked. 
            Please check the code and try again.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-md transition duration-200"
            >
              Go Back
            </button>
            
            <Link
              href="/"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-md transition duration-200"
            >
              Return to Home
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>Need help verifying your certificate?</p>
            <p className="mt-1">Contact support for assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}