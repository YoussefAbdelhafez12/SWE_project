import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IssueCard from '../../components/IssueCard';
import { EmptyState } from '../../components/SharedComponents';
import api from '../../config/api';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const WorkerHistoryScreen = ({ navigation }) => {
  const [issues, setIssues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/issues/worker-history');
      setIssues(res.data.data.issues || []);
    } catch (error) {
      console.error('Worker history error:', error);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Completed Tasks</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IssueCard issue={item} onPress={() => navigation.navigate('IssueDetail', { issueId: item.id })} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={!loading && <EmptyState icon="archive-outline" title="No History" message="No completed tasks yet." />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  list: { padding: SPACING.lg, paddingBottom: SPACING.section },
});

export default WorkerHistoryScreen;
