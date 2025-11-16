// AuthGate - Controls authentication flow (Welcome vs PIN Login)
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { pinAuthService, UserData } from '../services/pinAuthService';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import PinLoginScreen from '../screens/auth/PinLoginScreen';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [loading, setLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const accountExists = await pinAuthService.hasAccount();
      setHasAccount(accountExists);

      // If they have an account, check if they're already logged in
      if (accountExists) {
        const userData = await pinAuthService.getUserData();
        if (userData) {
          setCurrentUser(userData);
          // They have data stored, but we still need PIN to authenticate
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeComplete = () => {
    // After welcome/signup, reload auth status
    checkAuthStatus().then(() => {
      setIsAuthenticated(true);
    });
  };

  const handleLoginSuccess = (user: UserData) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Not authenticated - show welcome or login
  if (!isAuthenticated) {
    if (!hasAccount) {
      // First time user - show welcome/signup
      return <WelcomeScreen onComplete={handleWelcomeComplete} />;
    } else {
      // Returning user - show PIN login
      return <PinLoginScreen onSuccess={handleLoginSuccess} />;
    }
  }

  // Authenticated - show main app
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});
