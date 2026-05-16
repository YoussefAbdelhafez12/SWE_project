import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS, SPACING, SHADOWS, STATUS_CONFIG } from '../constants/theme';

// Status filter chips
export const StatusFilter = ({ selected, onSelect, counts = {} }) => {
  const statuses = [
    { key: null, label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'pending_review', label: 'Review' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
  ];

  return (
    <View style={styles.filterRow}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={statuses}
        keyExtractor={(item) => item.key || 'all'}
        renderItem={({ item }) => {
          const isActive = selected === item.key;
          const config = item.key ? STATUS_CONFIG[item.key] : null;
          const count = item.key ? (counts[item.key] || 0) : Object.values(counts).reduce((a, b) => a + b, 0);

          return (
            <TouchableOpacity
              style={[
                styles.chip,
                isActive && { backgroundColor: config?.color || COLORS.primary },
              ]}
              onPress={() => onSelect(item.key)}
              activeOpacity={0.7}
            >
              {item.key && (
                <Ionicons
                  name={config?.icon || 'ellipse'}
                  size={12}
                  color={isActive ? '#FFF' : config?.color || COLORS.textTertiary}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  isActive && { color: '#FFF' },
                  !isActive && item.key && { color: config?.color },
                ]}
              >
                {item.label}
              </Text>
              {count > 0 && (
                <View style={[styles.chipCount, isActive && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Text style={[styles.chipCountText, isActive && { color: '#FFF' }]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
      />
    </View>
  );
};

// Empty state component
export const EmptyState = ({ icon = 'document-text-outline', title, message, action }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <Ionicons name={icon} size={48} color={COLORS.textTertiary} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    {action}
  </View>
);

// Loading overlay
export const LoadingOverlay = ({ visible = false, message = 'Loading...' }) => {
  if (!visible) return null;
  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingCard}>
        <View style={styles.spinner} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </View>
  );
};

// Stats card for dashboard
export const StatsCard = ({ icon, label, value, color = COLORS.primary, bgColor }) => (
  <View style={[styles.statsCard, bgColor && { backgroundColor: bgColor }]}>
    <View style={[styles.statsIconCircle, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel} numberOfLines={1}>{label}</Text>
  </View>
);

// Section header
export const SectionHeader = ({ title, action, actionLabel }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={action}>
        <Text style={styles.sectionAction}>{actionLabel || 'See All'}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  // Filter chips
  filterRow: {
    marginBottom: SPACING.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipCount: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  chipCountText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.section * 2,
    paddingHorizontal: SPACING.xxxl,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  loadingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    ...SHADOWS.xl,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.border,
    borderTopColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Stats card
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 3,
    ...SHADOWS.sm,
  },
  statsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 1,
  },
  statsLabel: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionAction: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
