import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { AccessibleContainer } from '../../components/AccessibleContainer';
import { AccessibleButton } from '../../components/AccessibleButton';
import { AccessibleInput } from '../../components/AccessibleInput';
import { AccessibleModal } from '../../components/AccessibleModal';
import { accessibility } from '../../utils/accessibility';
import { t } from '../../i18n';
import { AdminNavigationProp, Discount } from '../../types/navigation';
import { formatDate } from '../../utils/date';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export default function DiscountsManagementScreen() {
  const navigation = useNavigation<AdminNavigationProp>();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  const isDiscountExpired = (discount: Discount) => {
    if (!discount.expiresAt) return false;
    return new Date(discount.expiresAt) < new Date();
  };

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = 
      discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isExpired = isDiscountExpired(discount);
    return matchesSearch && (showExpired || !isExpired);
  });

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement API call to fetch discounts
      const mockDiscounts: Discount[] = [
        {
          id: '1',
          code: 'SUMMER2024',
          description: 'Summer Special Discount',
          discountType: 'percentage',
          discountValue: 20,
          startDate: '2024-06-01',
          endDate: '2024-08-31',
          expiresAt: '2024-08-31',
          isActive: true,
          maxUses: 1000,
          currentUses: 450,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          conditions: {
            minPurchaseAmount: 50,
            maxDiscountAmount: 100,
          },
        },
        {
          id: '2',
          code: 'WINTER2023',
          description: 'Winter Special Discount',
          discountType: 'percentage',
          discountValue: 15,
          startDate: '2023-12-01',
          endDate: '2024-02-28',
          expiresAt: null,
          isActive: true,
          maxUses: 500,
          currentUses: 200,
          createdAt: '2023-11-01',
          updatedAt: '2023-11-01',
          conditions: {
            minPurchaseAmount: 30,
            maxDiscountAmount: 75,
          },
        },
      ];
      setDiscounts(mockDiscounts);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setError(t('admin.discounts.fetchError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDiscounts();
  };

  const handleCreateDiscount = () => {
    navigation.navigate('DiscountsCreate');
  };

  const handleEditDiscount = (discountId: string) => {
    navigation.navigate('DiscountsEdit', { discountId });
  };

  const handleDeleteDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDiscount) return;

    setIsDeleting(true);
    try {
      await supabase
        .from('discount_codes')
        .delete()
        .eq('id', selectedDiscount.id);

      setDiscounts(discounts.filter(d => d.id !== selectedDiscount.id));
      setShowDeleteModal(false);
      setSelectedDiscount(null);
    } catch (err) {
      console.error('Error deleting discount:', err);
      setError(t('admin.discounts.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDiscountItem = ({ item }: { item: Discount }) => {
    const isExpired = isDiscountExpired(item);

    return (
      <View 
        style={[
          styles.discountItem,
          isExpired && styles.expiredDiscount
        ]}
        {...accessibility.getAccessibilityProps({
          label: `${item.code} discount`,
          role: 'listitem'
        })}
      >
        <View style={styles.discountHeader}>
          <Text style={styles.discountCode}>{item.code}</Text>
          <View style={styles.statusContainer}>
            {isExpired && (
              <Text 
                style={[styles.discountStatus, { color: theme.colors.error }]}
                {...accessibility.getAccessibilityProps({
                  label: 'Expired',
                  role: 'status'
                })}
              >
                {t('admin.discounts.expired')}
              </Text>
            )}
            <Text 
              style={[
                styles.discountStatus,
                { color: item.isActive ? theme.colors.success : theme.colors.error }
              ]}
              {...accessibility.getAccessibilityProps({
                label: item.isActive ? 'Active' : 'Inactive',
                role: 'status'
              })}
            >
              {item.isActive ? t('admin.discounts.active') : t('admin.discounts.inactive')}
            </Text>
          </View>
        </View>
        
        <Text style={styles.discountDescription}>{item.description}</Text>
        
        <View style={styles.discountDetails}>
          <Text style={styles.discountDetail}>
            {t('admin.discounts.discount')}: {item.discountValue}{item.discountType === 'percentage' ? '%' : '$'}
          </Text>
          <Text style={styles.discountDetail}>
            {t('admin.discounts.uses')}: {item.currentUses}/{item.maxUses}
          </Text>
          {item.expiresAt ? (
            <Text style={styles.discountDetail}>
              {t('admin.discounts.validUntil')}: {formatDate(item.expiresAt)}
            </Text>
          ) : (
            <Text style={styles.discountDetail}>
              {t('admin.discounts.noExpiry')}
            </Text>
          )}
          {item.conditions?.minPurchaseAmount && (
            <Text style={styles.discountDetail}>
              Min Purchase: ${item.conditions.minPurchaseAmount}
            </Text>
          )}
          {item.conditions?.maxDiscountAmount && (
            <Text style={styles.discountDetail}>
              Max Discount: ${item.conditions.maxDiscountAmount}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <AccessibleButton
            title={t('admin.actions.edit')}
            onPress={() => handleEditDiscount(item.id)}
            variant="secondary"
            style={styles.actionButton}
            accessibilityLabel={t('admin.actions.edit')}
            accessibilityHint={`Edit ${item.code} discount`}
          />
          <AccessibleButton
            title={t('admin.actions.delete')}
            onPress={() => handleDeleteDiscount(item)}
            variant="danger"
            style={styles.actionButton}
            accessibilityLabel={t('admin.actions.delete')}
            accessibilityHint={`Delete ${item.code} discount`}
          />
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <AccessibleContainer style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </AccessibleContainer>
    );
  }

  return (
    <AccessibleContainer
      style={styles.container}
      accessibilityLabel={t('admin.discounts.title')}
      accessibilityRole="main"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.header}>
        <Text 
          style={styles.title}
          {...accessibility.getAccessibilityProps({
            label: t('admin.discounts.title'),
            role: 'header'
          })}
        >
          {t('admin.discounts.title')}
        </Text>
        <View style={styles.headerActions}>
          <AccessibleButton
            title={showExpired ? t('admin.discounts.hideExpired') : t('admin.discounts.showExpired')}
            onPress={() => setShowExpired(!showExpired)}
            variant="secondary"
            style={styles.toggleButton}
            accessibilityLabel={showExpired ? t('admin.discounts.hideExpired') : t('admin.discounts.showExpired')}
            accessibilityHint={showExpired ? 'Hide expired discounts' : 'Show expired discounts'}
          />
          <AccessibleButton
            title={t('admin.discounts.create')}
            onPress={handleCreateDiscount}
            variant="primary"
            accessibilityLabel={t('admin.discounts.create')}
            accessibilityHint="Create a new discount"
          />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <AccessibleInput
          label={t('admin.discounts.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('admin.discounts.searchPlaceholder')}
          {...accessibility.getAccessibilityProps({
            label: t('admin.discounts.search'),
            hint: 'Search discounts by code or description',
            role: 'searchbox'
          })}
        />
      </View>

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

      <FlatList
        data={filteredDiscounts}
        renderItem={renderDiscountItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <Text 
            style={styles.emptyText}
            {...accessibility.getAccessibilityProps({
              label: t('admin.discounts.empty'),
              role: 'text'
            })}
          >
            {t('admin.discounts.empty')}
          </Text>
        }
      />

      <AccessibleModal
        visible={showDeleteModal}
        onDismiss={() => setShowDeleteModal(false)}
        title={t('admin.discounts.deleteConfirm.title')}
        message={t('admin.discounts.deleteConfirm.message', { code: selectedDiscount?.code || '' })}
        confirmLabel={isDeleting ? t('admin.discounts.deleteConfirm.deleting') : t('admin.discounts.deleteConfirm.confirm')}
        cancelLabel={t('admin.discounts.deleteConfirm.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </AccessibleContainer>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  discountCode: {
    color: theme.colors.text,
    fontFamily: theme.typography.h4.fontFamily,
    fontSize: theme.typography.h4.fontSize,
  },
  discountDescription: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    marginBottom: theme.spacing.sm,
  },
  discountDetail: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing.xs,
  },
  discountDetails: {
    marginBottom: theme.spacing.md,
  },
  discountHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  discountItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  discountStatus: {
    fontFamily: theme.typography.caption.fontFamily,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    marginTop: theme.spacing.xl,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
  },
  expiredDiscount: {
    opacity: 0.7,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  list: {
    padding: theme.spacing.lg,
  },
  searchContainer: {
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  statusContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: theme.typography.h2.fontSize,
  },
  toggleButton: {
    marginRight: theme.spacing.md,
  },
}); 