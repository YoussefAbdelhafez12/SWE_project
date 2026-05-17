import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import IssueCard from '../../components/IssueCard';
import { StatsCard, EmptyState } from '../../components/SharedComponents';
import api from '../../config/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const WorkerDashboardScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, in_progress: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/issues/assigned');
      const fetched = res.data.data.issues || [];
      setIssues(fetched);

      const counts = { assigned: 0, in_progress: 0 };
      fetched.forEach(i => { if (counts[i.status] !== undefined) counts[i.status]++; });
      setStats(counts);
    } catch (error) {
      console.error('Worker fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const unsub = navigation.addListener('focus', fetchData);
    return unsub;
  }, [navigation, fetchData]);

  const toggleAvailability = async () => {
    const statuses = ['available', 'busy', 'off_duty'];
    const current = user?.availability || 'available';
    const nextIdx = (statuses.indexOf(current) + 1) % statuses.length;
    const next = statuses[nextIdx];

    try {
      await api.put('/auth/profile', { availability: next });
      await updateUser({ availability: next });
    } catch (error) {
      console.error('Update availability error:', error);
    }
  };

  const getAvailIcon = () => {
    switch (user?.availability) {
      case 'busy': return { icon: 'pause-circle', color: COLORS.warning };
      case 'off_duty': return { icon: 'moon', color: COLORS.textTertiary };
      default: return { icon: 'checkmark-circle', color: COLORS.success };
    }
  };

  const availConfig = getAvailIcon();

  return (
    <View style={styles.container}>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IssueCard
            issue={item}
            onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
          />
        )}
        ListHeaderComponent={
          <>
            <LinearGradient colors={['#0F172A', '#1E3A5F']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.greeting}>Worker Dashboard</Text>
                  <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Worker'}</Text>
                </View>
                <TouchableOpacity style={styles.availBtn} onPress={toggleAvailability}>
                  <Ionicons name={availConfig.icon} size={20} color={availConfig.color} />
                  <Text style={[styles.availText, { color: availConfig.color }]}>
                    {(user?.availability || 'available').replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={styles.statsRow}>
              <StatsCard icon="person-outline" label="Assigned" value={stats.assigned} color={COLORS.info} />
              <StatsCard icon="construct-outline" label="In Progress" value={stats.in_progress} color="#3B82F6" />
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Active Tasks</Text>
              <TouchableOpacity onPress={() => navigation.navigate('WorkerHistory')}>
                <Text style={styles.seeAll}>History →</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={!loading && <EmptyState icon="checkmark-done-outline" title="All Clear!" message="No active tasks assigned to you." />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60, paddingBottom: SPACING.xxxl, paddingHorizontal: SPACING.xxl,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  userName: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: '#FFF', marginTop: 4 },
  availBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, gap: 6,
  },
  availText: { fontSize: FONTS.sizes.sm, fontWeight: '600', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginTop: -SPACING.lg, marginBottom: SPACING.md },
  sectionHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.accent },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.section },
});

export default WorkerDashboardScreen;
