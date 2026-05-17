import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import IssueCard from '../../components/IssueCard';
import { StatsCard, StatusFilter, EmptyState } from '../../components/SharedComponents';
import api from '../../config/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const ManagerDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ pending: 0, assigned: 0, in_progress: 0, pending_review: 0, resolved: 0, closed: 0 });
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const [issuesRes, statsRes] = await Promise.all([
        api.get('/issues', { params }),
        api.get('/issues/stats'),
      ]);

      setIssues(issuesRes.data.data.issues || []);
      setStats(statsRes.data.data.byStatus || {});
    } catch (error) {
      console.error('FM fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchData();
    const unsub = navigation.addListener('focus', fetchData);
    return unsub;
  }, [navigation, fetchData]);

  const firstName = user?.name?.split(' ')[0] || 'Manager';

  return (
    <View style={styles.container}>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IssueCard
            issue={item}
            showAssignee
            onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
          />
        )}
        ListHeaderComponent={
          <>
            <LinearGradient colors={COLORS.gradientDark} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.greeting}>Operations Dashboard</Text>
                  <Text style={styles.userName}>Hi, {firstName} 👋</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
                  <Ionicons name="notifications-outline" size={22} color="#FFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatsCard icon="time-outline" label="Pending" value={stats.pending || 0} color={COLORS.warning} />
              <StatsCard icon="person-outline" label="Assigned" value={stats.assigned || 0} color={COLORS.info} />
              <StatsCard icon="construct-outline" label="Active" value={stats.in_progress || 0} color="#3B82F6" />
              <StatsCard icon="camera-outline" label="Review" value={stats.pending_review || 0} color="#8B5CF6" />
              <StatsCard icon="checkmark-circle-outline" label="Done" value={stats.resolved || 0} color={COLORS.success} />
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by title, ID, or description..."
                  placeholderTextColor={COLORS.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={fetchData}
                  returnKeyType="search"
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => { setSearchQuery(''); }}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <StatusFilter selected={statusFilter} onSelect={setStatusFilter} counts={stats} />
          </>
        }
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={!loading && <EmptyState icon="clipboard-outline" title="No Issues" message="No issues match your filters." />}
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
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greeting: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  userName: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: '#FFF', marginTop: 4 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, marginTop: -SPACING.lg, marginBottom: SPACING.md },
  searchRow: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, height: 48,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, marginLeft: SPACING.sm },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.section },
});

export default ManagerDashboardScreen;
