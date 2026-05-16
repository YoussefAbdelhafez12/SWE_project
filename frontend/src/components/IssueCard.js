import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS, SPACING, SHADOWS, STATUS_CONFIG, CATEGORY_ICONS } from '../constants/theme';

const IssueCard = ({ issue, onPress, showAssignee = false }) => {
  const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.pending;
  const categoryIcon = CATEGORY_ICONS[issue.category?.name] || 'ellipsis-horizontal-outline';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {/* Thumbnail */}
        {issue.photo_url && (
          <Image source={{ uri: issue.photo_url }} style={styles.thumbnail} />
        )}
        {!issue.photo_url && (
          <View style={[styles.thumbnail, styles.placeholderThumb]}>
            <Ionicons name={categoryIcon} size={24} color={COLORS.textTertiary} />
          </View>
        )}

        {/* Content */}
        <View style={styles.info}>
          {/* Category tag */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryTag}>
              <Ionicons name={categoryIcon} size={12} color={COLORS.primary} />
              <Text style={styles.categoryText}>{issue.category?.name || 'General'}</Text>
            </View>
            <Text style={styles.timeText}>{formatDate(issue.created_at)}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>{issue.title}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={COLORS.textTertiary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {issue.location_type === 'indoor'
                ? `${issue.building || ''} ${issue.room_floor ? `• ${issue.room_floor}` : ''}`
                : issue.location_description || 'Outdoor'
              }
            </Text>
          </View>

          {/* Bottom row */}
          <View style={styles.bottomRow}>
            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>

            {/* Assignee */}
            {showAssignee && issue.worker && (
              <View style={styles.assigneeRow}>
                <Ionicons name="person-circle-outline" size={14} color={COLORS.textTertiary} />
                <Text style={styles.assigneeText}>{issue.worker?.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} style={styles.chevron} />
      </View>

      {/* Tracking ID */}
      <View style={styles.trackingRow}>
        <Text style={styles.trackingId}>#{issue.tracking_id}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
  },
  placeholderThumb: {
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  categoryText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  timeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  locationText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    marginLeft: 4,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    marginLeft: 4,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    marginLeft: 4,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: SPACING.xs,
  },
  trackingRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
    backgroundColor: COLORS.surfaceAlt,
  },
  trackingId: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
});

export default IssueCard;
