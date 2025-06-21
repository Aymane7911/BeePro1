import { CheckCircle, Calendar, Package, User, MapPin } from 'lucide-react';

interface Certification {
  id: string;
  batchIds: string[];
  certificationDate: string;
  totalCertified: string;
  certificationType: string;
  expiryDate: string;
  verification: string;
  totalJars: number;
  jars: Array<{
    id: string;
    size: number;
    quantity: number;
    type: string;
  }>;
  certifications: Record<string, any>;
  beekeeper: string;
  beekeeperId: string;
  createdAt: string;
}

interface CertificationViewerProps {
  certification: Certification;
}

export default function CertificationViewer({ certification }: CertificationViewerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-amber-100 rounded-full mb-4">
            <Package className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Honey Certification</h1>
          <p className="text-gray-600">Electronic Certificate of Authenticity</p>
        </div>

        {/* Verification Status */}
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <span className="text-green-800 font-semibold text-lg">Verified Authentic</span>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Certification Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Verification Code:</label>
                  <p className="font-mono text-sm bg-yellow-100 px-2 py-1 rounded mt-1 break-all">
                    {certification.verification}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Batch IDs:</label>
                  <p className="text-sm">{certification.batchIds.join(', ')}</p>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Certification Date:</label>
                    <p className="text-sm">{new Date(certification.certificationDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Expiry Date:</label>
                    <p className="text-sm">{new Date(certification.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Producer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Beekeeper:</label>
                    <p className="text-sm font-semibold">{certification.beekeeper}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Honey Certified:</label>
                  <p className="text-2xl font-bold text-amber-700">{certification.totalCertified} kg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Jars:</label>
                  <p className="text-xl font-semibold text-gray-800">{certification.totalJars}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Certification Type:</label>
                  <p className="text-sm font-medium text-blue-600">{certification.certificationType}</p>
                </div>
              </div>
            </div>

            {/* Jar Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Jar Breakdown</h3>
              <div className="space-y-2">
                {certification.jars.map((jar, index) => (
                  <div key={jar.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-sm font-medium">{jar.size}g {jar.type}</span>
                    <span className="text-sm text-gray-600">{jar.quantity} jars</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-center">
          <p className="text-xs text-gray-500">
            This certificate was issued on {new Date(certification.createdAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Scan the QR code or visit this page to verify authenticity
          </p>
        </div>
      </div>
    </div>
  );
}
