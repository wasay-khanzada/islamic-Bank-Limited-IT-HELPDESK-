import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { UserRole } from "@/lib/roles";
import { authApi } from "@/api/authApi";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
  branchCode?: string;
  designation?: string;
  departmentId?: number;
  status?: string;
  accountStatus?: string;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: any }>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to normalize role from backend to frontend format
const normalizeRole = (role: string): UserRole => {
  if (role === 'super_admin') return 'super_admin';
  if (role === 'admin') return 'admin';
  if (role === 'agent') return 'agent';
  return 'user';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      // Check user status - reject pending users
      const userStatus = response.user?.status || response.user?.accountStatus;
      if (userStatus === 'pending') {
        toast.error('Account pending approval. Please contact admin.');
        throw new Error('Account pending approval');
      }
      
      if (response.token) {
        const userWithRole: User = {
          ...response.user,
          role: normalizeRole(response.user.role)
        };
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        setUser(userWithRole);
        toast.success('Login successful!');
        return { user: userWithRole };
      }
      return { user: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      if (errorMessage !== 'Account pending approval') {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const register = async (data: any): Promise<void> => {
    try {
      const response = await authApi.register(data);
      
      if (response.token) {
        const userWithRole: User = {
          ...response.user,
          role: normalizeRole(response.user.role)
        };
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        setUser(userWithRole);
        toast.success('Registration successful! Your account is pending approval.');
      } else if (response.message) {
        toast.success(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
