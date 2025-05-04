import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { t } from '../../i18n';
import { AdminButton } from '../../components/AdminAccess';
import { AdminNavigationProp, Promotion } from '../../types/navigation';
import { formatDate } from '../../utils/date';

export default function PromotionsManagementScreen() {
  const navigation = useNavigation<AdminNavigationProp>();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch promotions
      const mockPromotions: Promotion[] = [
        {
          id: '1',
          code: 'SUMMER2024',
          description: 'Summer Special Discount',
          discountPercentage: 20,
          startDate: '2024-06-01',
          endDate: '2024-08-31',
          isActive: true,
          maxUses: 1000,
          currentUses: 450,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      setPromotions(mockPromotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPromotions();
  };

  const handleCreatePromotion = () => {
    navigation.navigate('PromotionsCreate');
  };

  const handleEditPromotion = (promotionId: string) => {
    navigation.navigate('PromotionsEdit', { promotionId });
  };

  const renderPromotionItem = ({ item }: { item: Promotion }) => (
    <View style={styles.promotionItem}>
      <View style={styles.promotionHeader}>
        <Text style={styles.promotionCode}>{item.code}</Text>
        <Text style={[
          styles.promotionStatus,
          { color: item.isActive ? colors.success : colors.error }
        ]}>
          {item.isActive ? t('admin.promotions.active') : t('admin.promotions.inactive')}
        </Text>
      </View>
      
      <Text style={styles.promotionDescription}>{item.description}</Text>
      
      <View style={styles.promotionDetails}>
        <Text style={styles.promotionDetail}>
          {t('admin.promotions.discount')}: {item.discountPercentage}%
        </Text>
        <Text style={styles.promotionDetail}>
          {t('admin.promotions.uses')}: {item.currentUses}/{item.maxUses}
        </Text>
        <Text style={styles.promotionDetail}>
          {t('admin.promotions.validUntil')}: {formatDate(item.endDate)}
        </Text>
      </View>

      <AdminButton
        title={t('admin.actions.edit')}
        onPress={() => handleEditPromotion(item.id)}
        variant="secondary"
        icon="edit"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('admin.promotions.title')}</Text>
        <AdminButton
          title={t('admin.promotions.create')}
          onPress={handleCreatePromotion}
          variant="primary"
          icon="plus"
        />
      </View>

      <FlatList
        data={promotions}
        renderItem={renderPromotionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('admin.promotions.empty')}</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  list: {
    padding: spacing.screenPadding,
  },
  promotionItem: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  promotionCode: {
    ...typography.h4,
    color: colors.text,
  },
  promotionStatus: {
    ...typography.caption,
    fontWeight: '600',
  },
  promotionDescription: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  promotionDetails: {
    marginBottom: spacing.md,
  },
  promotionDetail: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
}); 