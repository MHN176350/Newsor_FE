import { createContext, useContext, useReducer, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../graphql/queries';
import { getToken, setToken, removeToken, getCurrentUser, setCurrentUser, removeCurrentUser } from '../utils/constants';

// Initial state
const initialState = {
  user: null,
  token: getToken(),
  isAuthenticated: false,
  isLoading: true,
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext(null);

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [getCurrentUserQuery, { loading }] = useLazyQuery(GET_CURRENT_USER, {
    onCompleted: (data) => {
      if (data?.me) {
        dispatch({ type: 'SET_USER', payload: data.me });
        setCurrentUser(data.me);
      } else {
        dispatch({ type: 'LOGOUT' });
        logout();
      }
    },
    onError: (error) => {
      console.error('Error fetching current user:', error);
      dispatch({ type: 'LOGOUT' });
      logout();
    },
  });

  // Initialize auth state
  useEffect(() => {
    const token = getToken();
    const savedUser = getCurrentUser();
    
    if (token && savedUser) {
      dispatch({ type: 'SET_USER', payload: savedUser });
    } else if (token) {
      // Token exists but no user data, fetch from server
      getCurrentUserQuery();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [getCurrentUserQuery]);

  // Login function
  const login = async (user, token) => {
    try {
      setToken(token);
      setCurrentUser(user);
      dispatch({ type: 'LOGIN', payload: { user, token } });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    removeToken();
    removeCurrentUser();
    dispatch({ type: 'LOGOUT' });
  };

  // Update user function
  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    dispatch({ type: 'SET_USER', payload: updatedUser });
  };

  // Refresh user data
  const refreshUser = () => {
    if (state.token) {
      getCurrentUserQuery();
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.profile?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!state.user?.profile?.role) return false;
    return roles.includes(state.user.profile.role);
  };

  // Check if user can perform action
  const canPerformAction = (action, resource = null) => {
    if (!state.user) return false;
    
    const userRole = state.user.profile?.role;
    
    switch (action) {
      case 'create_news':
        return ['writer', 'manager', 'admin'].includes(userRole);
      case 'edit_news':
        if (!resource) return false;
        if (['admin', 'manager'].includes(userRole)) return true;
        return userRole === 'writer' && resource.author.id === state.user.id;
      case 'delete_news':
        return userRole === 'admin';
      case 'approve_news':
        return ['manager', 'admin'].includes(userRole);
      case 'manage_users':
        return userRole === 'admin';
      case 'view_analytics':
        return ['manager', 'admin'].includes(userRole);
      default:
        return false;
    }
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    refreshUser,
    hasRole,
    hasAnyRole,
    canPerformAction,
    isLoading: state.isLoading || loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
