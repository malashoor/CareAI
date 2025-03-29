import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { PharmacyRefill, getPharmacyRefill, updatePharmacyRefill, deletePharmacyRefill } from '@/services/pharmacyInsurance';
import { updateRefillStatus, RefillStatus } from '@/services/statusUpdates';
import { Ionicons } from '@expo/vector-icons';
import StatusTimeline, { TimelineEvent } from '@/components/StatusTimeline';

interface RefillDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      refillId: string;
    };
  };
}

export default function RefillDetailsScreen({ navigation, route }: RefillDetailsScreenProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [refill, setRefill] = useState<PharmacyRefill | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [isProfessional, setIsProfessional] = useState(false);

  useEffect(() => {
    loadRefill();
  }, []);

  const loadRefill = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(undefined);
      const data = await getPharmacyRefill(user.id, route.params.refillId);
      setRefill(data);
      if (data) {
        // Generate timeline events based on refill data
        const events: TimelineEvent[] = [
          {
            status: 'pending',
            date: data.created_at,
            notes: 'Refill requested',
          },
        ];
        if (data.status !== 'pending') {
          events.push({
            status: data.status,
            date: data.updated_at,
            notes: `Refill ${data.status}`,
          });
        }
        setTimelineEvents(events);

        // Check permissions
        setCanEdit(data.status === 'pending');
        setCanDelete(data.status === 'pending');
        setIsProfessional(user.role === 'professional');
      }
    } catch (error) {
      console.error('Error loading refill:', error);
      setError('Failed to load refill details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !refill) return;
    
    Alert.alert(
      'Delete Refill',
      'Are you sure you want to delete this refill request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePharmacyRefill(refill.id, user.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting refill:', error);
              Alert.alert('Error', 'Failed to delete refill');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!refill) return;
    navigation.navigate('EditPharmacyRefill', { refillId: refill.id });
  };

  const handleStatusUpdate = async (newStatus: RefillStatus) => {
    if (!user || !refill) return;

    try {
      await updateRefillStatus(refill.id, newStatus, user.id);
      await loadRefill(); // Reload to get updated status and timeline
    } catch (error) {
      console.error('Error updating refill status:', error);
      Alert.alert('Error', 'Failed to update refill status');
    }
  };

  const getStatusColor = (status: PharmacyRefill['status']): string => {
    const statusColors: Record<PharmacyRefill['status'], string> = {
      pending: theme.colors.status.warning,
      processing: theme.colors.status.info,
      ready_for_pickup: theme.colors.status.success,
      delivered: theme.colors.status.success,
      cancelled: theme.colors.status.error,
    };
    return statusColors[status];
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title as TextStyle}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error || !refill) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title as TextStyle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText as TextStyle}>
            {error || 'Failed to load refill details'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadRefill}
            accessibilityLabel="Retry loading refill details"
          >
            <Text style={styles.retryButtonText as TextStyle}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>Refill Details</Text>
        <View style={styles.headerActions}>
          {canEdit && (
            <TouchableOpacity
              onPress={handleEdit}
              style={styles.actionButton}
              accessibilityLabel="Edit refill"
            >
              <Ionicons name="pencil" size={24} color={theme.colors.primary.default} />
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.actionButton}
              accessibilityLabel="Delete refill"
            >
              <Ionicons name="trash" size={24} color={theme.colors.status.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle as TextStyle}>Medication Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel as TextStyle}>Medication</Text>
            <Text style={styles.detailValue as TextStyle}>{refill.medication_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel as TextStyle}>Dosage</Text>
            <Text style={styles.detailValue as TextStyle}>{refill.dosage}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel as TextStyle}>Frequency</Text>
            <Text style={styles.detailValue as TextStyle}>{refill.frequency}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle as TextStyle}>Schedule</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel as TextStyle}>Start Date</Text>
            <Text style={styles.detailValue as TextStyle}>
              {refill.start_date.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel as TextStyle}>End Date</Text>
            <Text style={styles.detailValue as TextStyle}>
              {refill.end_date.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle as TextStyle}>Status Timeline</Text>
          <StatusTimeline events={timelineEvents} currentStatus={refill.status} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle as TextStyle}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(refill.status) }]}>
            <Text style={styles.statusText as TextStyle}>{refill.status}</Text>
          </View>
        </View>

        {isProfessional && refill.status !== 'delivered' && refill.status !== 'cancelled' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle as TextStyle}>Update Status</Text>
            <View style={styles.statusActions}>
              {refill.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: theme.colors.status.info }]}
                  onPress={() => handleStatusUpdate('processing')}
                  accessibilityLabel="Mark as processing"
                >
                  <Text style={styles.statusButtonText as TextStyle}>Start Processing</Text>
                </TouchableOpacity>
              )}
              {refill.status === 'processing' && (
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: theme.colors.status.success }]}
                  onPress={() => handleStatusUpdate('ready_for_pickup')}
                  accessibilityLabel="Mark as ready for pickup"
                >
                  <Text style={styles.statusButtonText as TextStyle}>Ready for Pickup</Text>
                </TouchableOpacity>
              )}
              {refill.status === 'ready_for_pickup' && (
                <TouchableOpacity
                  style={[styles.statusButton, { backgroundColor: theme.colors.status.success }]}
                  onPress={() => handleStatusUpdate('delivered')}
                  accessibilityLabel="Mark as delivered"
                >
                  <Text style={styles.statusButtonText as TextStyle}>Mark as Delivered</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: theme.colors.status.error }]}
                onPress={() => handleStatusUpdate('cancelled')}
                accessibilityLabel="Cancel refill"
              >
                <Text style={styles.statusButtonText as TextStyle}>Cancel Refill</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {refill.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle as TextStyle}>Notes</Text>
            <Text style={styles.notes as TextStyle}>{refill.notes}</Text>
          </View>
        )}
      </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text.secondary,
  } as ViewStyle,
  backButton: {
    marginRight: 16,
  } as ViewStyle,
  title: {
    fontSize: 20,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  actionButton: {
    padding: 8,
    marginLeft: 8,
  } as ViewStyle,
  content: {
    flex: 1,
    padding: 16,
  } as ViewStyle,
  section: {
    marginBottom: 24,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
    marginBottom: 12,
  } as TextStyle,
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  detailLabel: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.secondary,
  } as TextStyle,
  detailValue: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.primary,
  } as TextStyle,
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  } as ViewStyle,
  statusText: {
    fontSize: 14,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.background.primary,
    textTransform: 'capitalize',
  } as TextStyle,
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as ViewStyle,
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  } as ViewStyle,
  statusButtonText: {
    fontSize: 14,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.background.primary,
  } as TextStyle,
  notes: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.primary,
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