'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useTenant } from '@/lib/hooks/useTenant';

interface TenantContextType {
  tenant: {
    id: string;
    subdomain: string;
    companyName: string;
  } | null;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenant, loading } = useTenant();
  
  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
}

// app/layout.tsx - Root layout with tenant provider
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TenantProvider>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}