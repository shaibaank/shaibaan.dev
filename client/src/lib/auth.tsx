import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as strapiLogin, logout as strapiLogout, isAuthenticated, getUser } from './strapi';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    if (isAuthenticated()) {
      setUser(getUser());
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await strapiLogin(identifier, password);
    setUser(response.user);
  };

  const logout = () => {
    strapiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: !!user,
        isLoading,
        login,
        logout,
      }}
    >
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
