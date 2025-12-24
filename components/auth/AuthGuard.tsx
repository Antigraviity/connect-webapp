"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'BUYER' | 'SELLER' | 'EMPLOYER';
  fallbackUrl?: string;
}

export default function AuthGuard({ children, requiredUserType, fallbackUrl = '/signin' }: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      console.log('❌ No user in localStorage - redirecting to signin');
      router.push(fallbackUrl);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // If a specific user type is required, validate it
      if (requiredUserType && user.userType !== requiredUserType) {
        console.log('❌ Wrong user type. Required:', requiredUserType, 'Got:', user.userType);
        
        // Redirect to correct dashboard based on actual user type
        let correctDashboard = '/signin';
        if (user.userType === 'BUYER') correctDashboard = '/buyer/dashboard';
        else if (user.userType === 'SELLER') correctDashboard = '/vendor/dashboard';
        else if (user.userType === 'EMPLOYER') correctDashboard = '/company/dashboard';
        
        router.push(correctDashboard);
        return;
      }
      
      console.log('✅ User authenticated:', user.userType);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      localStorage.removeItem('user');
      router.push(fallbackUrl);
    }
  }, [requiredUserType, fallbackUrl, router]);

  return <>{children}</>;
}
