import { useState, useEffect, createContext, useContext } from "react";
import type { ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        try {
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse user profile response:', error);
          localStorage.removeItem('auth_token');
        }
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Invalid response from server');
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (!data.success || !data.token) {
      throw new Error('Invalid response format from server');
    }

    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
  };

  const register = async (userData: RegisterRequest) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Invalid response from server');
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    if (!data.success || !data.token) {
      throw new Error('Invalid response format from server');
    }

    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    
    // Invalidate admin queries to update dashboard
    const { queryClient } = await import('@/lib/queryClient');
    queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    
    // Clear cart cache to update UI immediately
    const { queryClient } = await import('@/lib/queryClient');
    queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
  };

  const updateProfile = async (profileData: Partial<User>) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Invalid response from server');
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Profile update failed');
    }

    setUser(data.user);
    
    // Invalidate admin queries to update dashboard
    const { queryClient } = await import('@/lib/queryClient');
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}