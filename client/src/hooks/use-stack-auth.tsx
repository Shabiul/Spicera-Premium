import { useState, useEffect, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useStackApp, useUser } from "@stackframe/stack";

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

export function StackAuthProvider({ children }: { children: ReactNode }) {
  const stackApp = useStackApp();
  const stackUser = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Stack Auth user with our user state
  useEffect(() => {
    if (stackUser) {
      // Map Stack Auth user to our User interface
      const mappedUser: User = {
        id: stackUser.id,
        email: stackUser.primaryEmail || '',
        name: stackUser.displayName || stackUser.primaryEmail || '',
        role: 'customer', // Default role, can be updated via profile
        phone: undefined,
        address: undefined
      };
      setUser(mappedUser);
      
      // Fetch additional profile data from our backend
      fetchUserProfile(stackUser.id);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [stackUser]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/auth/profile/${userId}`);
      if (response.ok) {
        const profileData = await response.json();
        setUser(prev => prev ? { ...prev, ...profileData } : null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      await stackApp.signInWithCredentials({
        email: credentials.email,
        password: credentials.password
      });
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      await stackApp.signUpWithCredentials({
        email: userData.email,
        password: userData.password
      });
      
      // After successful registration, update profile with additional data
      if (userData.name || userData.phone || userData.address) {
        await updateProfile({
          name: userData.name,
          phone: userData.phone,
          address: userData.address
        });
      }
      
      // Invalidate admin queries to update dashboard
      const { queryClient } = await import('@/lib/queryClient');
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await stackApp.signOut();
      setUser(null);
      
      // Clear cart cache to update UI immediately
      const { queryClient } = await import('@/lib/queryClient');
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      // Update Stack Auth user display name if name is provided
      if (profileData.name && stackUser) {
        await stackUser.update({ displayName: profileData.name });
      }
      
      // Update additional profile data in our backend
      const response = await fetch(`/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Profile update failed');
      }

      const updatedData = await response.json();
      setUser(prev => prev ? { ...prev, ...updatedData } : null);
      
      // Invalidate admin queries to update dashboard
      const { queryClient } = await import('@/lib/queryClient');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
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
    throw new Error('useAuth must be used within a StackAuthProvider');
  }
  return context;
}