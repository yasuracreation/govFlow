import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, AuthContextType, UserRole } from '../types.ts'; // Import UserRole
import { login as apiLogin, getMe, mockLogout } from '../services/authService.ts';

// Re-export UserRole for convenience for consumers of this module
export { UserRole };

// Define and export AuthContext. AuthContextType is imported from ../types.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define and export AuthProvider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session using JWT token
    const token = localStorage.getItem('token');
    console.log('=== useAuth useEffect Debug ===');
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (token) {
      const fetchUser = async () => {
        try {
          console.log('Fetching user info with token...');
          const userInfo = await getMe(token);
          console.log('User info received:', userInfo);
          setUser(userInfo || null);
        } catch (error) {
          console.error("Session restore failed:", error);
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      console.log('No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const { token } = await apiLogin(identifier, password);
      localStorage.setItem('token', token);
      const userInfo = await getMe(token);
      setUser(userInfo);
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      localStorage.removeItem('token');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await mockLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Potentially handle logout error, though unlikely for mock
    } finally {
      setUser(null); // Ensure user is cleared even if mockLogout had an issue
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Define and export the useAuth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};