import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS, RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';

const ROLES = [
  { key: 'community_member', label: 'Community Member', icon: 'people-outline', desc: 'Report campus issues' },
  { key: 'facility_manager', label: 'Facility Manager', icon: 'business-outline', desc: 'Manage & assign issues' },
  { key: 'worker', label: 'Worker', icon: 'hammer-outline', desc: 'Resolve assigned tasks' },
];

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('community_member');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if ((role === 'facility_manager' || role === 'worker') && !employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required for staff';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await register(name.trim(), email.trim(), password, role, employeeId.trim());
    setLoading(false);

    if (result.success) {
      if (role === 'facility_manager') {
        Alert.alert('Registration Submitted', result.message, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={COLORS.gradientPrimary}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join the CampusCare community</Text>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formArea}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Role Selection */}
          <Text style={styles.sectionLabel}>I am a...</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleCard, role === r.key && styles.roleCardActive]}
                onPress={() => setRole(r.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.roleIconCircle, role === r.key && styles.roleIconCircleActive]}>
                  <Ionicons name={r.icon} size={22} color={role === r.key ? '#FFF' : COLORS.textTertiary} />
                </View>
                <Text style={[styles.roleLabel, role === r.key && styles.roleLabelActive]}>{r.label}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
                {role === r.key && (
                  <View style={styles.roleCheck}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            autoCapitalize="words"
            icon="person-outline"
            error={errors.name}
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@giu-uni.de"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            error={errors.email}
          />

          {(role === 'facility_manager' || role === 'worker') && (
            <Input
              label="Employee ID"
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="Enter your employee ID"
              icon="id-card-outline"
              error={errors.employeeId}
            />
          )}

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 6 characters"
            secureTextEntry
            icon="lock-closed-outline"
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            secureTextEntry
            icon="lock-closed-outline"
            error={errors.confirmPassword}
          />

          {role === 'facility_manager' && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.info} />
              <Text style={styles.infoText}>
                FM team accounts require admin approval before activation.
              </Text>
            </View>
          )}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            icon="person-add-outline"
            style={{ marginTop: SPACING.lg }}
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    height: 200,
    justifyContent: 'flex-end',
    paddingBottom: 50,
    position: 'relative',
  },
  headerContent: {
    paddingHorizontal: SPACING.xxl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  headerCurve: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  formArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.section,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
    ...SHADOWS.sm,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  roleIconCircleActive: {
    backgroundColor: COLORS.primary,
  },
  roleLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  roleLabelActive: {
    color: COLORS.primary,
  },
  roleDesc: {
    fontSize: 9,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  roleCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  loginLinkText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  loginLinkBold: {
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default RegisterScreen;
