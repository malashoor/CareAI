import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { AccessibleButton } from './AccessibleButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { t } from '../i18n';

interface AdminAccessProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminAccess: React.FC<AdminAccessProps> = ({ 
  children, 
  fallback = null 
}) => {
  const { user, isAdmin, loading } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      setIsVerifying(true);
      try {
        // Additional verification if needed
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulated delay
      } catch (error) {
        console.error('Admin access verification failed:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdminAccess();
  }, [user]);

  if (loading || isVerifying) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAdmin) {
    return fallback;
  }

  return <>{children}</>;
};

// Admin-specific components
export const AdminSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

export const AdminButton: React.FC<{
  onPress: () => void;
  title: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}> = ({ onPress, title, icon, variant = 'primary' }) => (
  <AccessibleButton
    onPress={onPress}
    title={title}
    icon={icon}
    variant={variant}
    accessibilityLabel={title}
    accessibilityHint={t('admin.buttonHint')}
  />
);

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
}); 