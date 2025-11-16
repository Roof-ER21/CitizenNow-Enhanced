# Interview Analytics Integration Examples

## Adding Analytics Navigation Button to AI Interview Screen

### Example 1: Add to Interview Completion Modal

```typescript
// In AIInterviewScreen.tsx, update the feedback modal

const renderFeedbackModal = () => {
  if (!feedback) return null;

  return (
    <Modal
      visible={showFeedbackModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFeedbackModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Interview Feedback</Text>

            {/* Score Display */}
            <View style={styles.scoreContainer}>
              {/* ... existing score display ... */}
            </View>

            {/* Feedback Sections */}
            {/* ... existing feedback sections ... */}

            {/* NEW: Analytics Navigation Button */}
            <TouchableOpacity
              style={styles.analyticsButton}
              onPress={() => {
                setShowFeedbackModal(false);
                navigation.navigate('InterviewAnalytics');
              }}
            >
              <Text style={styles.analyticsButtonText}>
                📊 View Full Analytics Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowFeedbackModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.retryButton} onPress={handleResetInterview}>
              <Text style={styles.retryButtonText}>Start New Interview</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Add new styles
const newStyles = {
  analyticsButton: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  analyticsButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
};
```

### Example 2: Add to Main Interview Screen Header

```typescript
// In AIInterviewScreen.tsx, add navigation button to header

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function AIInterviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Add this to the header section
  return (
    <KeyboardAvoidingView style={styles.container}>
      {/* Header with Analytics Button */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>AI Interview Simulator</Text>
            <Text style={styles.headerSubtitle}>
              Practice with a realistic USCIS officer simulation
            </Text>
          </View>

          {/* NEW: Analytics Icon Button */}
          <TouchableOpacity
            style={styles.analyticsIconButton}
            onPress={() => navigation.navigate('InterviewAnalytics')}
          >
            <Text style={styles.analyticsIcon}>📊</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rest of the component */}
    </KeyboardAvoidingView>
  );
}

// Add new styles
const headerStyles = {
  analyticsIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  analyticsIcon: {
    fontSize: 24,
  },
};
```

### Example 3: Add to Home Screen Dashboard Card

```typescript
// In HomeScreen.tsx, add analytics card

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Existing cards */}

      {/* NEW: Interview Analytics Card */}
      <TouchableOpacity
        style={styles.analyticsCard}
        onPress={() => navigation.navigate('InterviewAnalytics')}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📊</Text>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Interview Analytics</Text>
            <Text style={styles.cardSubtitle}>
              Track your progress and get insights
            </Text>
          </View>
          <Text style={styles.cardArrow}>→</Text>
        </View>

        {/* Quick Stats Preview */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>87%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const analyticsCardStyles = {
  analyticsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardArrow: {
    fontSize: 24,
    color: '#1E40AF',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
};
```

### Example 4: Add to Progress Screen

```typescript
// In ProgressScreen.tsx, add analytics section

export const ProgressScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Existing progress content */}

      {/* NEW: Interview Analytics Link */}
      <TouchableOpacity
        style={styles.analyticsLinkCard}
        onPress={() => navigation.navigate('InterviewAnalytics')}
      >
        <View style={styles.analyticsLinkHeader}>
          <Text style={styles.analyticsLinkIcon}>📊</Text>
          <Text style={styles.analyticsLinkTitle}>
            Interview Performance Analytics
          </Text>
        </View>

        <Text style={styles.analyticsLinkDescription}>
          View detailed insights into your AI interview practice sessions,
          including score trends, category performance, and personalized
          recommendations.
        </Text>

        <View style={styles.analyticsLinkFooter}>
          <Text style={styles.analyticsLinkButton}>View Analytics</Text>
          <Text style={styles.analyticsLinkArrow}>→</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const progressScreenStyles = {
  analyticsLinkCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  analyticsLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsLinkIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  analyticsLinkTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    flex: 1,
  },
  analyticsLinkDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  analyticsLinkFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analyticsLinkButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  analyticsLinkArrow: {
    fontSize: 20,
    color: '#1E40AF',
  },
};
```

---

## Testing the Analytics Screen

### Using Demo Data

