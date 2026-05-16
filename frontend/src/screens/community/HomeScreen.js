import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { StatsCard, SectionHeader } from '../../components/SharedComponents';
import IssueCard from '../../components/IssueCard';
import api from '../../config/api';
import { COLORS, FONTS, SPACING, SHADOWS, RADIUS } from '../../constants/theme';

const CommunityHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ pending: 0, in_progress: 0, resolved: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [issuesRes] = await Promise.all([
        api.get('/issues/my', { params: { limit: 5 } }),
      ]);

      const fetchedIssues = issuesRes.data.data.issues || [];
      setIssues(fetchedIssues);

      // Calculate stats from issues
      const counts = { pending: 0, in_progress: 0, resolved: 0 };
      fetchedIssues.forEach(i => {
        if (counts[i.status] !== undefined) counts[i.status]++;
      });
      setStats(counts);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation, fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const firstName = user?.name?.split(' ')[0] || 'User';
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Header */}
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting} 👋</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Action */}
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('SubmitIssue')}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="add-circle" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Report an Issue</Text>
              <Text style={styles.quickActionDesc}>Snap a photo and submit in seconds</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatsCard icon="time-outline" label="Pending" value={stats.pending} color={COLORS.warning} />
          <StatsCard icon="construct-outline" label="In Progress" value={stats.in_progress} color={COLORS.info} />
          <StatsCard icon="checkmark-circle-outline" label="Resolved" value={stats.resolved} color={COLORS.success} />
        </View>

        {/* Recent Issues */}
        <SectionHeader
          title="Recent Submissions"
          action={() => navigation.navigate('MyIssues')}
          actionLabel="View All"
        />

        <View style={styles.issuesList}>
          {issues.length === 0 && !loading ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No issues submitted yet</Text>
              <Text style={styles.emptySubtext}>Tap the button above to report your first issue</Text>
            </View>
          ) : (
            issues.slice(0, 5).map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onPress={() => navigation.navigate('IssueDetail', { issueId: issue.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  greeting: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 2,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  quickActionText: { flex: 1 },
  quickActionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  quickActionDesc: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.sm,
  },
  issuesList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.section,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    ...SHADOWS.sm,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default CommunityHomeScreen;
