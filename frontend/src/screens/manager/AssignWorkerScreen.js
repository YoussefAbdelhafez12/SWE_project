import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { COLORS, RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';

const AssignWorkerScreen = ({ route, navigation }) => {
  const { issueId, currentWorkerId } = route.params;
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/manager/workers');
      setWorkers(res.data.data.workers || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load workers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (workerId, workerName) => {
    Alert.alert(
      'Assign Worker',
      `Assign this issue to ${workerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async () => {
            try {
              setAssigning(workerId);
              await api.put(`/issues/${issueId}/assign`, { worker_id: workerId });
              Alert.alert('Success', `Issue assigned to ${workerName}.`, [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to assign worker.');
            } finally {
              setAssigning(null);
            }
          },
        },
      ]
    );
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return COLORS.success;
      case 'busy': return COLORS.warning;
      case 'off_duty': return COLORS.textTertiary;
      default: return COLORS.textTertiary;
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Assign Worker</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isCurrent = item.id === currentWorkerId;
          return (
            <TouchableOpacity
              style={[styles.workerCard, isCurrent && styles.workerCardCurrent]}
              onPress={() => handleAssign(item.id, item.name)}
              disabled={assigning === item.id || item.status === 'inactive'}
              activeOpacity={0.7}
            >
              <View style={styles.workerAvatar}>
                <Ionicons name="person" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.workerInfo}>
                <View style={styles.workerNameRow}>
                  <Text style={styles.workerName}>{item.name}</Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentText}>Current</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.workerEmail}>{item.email}</Text>
                <View style={styles.workerMeta}>
                  <View style={[styles.availDot, { backgroundColor: getAvailabilityColor(item.availability) }]} />
                  <Text style={styles.availText}>{item.availability?.replace('_', ' ')}</Text>
                  <Text style={styles.metaSeparator}>•</Text>
                  <Text style={styles.loadText}>{item.active_issues} active issue{item.active_issues !== 1 ? 's' : ''}</Text>
                </View>
              </View>
              {assigning === item.id ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="arrow-forward-circle-outline" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No workers available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  list: { padding: SPACING.lg },
  workerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  workerCardCurrent: { borderWidth: 2, borderColor: COLORS.accent },
  workerAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  workerInfo: { flex: 1 },
  workerNameRow: { flexDirection: 'row', alignItems: 'center' },
  workerName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  currentBadge: { backgroundColor: COLORS.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full, marginLeft: 8 },
  currentText: { fontSize: 10, fontWeight: '700', color: COLORS.accent },
  workerEmail: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary, marginTop: 2 },
  workerMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  availDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  availText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '500', textTransform: 'capitalize' },
  metaSeparator: { marginHorizontal: 8, color: COLORS.textTertiary },
  loadText: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary },
  emptyView: { alignItems: 'center', padding: SPACING.section },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textTertiary },
});

export default AssignWorkerScreen;
