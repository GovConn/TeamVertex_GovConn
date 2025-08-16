"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DocumentLink {
  title: string;
  url: string;
  uploaded_at?: string;
}

interface User {
  nic: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  active: boolean;
  document_links: DocumentLink[];
  reference_id?: number;
  role?: string;
  created_at?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user: User;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  referenceId: string | null;
  setReferenceId: (id: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;
  login: (nic: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  getCitizen: (nic: string) => Promise<User | null>; // Added getCitizen method
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Get base URL from environment
const getBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
  }
  return baseUrl;
};

// Local storage keys
const USER_STORAGE_KEY = 'govconn_user';
const AUTH_STORAGE_KEY = 'govconn_auth';
const TOKEN_STORAGE_KEY = 'govconn_token';
const TOKEN_EXPIRY_KEY = 'govconn_token_expiry';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (prev) {
        const updatedUser = { ...prev, ...updates };
        // Update localStorage as well
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    });
  };

  // Helper function to store user data
  const storeUserData = (userData: User, token?: string, expiresIn?: number) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Store in localStorage for persistence
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    
    // Store token if provided
    if (token) {
      setAuthToken(token);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      // Store expiry time if provided
      if (expiresIn) {
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    }
    
    // Format reference ID if available
    if (userData.reference_id) {
      const formattedReferenceId = userData.reference_id
        .toString()
        .padStart(16, '0')
        .replace(/(.{4})/g, '$1 ')
        .trim();
      setReferenceId(formattedReferenceId);
    }
  };

  // Helper function to clear user data
  const clearUserData = () => {
    setUser(null);
    setIsAuthenticated(false);
    setReferenceId(null);
    setAuthToken(null);
    
    // Clear localStorage
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  };

  // Check if token is expired
  const isTokenExpired = (): boolean => {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return false;
    
    return Date.now() > parseInt(expiryTime);
  };

  // Get citizen by NIC - NEW METHOD
  const getCitizen = async (nic: string): Promise<User | null> => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/v1/citizen/${nic}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData: User = await response.json();
        return userData;
      } else if (response.status === 404) {
        console.log(`Citizen with NIC ${nic} not found`);
        return null;
      } else if (response.status === 401) {
        console.log('Unauthorized access - token may be invalid');
        clearUserData();
        return null;
      } else {
        throw new Error(`Failed to get citizen: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Get citizen error:', error);
      throw error;
    }
  };

  // Login function
  const login = async (nic: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/v1/citizen/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: new URLSearchParams({
          grant_type: 'password',
          username: nic,
          password: password,
          scope: '',
          client_id: '',
          client_secret: '',
        }),
      });

      if (response.ok) {
        const loginData: LoginResponse = await response.json();
        
        // Handle different response formats
        if (loginData.user) {
          // Response includes separate user object and token
          storeUserData(loginData.user, loginData.access_token, loginData.expires_in);
        } else {
          // Response is the user object directly (your current format)
          storeUserData(loginData as any, loginData.access_token, loginData.expires_in);
        }
        
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Login failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      clearUserData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh authentication - UPDATED to use getCitizen
  const refreshAuth = async (): Promise<boolean> => {
    try {
      // Check if we have a stored user with NIC to refresh
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (!storedUser) {
        clearUserData();
        return false;
      }

      const userData = JSON.parse(storedUser);
      if (!userData.nic) {
        clearUserData();
        return false;
      }

      // Use the getCitizen method to refresh user data
      const refreshedUser = await getCitizen(userData.nic);
      if (refreshedUser) {
        // Keep the existing token but update user data
        const existingToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        storeUserData(refreshedUser, existingToken || undefined);
        return true;
      } else {
        clearUserData();
        return false;
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      clearUserData();
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const baseUrl = getBaseUrl();
      // Try to call logout endpoint if it exists
      await fetch(`${baseUrl}/api/v1/citizen/logout`, {
        method: 'POST',
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        credentials: 'include',
      }).catch(() => {
        // Ignore errors if logout endpoint doesn't exist
        console.log('Logout endpoint not available, clearing local data only');
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearUserData();
    }
  };

  // Check authentication status from localStorage - UPDATED
  const checkAuth = async (): Promise<void> => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (storedUser && storedAuth === 'true') {
        const userData = JSON.parse(storedUser);
        
        // Check if token exists and is not expired
        if (storedToken) {
          setAuthToken(storedToken);
          
          // If token is expired, try to refresh user data
          if (isTokenExpired()) {
            console.log('Token expired, attempting to refresh user data...');
            const refreshed = await refreshAuth();
            if (!refreshed) {
              clearUserData();
              return;
            }
          } else {
            storeUserData(userData, storedToken);
          }
        } else {
          // No token found, try to refresh user data if we have NIC
          if (userData.nic) {
            try {
              const refreshedUser = await getCitizen(userData.nic);
              if (refreshedUser) {
                storeUserData(refreshedUser);
              } else {
                clearUserData();
              }
            } catch (error) {
              console.log('Could not refresh user data without token');
              clearUserData();
            }
          } else {
            clearUserData();
          }
        }
      } else {
        clearUserData();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearUserData();
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for storage changes (for multi-tab logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY && e.newValue === null) {
        // User logged out in another tab
        clearUserData();
      } else if (e.key === USER_STORAGE_KEY && e.newValue) {
        // User data updated in another tab
        try {
          const userData = JSON.parse(e.newValue);
          const token = localStorage.getItem(TOKEN_STORAGE_KEY);
          storeUserData(userData, token || undefined);
        } catch (error) {
          console.error('Error parsing user data from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser: (user) => { if (user) storeUserData(user); else clearUserData(); },
      updateUser, 
      referenceId, 
      setReferenceId,
      isAuthenticated,
      isLoading,
      authToken,
      login,
      logout,
      checkAuth,
      refreshAuth,
      getCitizen // Added to context value
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
