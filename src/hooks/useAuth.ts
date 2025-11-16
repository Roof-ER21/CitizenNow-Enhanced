/**
 * useAuth Hook - DEPRECATED
 *
 * Firebase authentication has been removed.
 * This app now uses PIN-based authentication via UserContext.
 * This file is kept for backward compatibility but should be removed.
 *
 * @deprecated Use UserContext for local authentication
 * @module useAuth
 */

import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';

// Mock User type for compatibility
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface UserCredential {
  user: User;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  signUp: (
    email: string,
    password: string,
    name: string,
    language?: string
  ) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

/**
 * DEPRECATED: Custom hook for Firebase authentication
 * Now returns mock/empty data. Use UserContext instead.
 *
 * @returns {UseAuthReturn} Mock authentication state and methods
 */
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: false,
    error: null,
  });

  // Mock authentication methods (no Firebase)
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      language: string = 'en'
    ): Promise<UserCredential> => {
      throw new Error('Firebase authentication disabled. Use PIN-based auth via UserContext.');
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string): Promise<UserCredential> => {
      throw new Error('Firebase authentication disabled. Use PIN-based auth via UserContext.');
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    // No-op for compatibility
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    throw new Error('Firebase authentication disabled.');
  }, []);

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<void> => {
      throw new Error('Firebase authentication disabled. Use UserContext.');
    },
    []
  );

  const refreshProfile = useCallback(async (): Promise<void> => {
    // No-op for compatibility
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    signUp,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    refreshProfile,
    clearError,
  };
};

// Removed Firebase error handling - no longer needed
