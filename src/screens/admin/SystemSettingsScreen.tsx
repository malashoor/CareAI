import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { AccessibleContainer } from '../../components/AccessibleContainer';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleInput } from '../../components/AccessibleInput';
import { AccessibleSwitch } from '../../components/AccessibleSwitch';
import { accessibility } from '../../utils/accessibility';
import { t } from '../../i18n';
import { AdminNavigationProp, SystemSettings } from '../../types/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export default function SystemSettingsScreen() {
  const navigation = useNavigation<AdminNavigationProp>();
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxPromotionsPerUser: 5,
    maxDiscountsPerUser: 3,
    defaultPromotionDuration: 30,
    defaultDiscountDuration: 30,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(t('admin.settings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert(settings);

      if (error) throw error;
      // Show success message
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(t('admin.settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AccessibleContainer style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </AccessibleContainer>
    );
  }

  return (
    <AccessibleContainer
      style={styles.container}
      accessibilityLabel={t('admin.settings.title')}
      accessibilityRole="main"
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text 
              style={styles.errorText}
              {...accessibility.getAccessibilityProps({
                label: error,
                role: 'alert'
              })}
            >
              {error}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            {...accessibility.getAccessibilityProps({
              label: t('admin.settings.systemControls'),
              role: 'header'
            })}
          >
            {t('admin.settings.systemControls')}
          </Text>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>{t('admin.settings.maintenanceMode')}</Text>
            <AccessibleSwitch
              value={settings.maintenanceMode}
              onValueChange={(value) => setSettings({ ...settings, maintenanceMode: value })}
              accessibilityLabel={t('admin.settings.maintenanceMode')}
              accessibilityHint="Toggle maintenance mode"
            />
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>{t('admin.settings.allowNewRegistrations')}</Text>
            <AccessibleSwitch
              value={settings.allowNewRegistrations}
              onValueChange={(value) => setSettings({ ...settings, allowNewRegistrations: value })}
              accessibilityLabel={t('admin.settings.allowNewRegistrations')}
              accessibilityHint="Toggle new user registrations"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            {...accessibility.getAccessibilityProps({
              label: t('admin.settings.limits'),
              role: 'header'
            })}
          >
            {t('admin.settings.limits')}
          </Text>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>{t('admin.settings.maxPromotionsPerUser')}</Text>
            <AccessibleInput
              label={t('admin.settings.maxPromotionsPerUser')}
              value={settings.maxPromotionsPerUser.toString()}
              onChangeText={(text) => setSettings({ ...settings, maxPromotionsPerUser: parseInt(text) || 0 })}
              keyboardType="numeric"
              style={styles.numericInput}
            />
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>{t('admin.settings.maxDiscountsPerUser')}</Text>
            <AccessibleInput
              label={t('admin.settings.maxDiscountsPerUser')}
              value={settings.maxDiscountsPerUser.toString()}
              onChangeText={(text) => setSettings({ ...settings, maxDiscountsPerUser: parseInt(text) || 0 })}
              keyboardType="numeric"
              style={styles.numericInput}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text 
            style={styles.sectionTitle}
            {...accessibility.getAccessibilityProps({
              label: t('admin.settings.durations'),
              role: 'header'
            })}
          >
            {t('admin.settings.durations')}
          </Text>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>{t('admin.settings.defaultPromotionDuration')}</Text>
            <AccessibleInput
              label={t('admin.settings.defaultPromotionDuration')}
              value={settings.defaultPromotionDuration.toString()}
              onChangeText={(text) => setSettings({ ...settings, defaultPromotionDuration: parseInt(text) || 0 })}
              keyboardType="numeric"
              style={styles.numericInput}
            />
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingLabel}>{t('admin.settings.defaultDiscountDuration')}</Text>
            <AccessibleInput
              label={t('admin.settings.defaultDiscountDuration')}
              value={settings.defaultDiscountDuration.toString()}
              onChangeText={(text) => setSettings({ ...settings, defaultDiscountDuration: parseInt(text) || 0 })}
              keyboardType="numeric"
              style={styles.numericInput}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <AccessibleButton
            title={isSaving ? t('admin.settings.saving') : t('admin.settings.save')}
            onPress={handleSave}
            variant="primary"
            disabled={isSaving}
            accessibilityLabel={isSaving ? t('admin.settings.saving') : t('admin.settings.save')}
            accessibilityHint="Save system settings"
          />
        </View>
      </ScrollView>
    </AccessibleContainer>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
  },
  numericInput: {
    width: 100,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: theme.typography.h3.fontSize,
    marginBottom: theme.spacing.md,
  },
  setting: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  settingLabel: {
    color: theme.colors.text,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
  },
}); 