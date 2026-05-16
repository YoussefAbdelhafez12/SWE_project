import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const PendingApprovalsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get('/admin/pending-approvals');
      setPending(res.data.data.users || []);
    } catch (error) {
      console.error('Fetch pending approvals error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    const unsub = navigation.addListener('focus', fetchPending);
    return unsub;
  }, [navigation, fetchPending]);

  const handleDecision = async (id, approved, userName) => {
    const action = approved ? 'approve' : 'reject';
    Alert.alert(
      approved ? 'Approve Account' : 'Reject Account',
      approved
        ? `Are you sure you want to approve "${userName}" as a Facility Manager?`
        : `Are you sure you want to reject "${userName}"'s registration?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: approved ? 'Approve' : 'Reject',
          style: approved ? 'default' : 'destructive',
          onPress: async () => {
            setProcessingId(id);
            try {
              await api.put(`/admin/approve/${id}`, { approved });
              Alert.alert(
                approved ? '✅ Approved!' : '❌ Rejected',
                approved
                  ? `${userName}'s account has been activated.`
                  : `${userName}'s registration has been rejected.`
              );
              await fetchPending();
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} the account. Please try again.`);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isProcessing = processingId === item.id;
    return (
      <View style={styles.card}>
        {/* Avatar / Initials */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardEmail}>{item.email}</Text>
          {item.employee_id && (
            <View style={styles.empRow}>
              <Ionicons name="id-card-outline" size={13} color={COLORS.textTertiary} />
              <Text style={styles.cardEmpId}> ID: {item.employee_id}</Text>
            </View>
          )}
          <Text style={styles.cardDate}>
            Registered: {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleDecision(item.id, true, item.name)}
                accessibilityLabel={`Approve ${item.name}`}
              >
                <Ionicons name="checkmark" size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleDecision(item.id, false, item.name)}
                accessibilityLabel={`Reject ${item.name}`}
              >
                <Ionicons name="close" size={18} color="#FFF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4C1D95', '#7C3AED']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerLabel}>Admin Panel</Text>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{pending.length} awaiting review</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchPending(); }}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="checkmark-done-circle-outline" size={60} color={COLORS.success} />
              <Text style={styles.emptyTitle}>All Clear!</Text>
              <Text style={styles.emptyMsg}>
                No pending Facility Manager registrations.
              </Text>
            </View>
          }
          ListHeaderComponent={
            pending.length > 0 && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.info} />
                <Text style={styles.infoText}>
                  Review each Facility Manager registration request and approve or reject it.
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60, paddingBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.xxl,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerLabel: {
    fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl, fontWeight: '800', color: '#FFF', marginTop: 4,
  },
  countBadge: {
    marginTop: SPACING.md, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  countText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: '#FFF' },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },

  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.section },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.infoLight, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.lg, gap: SPACING.sm,
  },
  infoText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.info, lineHeight: 18 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.md,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    ...SHADOWS.md,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: FONTS.sizes.md, fontWeight: '800', color: '#7C3AED' },

  cardInfo: { flex: 1 },
  cardName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  cardEmail: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  empRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardEmpId: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary },
  cardDate: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary, marginTop: 4 },

  cardActions: { flexDirection: 'column', gap: SPACING.sm, flexShrink: 0 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  approveBtn: { backgroundColor: COLORS.success },
  rejectBtn: { backgroundColor: COLORS.error },

  emptyBox: {
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.lg },
  emptyMsg: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 22 },
});

export default PendingApprovalsScreen;
