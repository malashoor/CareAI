import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import FilterBar, { FilterOption } from '../components/FilterBar';
import { useAuth } from '../hooks/useAuth';
import { getPharmacyRefills, PharmacyRefill } from '../services/pharmacyInsurance';

interface PharmacyRefillsScreenProps {
  navigation: any;
}

export default function PharmacyRefillsScreen({ navigation }: PharmacyRefillsScreenProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [refills, setRefills] = useState<PharmacyRefill[]>([]);
  const [filteredRefills, setFilteredRefills] = useState<PharmacyRefill[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadRefills();
  }, []);

  useEffect(() => {
    filterRefills();
  }, [selectedFilter, refills]);

  const loadRefills = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(undefined);
      const data = await getPharmacyRefills(user.id);
      setRefills(data);
    } catch (error) {
      console.error('Error loading refills:', error);
      setError('Failed to load refills');
    } finally {
      setLoading(false);
    }
  };

  const filterRefills = () => {
    if (selectedFilter === 'all') {
      setFilteredRefills(refills);
    } else {
      setFilteredRefills(refills.filter(refill => refill.status === selectedFilter));
    }
  };

  const getFilterOptions = (): FilterOption[] => {
    const statusCounts = refills.reduce((acc, refill) => {
      acc[refill.status] = (acc[refill.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { label: 'All', value: 'all', count: refills.length },
      { label: 'Pending', value: 'pending', count: statusCounts.pending || 0 },
      { label: 'Approved', value: 'approved', count: statusCounts.approved || 0 },
      { label: 'Rejected', value: 'rejected', count: statusCounts.rejected || 0 },
      { label: 'Filled', value: 'filled', count: statusCounts.filled || 0 },
    ];
  };

  const renderRefillItem = ({ item }: { item: PharmacyRefill }) => (
    <TouchableOpacity
      style={styles.refillCard}
      onPress={() => navigation.navigate('RefillDetails', { refillId: item.id })}
      accessibilityLabel={`View details for ${item.medication_name}`}
    >
      <View style={styles.refillHeader}>
        <Text style={styles.medicationName as TextStyle}>{item.medication_name}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText as TextStyle}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.refillDetails}>
        <Text style={styles.detailText as TextStyle}>Dosage: {item.dosage}</Text>
        <Text style={styles.detailText as TextStyle}>Frequency: {item.frequency}</Text>
        <Text style={styles.detailText as TextStyle}>
          Start: {item.start_date.toLocaleDateString()}
        </Text>
        <Text style={styles.detailText as TextStyle}>
          End: {item.end_date.toLocaleDateString()}
        </Text>
      </View>
      {item.notes && (
        <Text style={styles.notes as TextStyle} numberOfLines={2}>
          Notes: {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  const getStatusStyle = (status: PharmacyRefill['status']): ViewStyle => {
    const statusColors: Record<PharmacyRefill['status'], string> = {
      pending: theme.colors.status.warning,
      approved: theme.colors.status.success,
      rejected: theme.colors.status.error,
      filled: theme.colors.status.info,
    };
    return {
      backgroundColor: statusColors[status],
    };
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="medical" size={64} color={theme.colors.text.secondary} />
      <Text style={styles.emptyStateTitle as TextStyle}>No Refills Yet</Text>
      <Text style={styles.emptyStateText as TextStyle}>
        Tap the + button to request a new prescription refill
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title as TextStyle}>Pharmacy Refills</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('NewPharmacyRefill')}
          accessibilityLabel="Add new refill"
        >
          <Ionicons name="add" size={24} color={theme.colors.background.primary} />
        </TouchableOpacity>
      </View>

      <FilterBar
        options={getFilterOptions()}
        selectedValue={selectedFilter}
        onSelect={setSelectedFilter}
      />

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText as TextStyle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadRefills}
            accessibilityLabel="Retry loading refills"
          >
            <Text style={styles.retryButtonText as TextStyle}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRefills}
          renderItem={renderRefillItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadRefills}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text.secondary,
  } as ViewStyle,
  title: {
    fontSize: 24,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
  } as TextStyle,
  addButton: {
    backgroundColor: theme.colors.primary.default,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  listContent: {
    padding: 16,
  } as ViewStyle,
  refillCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  } as ViewStyle,
  refillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  medicationName: {
    fontSize: 18,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  } as ViewStyle,
  statusText: {
    fontSize: 12,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.background.primary,
    textTransform: 'capitalize',
  } as TextStyle,
  refillDetails: {
    marginBottom: 8,
  } as ViewStyle,
  detailText: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.primary,
    marginBottom: 4,
  } as TextStyle,
  notes: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  } as TextStyle,
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  } as ViewStyle,
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  } as TextStyle,
  emptyStateText: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  } as ViewStyle,
  errorText: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.status.error,
    textAlign: 'center',
    marginBottom: 16,
  } as TextStyle,
  retryButton: {
    backgroundColor: theme.colors.primary.default,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  } as ViewStyle,
  retryButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.background.primary,
  } as TextStyle,
}); 