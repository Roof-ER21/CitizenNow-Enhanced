// Main App Component with Navigation and Authentication
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import AuthGate from './src/components/AuthGate';
import { UserProvider } from './src/contexts/UserContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AuthGate>
          <RootNavigator />
        </AuthGate>
      </UserProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
