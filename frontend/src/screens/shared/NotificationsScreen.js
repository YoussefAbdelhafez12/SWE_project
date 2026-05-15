import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { COLORS, RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unread_count || 0);
    } catch (error) {
      console.error('Notifications error:', error);
    } finally { setRefreshing(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) { console.error(error); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) { console.error(error); }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'assignment': return { icon: 'person-add', color: COLORS.info };
      case 'status_change': return { icon: 'swap-horizontal', color: COLORS.accent };
      case 'comment': return { icon: 'chatbubble', color: COLORS.success };
      default: return { icon: 'notifications', color: COLORS.primary };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 80 }} />}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const config = getNotifIcon(item.type);
          return (
            <TouchableOpacity
              style={[styles.notifCard, !item.is_read && styles.notifUnread]}
              onPress={() => {
                markRead(item.id);
                if (item.issue_id) navigation.navigate('IssueDetail', { issueId: item.issue_id });
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${config.color}15` }]}>
                <Ionicons name={config.icon} size={20} color={config.color} />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.notifTime}>
                  {new Date(item.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {!item.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
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
  markAllText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.accent },
  list: { padding: SPACING.lg, paddingBottom: SPACING.section },
  notifCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  notifUnread: { backgroundColor: COLORS.primarySoft, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  notifBody: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
  notifTime: { fontSize: FONTS.sizes.xs, color: COLORS.textTertiary, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: SPACING.sm },
  emptyView: { alignItems: 'center', paddingVertical: SPACING.section * 2 },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textTertiary, marginTop: SPACING.md },
});

export default NotificationsScreen;
