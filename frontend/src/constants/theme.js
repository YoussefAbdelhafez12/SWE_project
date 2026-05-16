// CampusCare Design System — Theme Constants
// Modern, clean design inspired by GIU branding

export const COLORS = {
  // Primary palette — Deep blue inspired by GIU
  primary: '#1B4965',
  primaryLight: '#2D6A8F',
  primaryDark: '#0F2D3D',
  primarySoft: '#E8F0F5',

  // Accent — Vibrant teal/green
  accent: '#00B4D8',
  accentLight: '#48CAE4',
  accentDark: '#0096B7',
  accentSoft: '#E0F7FA',

  // Success / Resolved
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',

  // Warning / Pending
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  // Error / Urgent
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',

  // Info / Assigned
  info: '#6366F1',
  infoLight: '#EEF2FF',
  infoDark: '#4F46E5',

  // Neutrals
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E5E7EB',

  // Text
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  textLink: '#1B4965',

  // Status Colors
  statusPending: '#F59E0B',
  statusAssigned: '#6366F1',
  statusInProgress: '#3B82F6',
  statusPendingReview: '#8B5CF6',
  statusResolved: '#10B981',
  statusClosed: '#6B7280',

  // Gradients (as arrays)
  gradientPrimary: ['#1B4965', '#2D6A8F'],
  gradientAccent: ['#00B4D8', '#48CAE4'],
  gradientDark: ['#0F172A', '#1E293B'],
  gradientSuccess: ['#10B981', '#34D399'],
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const STATUS_CONFIG = {
  pending: {
    color: COLORS.statusPending,
    bgColor: COLORS.warningLight,
    label: 'Pending',
    icon: 'time-outline',
  },
  assigned: {
    color: COLORS.statusAssigned,
    bgColor: COLORS.infoLight,
    label: 'Assigned',
    icon: 'person-outline',
  },
  in_progress: {
    color: COLORS.statusInProgress,
    bgColor: '#DBEAFE',
    label: 'In Progress',
    icon: 'construct-outline',
  },
  pending_review: {
    color: COLORS.statusPendingReview,
    bgColor: '#EDE9FE',
    label: 'Pending Review',
    icon: 'camera-outline',
  },
  resolved: {
    color: COLORS.statusResolved,
    bgColor: COLORS.successLight,
    label: 'Resolved',
    icon: 'checkmark-circle-outline',
  },
  closed: {
    color: COLORS.statusClosed,
    bgColor: '#F3F4F6',
    label: 'Closed',
    icon: 'lock-closed-outline',
  },
};

export const CATEGORY_ICONS = {
  'Electrical': 'flash-outline',
  'Plumbing': 'water-outline',
  'Cleaning': 'sparkles-outline',
  'Furniture': 'bed-outline',
  'HVAC': 'thermometer-outline',
  'Safety': 'shield-checkmark-outline',
  'IT & Network': 'wifi-outline',
  'Other': 'ellipsis-horizontal-outline',
};
