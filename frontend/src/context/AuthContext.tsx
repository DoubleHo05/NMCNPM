import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, login as loginApi, logout as logoutApi, getStoredUser, isAuthenticated, getCurrentUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (tenDangNhap: string, matKhau: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        // Try to get stored user first (faster)
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
        // Then verify with server
        try {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          } else {
            // Token invalid, clear everything
            setUser(null);
            localStorage.removeItem('user');
          }
        } catch {
          // API error, keep stored user
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (tenDangNhap: string, matKhau: string) => {
    try {
      const response = await loginApi(tenDangNhap, matKhau);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Đăng nhập thất bại' };
    }
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
