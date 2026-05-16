import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS, SHADOWS } from '../constants/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: COLORS.primarySoft,
          text: COLORS.primary,
          border: 'transparent',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: COLORS.primary,
          border: COLORS.border,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: COLORS.primary,
          border: 'transparent',
        };
      case 'danger':
        return {
          bg: COLORS.error,
          text: '#FFFFFF',
          border: 'transparent',
        };
      case 'success':
        return {
          bg: COLORS.success,
          text: '#FFFFFF',
          border: 'transparent',
        };
      default:
        return {
          bg: COLORS.primary,
          text: '#FFFFFF',
          border: 'transparent',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: FONTS.sizes.sm };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 28, fontSize: FONTS.sizes.lg };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24, fontSize: FONTS.sizes.md };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : 'auto',
        },
        variant === 'primary' && SHADOWS.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={18} color={variantStyles.text} style={{ marginRight: 8 }} />
          )}
          <Text style={[styles.text, { color: variantStyles.text, fontSize: sizeStyles.fontSize }, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={18} color={variantStyles.text} style={{ marginLeft: 8 }} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default Button;