```typescript
// In InterviewAnalyticsScreen.tsx, add demo data toggle

import { analyticsService } from '../services/analyticsService';

export default function InterviewAnalyticsScreen() {
  const [useDemoData, setUseDemoData] = useState(__DEV__); // Auto-enable in dev mode

  useEffect(() => {
    if (useDemoData) {
      // Generate demo sessions for testing
      const demoSessions = analyticsService.generateDemoSessions(15);
      setSessions(demoSessions);

      const calculated = calculateAnalytics(demoSessions);
      setAnalytics(calculated);
      setLoading(false);
    } else {
      loadInterviewData();
    }
  }, [useDemoData]);

  // Add toggle button in development
  {__DEV__ && (
    <TouchableOpacity
      style={styles.demoToggle}
      onPress={() => setUseDemoData(!useDemoData)}
    >
      <Text style={styles.demoToggleText}>
        {useDemoData ? '🎭 Demo Data' : '📊 Real Data'}
      </Text>
    </TouchableOpacity>
  )}
}
```

---

## Custom Hooks for Analytics

### useInterviewAnalytics Hook

```typescript
// Create: src/hooks/useInterviewAnalytics.ts

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AISession } from '../types';

export const useInterviewAnalytics = (userId: string, timeFilter: 'week' | 'month' | 'all') => {
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [userId, timeFilter]);

  const loadSessions = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const sessionsQuery = query(
        collection(db, 'aiSessions'),
        where('userId', '==', userId),
        where('sessionType', '==', 'interview'),
        orderBy('startTime', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(sessionsQuery);
      const loadedSessions = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate(),
      })) as AISession[];

      // Apply time filter
      const filtered = filterByTime(loadedSessions, timeFilter);
      setSessions(filtered);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load interview sessions');
    } finally {
      setLoading(false);
    }
  };

  const filterByTime = (sessions: AISession[], filter: string) => {
    if (filter === 'all') return sessions;

    const now = new Date();
    const daysToFilter = filter === 'week' ? 7 : 30;

    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= daysToFilter;
    });
  };

  return { sessions, loading, error, refetch: loadSessions };
};
```

### Usage in Component

```typescript
import { useInterviewAnalytics } from '../hooks/useInterviewAnalytics';

export default function InterviewAnalyticsScreen() {
  const { user } = useUser();
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');

  const { sessions, loading, error, refetch } = useInterviewAnalytics(
    user?.uid || '',
    timeFilter
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={refetch} />;

  // Calculate analytics from sessions
  const analytics = calculateAnalytics(sessions);

  return (
    // ... render dashboard
  );
}
```

---

## Performance Optimizations

### Memoized Calculations

```typescript
import { useMemo } from 'react';

export default function InterviewAnalyticsScreen() {
  const { sessions } = useInterviewAnalytics(user?.uid || '', timeFilter);

  // Memoize expensive calculations
  const analytics = useMemo(() => {
    return calculateAnalytics(sessions);
  }, [sessions]);

  const chartData = useMemo(() => {
    return prepareChartData(analytics);
  }, [analytics]);

  // ... rest of component
}
```

### Lazy Chart Rendering

```typescript
import { useState, useEffect } from 'react';

export default function InterviewAnalyticsScreen() {
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    // Delay chart rendering for smoother initial load
    setTimeout(() => setShowCharts(true), 300);
  }, []);

  return (
    <ScrollView>
      {/* Summary cards render immediately */}
      <SummaryCards />

      {/* Charts render after delay */}
      {showCharts && (
        <>
          <ScoreTrendChart />
          <CategoryRadarChart />
        </>
      )}
    </ScrollView>
  );
}
```

---

## Firestore Security Rules

```javascript
// Add to firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // AI Sessions - users can only access their own
    match /aiSessions/{sessionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Analytics aggregations (optional)
    match /userAnalytics/{userId} {
      allow read, write: if request.auth != null && userId == request.auth.uid;
    }
  }
}
```

---

## Automated Testing

### Jest Test Example

```typescript
// __tests__/analyticsService.test.ts

import { analyticsService } from '../services/analyticsService';

describe('Analytics Service', () => {
  test('generates demo sessions correctly', () => {
    const sessions = analyticsService.generateDemoSessions(10);
    expect(sessions).toHaveLength(10);
    expect(sessions[0].sessionType).toBe('interview');
    expect(sessions[0].feedback).toBeDefined();
  });

  test('calculates readiness percentage', () => {
    const readiness = analyticsService.calculateReadiness(85, 15, {
      americanGovernment: 80,
      americanHistory: 85,
      geography: 90,
      symbols: 88,
      integratedCivics: 82,
    }, 5);

    expect(readiness).toBeGreaterThan(0);
    expect(readiness).toBeLessThanOrEqual(100);
  });

  test('generates recommendations based on performance', () => {
    const recommendations = analyticsService.generateRecommendations(
      65,
      { americanGovernment: 60, americanHistory: 55 },
      [{ topic: 'Bill of Rights', accuracy: 50 }],
      3,
      0
    );

    expect(recommendations).toContain('Focus on foundational civics questions');
  });
});
```

---

**Last Updated**: November 15, 2025
