import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { COLORS, RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const roleLabels = {
    community_member: 'Community Member',
    facility_manager: 'Facility Manager',
    worker: 'Worker',
    admin: 'Administrator',
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon.') },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('Notifications') },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'About CampusCare', onPress: () => Alert.alert('CampusCare', 'Version 1.0.0\nGIU Facility Management System\n\n© 2026 German International University') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient colors={COLORS.gradientPrimary} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="ribbon-outline" size={14} color="#FFF" />
            <Text style={styles.roleText}>{roleLabels[user?.role] || user?.role}</Text>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
              <View style={styles.menuIconCircle}>
                <Ionicons name={item.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <Button
            title="Log Out"
            variant="danger"
            onPress={handleLogout}
            icon="log-out-outline"
          />
        </View>

        <Text style={styles.version}>CampusCare v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 80, paddingBottom: SPACING.xxxl, alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.lg, marginBottom: SPACING.lg,
  },
  userName: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: '#FFF' },
  userEmail: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginTop: SPACING.md, gap: 6,
  },
  roleText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: '#FFF' },
  menuSection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xxl },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  menuIconCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  menuLabel: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  logoutSection: { paddingHorizontal: SPACING.xxl, marginTop: SPACING.xxxl },
  version: { textAlign: 'center', fontSize: FONTS.sizes.xs, color: COLORS.textTertiary, marginTop: SPACING.xl, paddingBottom: SPACING.section },
});

export default ProfileScreen;
