import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { n400Assistant } from '../services/llmService';

// Supported languages for translation
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'zh', name: 'Chinese' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
  { code: 'ht', name: 'Haitian Creole' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pl', name: 'Polish' },
  { code: 'ur', name: 'Urdu' },
  { code: 'bn', name: 'Bengali' },
];

// Common N-400 terms for quick access
const COMMON_TERMS = [
  'Naturalization',
  'Oath of Allegiance',
  'Good Moral Character',
  'Continuous Residence',
  'Physical Presence',
  'Lawful Permanent Resident',
  'Biometrics Appointment',
  'Interview Process',
  'Civic Knowledge',
  'English Proficiency',
  'Form N-400',
  'USCIS',
  'Green Card',
  'Deportation',
  'Asylum',
  'Selective Service',
];

export default function N400AssistantScreen() {
  const [inputTerm, setInputTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiCallCount, setApiCallCount] = useState(0);
  const [history, setHistory] = useState<{ term: string; explanation: string }[]>([]);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const API_LIMIT_FREE_TIER = 20; // Gemini has generous free tier

  const handleExplain = async (term?: string) => {
    const termToExplain = term || inputTerm.trim();
    if (!termToExplain) return;

    if (apiCallCount >= API_LIMIT_FREE_TIER) {
      setError(`Free tier limit reached (${API_LIMIT_FREE_TIER} API calls). Please upgrade for unlimited access.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await n400Assistant.explainTerm(termToExplain, selectedLanguage.code);
      setExplanation(result);
      setApiCallCount((prev) => prev + 1);

      // Add to history
      setHistory((prev) => [
        { term: termToExplain, explanation: result },
        ...prev.slice(0, 4), // Keep last 5 items
      ]);

      // Clear input if it was manual entry
      if (!term) {
        setInputTerm('');
      }
    } catch (err) {
      setError('Failed to get explanation. Please check your API key and try again.');
      console.error('Explanation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLanguageSelector = () => {
    if (!showLanguageSelector) return null;

    return (
      <View style={styles.languageSelector}>
        <Text style={styles.languageSelectorTitle}>Select Language</Text>
        <ScrollView style={styles.languageList} nestedScrollEnabled>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                selectedLanguage.code === lang.code && styles.languageItemSelected,
              ]}
              onPress={() => {
                setSelectedLanguage(lang);
                setShowLanguageSelector(false);
              }}
            >
              <Text
                style={[
                  styles.languageItemText,
                  selectedLanguage.code === lang.code && styles.languageItemTextSelected,
                ]}
              >
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>N-400 Assistant</Text>
        <Text style={styles.headerSubtitle}>Get AI-powered explanations in your language</Text>
        <Text style={styles.apiCounter}>
          API Calls: {apiCallCount}/{API_LIMIT_FREE_TIER} (Free Tier)
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Language Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setShowLanguageSelector(!showLanguageSelector)}
        >
          <Text style={styles.languageButtonText}>{selectedLanguage.name}</Text>
          <Text style={styles.languageButtonIcon}>{showLanguageSelector ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {renderLanguageSelector()}
      </View>

      {/* Input Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ask About a Term or Concept</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter N-400 term or question..."
            placeholderTextColor="#9CA3AF"
            value={inputTerm}
            onChangeText={setInputTerm}
            multiline
            maxLength={200}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.explainButton, (!inputTerm.trim() || isLoading) && styles.buttonDisabled]}
            onPress={() => handleExplain()}
            disabled={!inputTerm.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.explainButtonText}>Explain</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Common Terms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Terms</Text>
        <View style={styles.termsGrid}>
          {COMMON_TERMS.map((term) => (
            <TouchableOpacity
              key={term}
              style={[styles.termChip, isLoading && styles.buttonDisabled]}
              onPress={() => handleExplain(term)}
              disabled={isLoading}
            >
              <Text style={styles.termChipText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Explanation Display */}
      {explanation && !isLoading && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explanation</Text>
          <View style={styles.explanationCard}>
            <Text style={styles.explanationText}>{explanation}</Text>
          </View>
        </View>
      )}

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Getting explanation...</Text>
        </View>
      )}

      {/* History */}
      {history.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {history.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyCard}
              onPress={() => {
                setExplanation(item.explanation);
                setInputTerm(item.term);
              }}
            >
              <Text style={styles.historyTerm}>{item.term}</Text>
              <Text style={styles.historyExplanation} numberOfLines={2}>
                {item.explanation}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.instructionsTitle}>How to Use</Text>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>1</Text>
          <Text style={styles.instructionText}>
            Select your preferred language from the dropdown
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>2</Text>
          <Text style={styles.instructionText}>
            Type any N-400 term or tap a common term below
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>3</Text>
          <Text style={styles.instructionText}>
            Get instant AI-powered explanations in simple language
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>4</Text>
          <Text style={styles.instructionText}>
            Your recent searches are saved for quick reference
          </Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.featuresTitle}>Features</Text>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🌍</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>15+ Languages</Text>
            <Text style={styles.featureDescription}>
              Get explanations in your native language for better understanding
            </Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>💡</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Simple Language</Text>
            <Text style={styles.featureDescription}>
              Complex legal terms explained in easy-to-understand language
            </Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>⚡</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Instant Results</Text>
            <Text style={styles.featureDescription}>
              Powered by Google Gemini AI for fast, accurate explanations
            </Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📚</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Search History</Text>
            <Text style={styles.featureDescription}>
              Access your recent searches anytime for quick review
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginBottom: 8,
  },
  apiCounter: {
    fontSize: 12,
    color: '#FCD34D',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  languageButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  languageButtonIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  languageSelector: {
    backgroundColor: '#FFF',
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 300,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  languageSelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  languageList: {
    maxHeight: 240,
  },
  languageItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  languageItemSelected: {
    backgroundColor: '#DBEAFE',
  },
  languageItemText: {
    fontSize: 15,
    color: '#4B5563',
  },
  languageItemTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 50,
    maxHeight: 100,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  explainButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
  explainButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  termsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  termChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  termChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E40AF',
  },
  explanationCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1E40AF',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  explanationText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  historyCard: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  historyTerm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  historyExplanation: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    backgroundColor: '#1E40AF',
    color: '#FFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    paddingTop: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});
