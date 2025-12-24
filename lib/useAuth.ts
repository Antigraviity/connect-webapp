import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  userType?: 'BUYER' | 'SELLER' | 'EMPLOYER';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  image?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Only check localStorage for user data
        // Token is stored in httpOnly cookie
        const userData = localStorage.getItem('user');
        
        console.log('🔍 Auth check:', { 
          hasUserData: !!userData
        });

        if (!userData) {
          setUser(null);
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);
        console.log('✅ User authenticated:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0'; // Clear cookie
    setUser(null);
    router.push('/signin');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const getUserType = () => {
    return user?.userType;
  };

  const isBuyer = () => {
    return user?.userType === 'BUYER';
  };

  const isSeller = () => {
    return user?.userType === 'SELLER' || user?.role === 'SELLER';
  };

  const isEmployer = () => {
    return user?.userType === 'EMPLOYER';
  };

  return {
    user,
    loading,
    logout,
    isAuthenticated,
    getUserType,
    isBuyer,
    isSeller,
    isEmployer,
  };
};
