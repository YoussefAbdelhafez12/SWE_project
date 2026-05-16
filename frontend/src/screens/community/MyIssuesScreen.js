import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IssueCard from '../../components/IssueCard';
import { StatusFilter, EmptyState } from '../../components/SharedComponents';
import api from '../../config/api';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const MyIssuesScreen = ({ navigation }) => {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});

  const fetchIssues = useCallback(async () => {
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/issues/my', { params });
      const fetched = res.data.data.issues || [];
      setIssues(fetched);

      // Count by status
      const c = {};
      fetched.forEach(i => { c[i.status] = (c[i.status] || 0) + 1; });
      setCounts(c);
    } catch (error) {
      console.error('Fetch issues error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchIssues();
    const unsub = navigation.addListener('focus', fetchIssues);
    return unsub;
  }, [navigation, fetchIssues]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Submissions</Text>
        <Text style={styles.subtitle}>{issues.length} issue{issues.length !== 1 ? 's' : ''} reported</Text>
      </View>

      <StatusFilter selected={statusFilter} onSelect={setStatusFilter} counts={counts} />

      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IssueCard
            issue={item}
            onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchIssues(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              icon="document-text-outline"
              title="No Issues Found"
              message={statusFilter ? 'No issues with this status.' : 'You haven\'t submitted any issues yet.'}
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.xxl,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textTertiary, marginTop: 2 },
  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.section },
});

export default MyIssuesScreen;
