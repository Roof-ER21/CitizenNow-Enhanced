// PIN Authentication Service - Secure local authentication (no cloud dependency)
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const PIN_KEY = '@citizennow_user_pin';
const USER_KEY = '@citizennow_user_data';

export interface UserData {
  name: string;
  userId: string;
  createdAt: string;
  language?: string;
  testVersion?: '2008' | '2025';
  testDate?: string;
  is65Plus?: boolean;
}

class PinAuthService {
  // Hash PIN for secure storage
  private async hashPin(pin: string): Promise<string> {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin + 'citizennow_salt' // Add salt for extra security
    );
    return digest;
  }

  // Check if user has account (has set PIN)
  async hasAccount(): Promise<boolean> {
    try {
      const pin = await AsyncStorage.getItem(PIN_KEY);
      return pin !== null;
    } catch (error) {
      console.error('Error checking account:', error);
      return false;
    }
  }

  // Get stored user data
  async getUserData(): Promise<UserData | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Create new account (first-time setup)
  async createAccount(name: string, pin: string): Promise<UserData> {
    try {
      // Hash and store PIN locally
      const hashedPin = await this.hashPin(pin);
      await AsyncStorage.setItem(PIN_KEY, hashedPin);

      // Generate unique user ID (simple timestamp-based)
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create user data
      const userData: UserData = {
        name,
        userId,
        createdAt: new Date().toISOString(),
        language: 'en',
        testVersion: '2025',
      };

      // Store locally only (no cloud sync)
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

      console.log('✅ Account created successfully (local-only)');
      return userData;
    } catch (error) {
      console.error('Error creating account:', error);
      throw new Error('Failed to create account. Please try again.');
    }
  }

  // Verify PIN and login
  async verifyPin(pin: string): Promise<UserData | null> {
    try {
      const storedHashedPin = await AsyncStorage.getItem(PIN_KEY);
      if (!storedHashedPin) {
        throw new Error('No account found');
      }

      const hashedPin = await this.hashPin(pin);

      if (hashedPin !== storedHashedPin) {
        return null; // Incorrect PIN
      }

      // PIN is correct, return user data
      return await this.getUserData();
    } catch (error) {
      console.error('Error verifying PIN:', error);
      throw error;
    }
  }

  // Change PIN
  async changePin(oldPin: string, newPin: string): Promise<boolean> {
    try {
      // Verify old PIN first
      const user = await this.verifyPin(oldPin);
      if (!user) {
        return false;
      }

      // Set new PIN
      const hashedPin = await this.hashPin(newPin);
      await AsyncStorage.setItem(PIN_KEY, hashedPin);

      return true;
    } catch (error) {
      console.error('Error changing PIN:', error);
      return false;
    }
  }

  // Update user profile
  async updateUserData(updates: Partial<UserData>): Promise<void> {
    try {
      const currentData = await this.getUserData();
      if (!currentData) {
        throw new Error('No user data found');
      }

      const updatedData = { ...currentData, ...updates };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  // Sign out (clear local session but keep data for re-login)
  async signOut(): Promise<void> {
    try {
      // Note: We don't clear PIN_KEY or USER_KEY - user can log back in with PIN
      console.log('User signed out (data retained for re-login)');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Delete account completely
  async deleteAccount(): Promise<void> {
    try {
      // Clear all local data
      await AsyncStorage.multiRemove([PIN_KEY, USER_KEY]);
      console.log('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  // Validate PIN format (4-6 digits)
  validatePinFormat(pin: string): { valid: boolean; message?: string } {
    if (pin.length < 4) {
      return { valid: false, message: 'PIN must be at least 4 digits' };
    }
    if (pin.length > 6) {
      return { valid: false, message: 'PIN must be 6 digits or less' };
    }
    if (!/^\d+$/.test(pin)) {
      return { valid: false, message: 'PIN must contain only numbers' };
    }
    return { valid: true };
  }

  // Validate name format
  validateNameFormat(name: string): { valid: boolean; message?: string } {
    if (name.trim().length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters' };
    }
    if (name.trim().length > 50) {
      return { valid: false, message: 'Name must be less than 50 characters' };
    }
    return { valid: true };
  }
}

export const pinAuthService = new PinAuthService();
