import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import api from '../../config/api';
import { COLORS, RADIUS, FONTS, SPACING, SHADOWS, STATUS_CONFIG } from '../../constants/theme';

const IssueDetailScreen = ({ route, navigation }) => {
  const { issueId } = route.params;
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIssueDetail();
  }, [issueId]);

  const fetchIssueDetail = async () => {
    try {
      const res = await api.get(`/issues/${issueId}`);
      const data = res.data.data;
      setIssue(data.issue);
      setHistory(data.history || []);
      setComments(data.comments || []);
      setPhotos(data.photos || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load issue details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setSubmitting(true);
      await api.put(`/issues/${issueId}/status`, {
        status: newStatus,
        comment: `Status changed to ${newStatus}`
      });
      await fetchIssueDetail();
      Alert.alert('Success', `Issue marked as ${newStatus.replace('_', ' ')}.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = () => {
    navigation.navigate('AssignWorker', { issueId: issue.id, currentWorkerId: issue.assigned_to });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      await api.post(`/issues/${issueId}/comments`, { text: newComment.trim() });
      setNewComment('');
      await fetchIssueDetail();
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!issue) return null;

  const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.pending;
  const isFM = user?.role === 'facility_manager' || user?.role === 'admin';
  const isWorker = user?.role === 'worker';
  const isAssignedWorker = isWorker && issue.assigned_to === user?.id;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Issue Details</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Photo */}
        {issue.photo_url && (
          <Image source={{ uri: issue.photo_url }} style={styles.mainPhoto} />
        )}

        {/* Tracking ID */}
        <View style={styles.trackingRow}>
          <Text style={styles.trackingLabel}>Tracking ID</Text>
          <Text style={styles.trackingValue}>#{issue.tracking_id}</Text>
        </View>

        {/* Title & Description */}
        <Text style={styles.issueTitle}>{issue.title}</Text>
        {issue.description && <Text style={styles.issueDesc}>{issue.description}</Text>}

        {/* Info Cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="folder-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{issue.category?.name || 'N/A'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>
              {issue.location_type === 'indoor'
                ? `${issue.building || ''} ${issue.room_floor || ''}`
                : issue.location_description || 'Outdoor'}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Submitted by</Text>
            <Text style={styles.infoValue}>{issue.submitter?.name || 'N/A'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Assigned Worker */}
        {issue.worker && (
          <View style={styles.assignedCard}>
            <Ionicons name="person-circle" size={36} color={COLORS.primary} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={styles.assignedLabel}>Assigned Worker</Text>
              <Text style={styles.assignedName}>{issue.worker.name}</Text>
            </View>
            {isFM && (
              <TouchableOpacity onPress={handleAssign}>
                <Ionicons name="swap-horizontal" size={20} color={COLORS.accent} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Status Timeline */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Timeline</Text>
            {history.map((h, idx) => (
              <View key={h.id} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: STATUS_CONFIG[h.new_status]?.color || COLORS.textTertiary }]} />
                {idx < history.length - 1 && <View style={styles.timelineLine} />}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{STATUS_CONFIG[h.new_status]?.label || h.new_status}</Text>
                  <Text style={styles.timelineComment}>{h.comment}</Text>
                  <Text style={styles.timelineTime}>
                    {new Date(h.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {h.changed_by_user && ` • ${h.changed_by_user.name}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Comments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
          {comments.map((c) => (
            <View key={c.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Ionicons name="person-circle" size={28} color={COLORS.textTertiary} />
                <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                  <Text style={styles.commentName}>{c.user?.name}</Text>
                  <Text style={styles.commentTime}>
                    {new Date(c.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{c.user?.role?.replace('_', ' ')}</Text>
                </View>
              </View>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          ))}

          {/* Add Comment */}
          {(isFM || isAssignedWorker) && (
            <View style={styles.commentInput}>
              <TextInput
                style={styles.commentInputField}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                placeholderTextColor={COLORS.textTertiary}
                multiline
              />
              <TouchableOpacity onPress={handleAddComment} disabled={submitting || !newComment.trim()} style={styles.sendBtn}>
                <Ionicons name="send" size={20} color={newComment.trim() ? COLORS.primary : COLORS.textTertiary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Resolution Photos */}
        {photos.filter(p => p.type === 'resolution').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resolution Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {photos.filter(p => p.type === 'resolution').map((p) => (
                <Image key={p.id} source={{ uri: p.photo_url }} style={styles.resPhoto} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isFM && !issue.assigned_to && issue.status === 'pending' && (
            <Button title="Assign Worker" onPress={handleAssign} icon="person-add-outline" style={{ marginBottom: SPACING.md }} />
          )}
          {isFM && issue.status === 'resolved' && (
            <Button title="Close Issue" onPress={() => handleStatusUpdate('closed')} variant="success" icon="checkmark-done-outline" loading={submitting} style={{ marginBottom: SPACING.md }} />
          )}
          {isAssignedWorker && issue.status === 'assigned' && (
            <Button title="Mark In Progress" onPress={() => handleStatusUpdate('in_progress')} icon="construct-outline" loading={submitting} style={{ marginBottom: SPACING.md }} />
          )}
          {isAssignedWorker && issue.status === 'in_progress' && (
            <Button title="Mark as Resolved" onPress={() => handleStatusUpdate('resolved')} variant="success" icon="checkmark-circle-outline" loading={submitting} style={{ marginBottom: SPACING.md }} />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: SPACING.md, paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: '700', marginLeft: 4 },
  scroll: { paddingBottom: SPACING.section * 2 },
  mainPhoto: { width: '100%', height: 250, resizeMode: 'cover' },
  trackingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surfaceAlt,
  },
  trackingLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary, fontWeight: '500' },
  trackingValue: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '700', fontFamily: 'monospace' },
  issueTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, paddingHorizontal: SPACING.xxl, marginTop: SPACING.xl },
  issueDesc: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 22, paddingHorizontal: SPACING.xxl, marginTop: SPACING.sm },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, marginTop: SPACING.xl, gap: SPACING.sm },
  infoCard: {
    width: '48%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, ...SHADOWS.sm,
  },
  infoLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary, marginTop: SPACING.xs },
  infoValue: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  assignedCard: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl, backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  assignedLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary },
  assignedName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.primary },
  section: { paddingHorizontal: SPACING.xxl, marginTop: SPACING.xxxl },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  timelineItem: { flexDirection: 'row', marginBottom: SPACING.lg, position: 'relative' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, marginRight: SPACING.md },
  timelineLine: { position: 'absolute', left: 5, top: 18, width: 2, height: '100%', backgroundColor: COLORS.border },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  timelineComment: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  timelineTime: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary, marginTop: 4 },
  commentCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  commentName: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  commentTime: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary },
  roleBadge: { backgroundColor: COLORS.surfaceAlt, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  roleText: { fontSize: 10, fontWeight: '600', color: COLORS.textTertiary, textTransform: 'capitalize' },
  commentText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 20 },
  commentInput: {
    flexDirection: 'row', alignItems: 'flex-end', backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.xl, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  commentInputField: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, maxHeight: 80, paddingVertical: SPACING.sm },
  sendBtn: { padding: SPACING.sm },
  resPhoto: { width: 160, height: 120, borderRadius: RADIUS.lg, marginRight: SPACING.md },
  actions: { paddingHorizontal: SPACING.xxl, marginTop: SPACING.xxxl },
});

export default IssueDetailScreen;
