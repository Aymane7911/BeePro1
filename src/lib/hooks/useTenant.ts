'use client';

import { useEffect, useState } from 'react';

interface TenantInfo {
  id: string;
  subdomain: string;
  companyName: string;
}

export function useTenant() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get tenant info from the current domain
    const host = window.location.host;
    const subdomain = host.split('.')[0];
    
    // You might want to fetch additional tenant info from an API
    setTenant({
      id: 'tenant_123', // This would come from your API
      subdomain,
      companyName: 'Example Company' // This would come from your API
    });
    
    setLoading(false);
  }, []);
  
  return { tenant, loading };
}
