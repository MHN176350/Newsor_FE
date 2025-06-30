import { useState, useEffect, useRef } from 'react';
import { getContainer } from '../../container.js';

/**
 * Hook for managing user authentication
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use refs to store stable references to services
  const containerRef = useRef(null);
  const authServiceRef = useRef(null);
  const getCurrentUserUseCaseRef = useRef(null);

  // Initialize services once
  if (!containerRef.current) {
    containerRef.current = getContainer();
    authServiceRef.current = containerRef.current.authService;
    getCurrentUserUseCaseRef.current = containerRef.current.getCurrentUserUseCase;
  }

  useEffect(() => {
    loadCurrentUser();

    // Listen for auth state changes
    const unsubscribe = authServiceRef.current.addAuthListener(() => {
      loadCurrentUser();
    });

    return unsubscribe;
  }, []); // Empty dependency array since we're using refs

  const loadCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await getCurrentUserUseCaseRef.current.execute();
      
      // Avatar URLs should already be optimized by the backend
      // No need to process them further on the frontend
      
      setUser(currentUser);
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authServiceRef.current.login(credentials);
      
      if (result.success) {
        // Set user state immediately for UI responsiveness
        setUser(result.user);
        
        // Also refresh the current user data to ensure consistency
        await loadCurrentUser();
        
        return { success: true };
      } else {
        throw new Error(result.errors?.join(', ') || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authServiceRef.current.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const registerUseCase = containerRef.current.registerUserUseCase;
      const newUser = await registerUseCase.execute(userData);
      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Let the backend handle URL optimization
      const updateProfileUseCase = containerRef.current.updateUserProfileUseCase;
      const updatedProfile = await updateProfileUseCase.execute(profileData);
      
      // Update user state with new profile
      const updatedUser = {
        ...user,
        profile: updatedProfile
      };
      
      setUser(updatedUser);
      
      // Update auth service and local storage
      authServiceRef.current.updateCurrentUser(updatedUser);
      
      return { success: true, profile: updatedProfile };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (updatedProfile) => {
    try {
      // Update user state with new profile data
      const updatedUser = {
        ...user,
        profile: updatedProfile
      };
      
      setUser(updatedUser);
      
      // Update auth service and local storage
      authServiceRef.current.updateCurrentUser(updatedUser);
      
      return { success: true, profile: updatedProfile };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    hasWritePermission: user?.profile?.hasWritePermission || false,
    hasAdminPermission: user?.profile?.hasAdminPermission || false,
    hasManagerPermission: user?.profile?.hasManagerPermission || false,
    login,
    logout,
    register,
    updateProfile,
    updateAvatar,
    refreshUser: loadCurrentUser
  };
};
