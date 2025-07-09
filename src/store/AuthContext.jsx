import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CURRENT_USER, LOGIN_USER } from '../graphql/queries';
import { message } from 'antd';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token and validate user
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER, {
    skip: !localStorage.getItem('token'),
    onCompleted: (data) => {
      if (data.me) {
        setUser(data.me);
        setIsAuthenticated(true);
        
        // Check if user has admin/manager role
        const userRole = data.me.profile?.role?.toLowerCase();
        if (!['admin', 'manager'].includes(userRole)) {
          message.error('Access denied. Admin or Manager role required.');
          logout();
        }
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error('Auth error:', error);
      logout();
      setLoading(false);
    }
  });

  const [loginMutation] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      if (data.tokenAuth.token) {
        const { token, user } = data.tokenAuth;
        localStorage.setItem('token', token);
        setUser(user);
        setIsAuthenticated(true);
        
        // Check if user has admin/manager role
        const userRole = user.profile?.role?.toLowerCase();
        if (!['admin', 'manager'].includes(userRole)) {
          message.error('Access denied. Admin or Manager role required.');
          logout();
          return;
        }
        
        message.success('Login successful!');
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      message.error(error.message || 'Login failed. Please check your credentials.');
    }
  });

  const login = async (username, password) => {
    try {
      await loginMutation({
        variables: { username, password }
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading: loading || userLoading,
    userRole: user?.profile?.role
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
