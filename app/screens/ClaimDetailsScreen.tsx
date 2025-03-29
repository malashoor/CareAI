import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { InsuranceClaim, getInsuranceClaim, updateInsuranceClaim, deleteInsuranceClaim } from '@/services/pharmacyInsurance';
import { Ionicons } from '@expo/vector-icons';
import StatusTimeline, { TimelineEvent } from '@/components/StatusTimeline';

interface ClaimDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      claimId: string;
    };
  };
}

export default function ClaimDetailsScreen({ navigation, route }: ClaimDetailsScreenProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [claim, setClaim] = useState<InsuranceClaim | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    loadClaim();
  }, []);

  const loadClaim = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(undefined);
      const data = await getInsuranceClaim(user.id, route.params.claimId);
      setClaim(data);
      if (data) {
        // Generate timeline events based on claim data
        const events: TimelineEvent[] = [
          {
            status: 'pending',
            date: data.created_at,
            notes: 'Claim submitted',
          },
        ];
        if (data.status !== 'pending') {
          events.push({
            status: data.status,
            date: data.updated_at,
            notes: `Claim ${data.status}`,
          });
        }
        setTimelineEvents(events);

        // Check permissions
        setCanEdit(data.status === 'pending');
        setCanDelete(data.status === 'pending');
      }
    } catch (error) {
      console.error('Error loading claim:', error);
      setError('Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !claim) return;
    
    Alert.alert(
      'Delete Claim',
      'Are you sure you want to delete this claim?',
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
              await deleteInsuranceClaim(claim.id, user.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting claim:', error);
              Alert.alert('Error', 'Failed to delete claim');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!claim) return;
    navigation.navigate('EditInsuranceClaim', { claimId: claim.id });
  };

  const getStatusColor = (status: InsuranceClaim['status']): string => {
    const statusColors: Record<InsuranceClaim['status'], string> = {
      pending: theme.colors.status.warning,
      approved: theme.colors.status.success,
      rejected: theme.colors.status.error,
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

  if (error || !claim) {
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
            {error || 'Failed to load claim details'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadClaim}
            accessibilityLabel="Retry loading claim details"
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
        <Text style={styles.title as TextStyle}>Claim Details</Text>
        <View style={styles.headerActions}>
          {canEdit && (
            <TouchableOpacity
              onPress={handleEdit}
              style={styles.actionButton}
              accessibilityLabel="Edit claim"
            >
              <Ionicons name="pencil" size={24} color={theme.colors.primary.default} />
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.actionButton}
              accessibilityLabel="Delete claim"
            >
              <Ionicons name="trash" size={24} color={theme.colors.status.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle as TextStyle}>Claim Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel as TextStyle}>Claim Number</Text>
            <Text style={styles.detailValue as TextStyle}>{claim.claim_number}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel as TextStyle}>Type</Text>
            <Text style={styles.detailValue as TextStyle}>{claim.claim_type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel as TextStyle}>Amount</Text>
            <Text style={styles.detailValue as TextStyle}>
              ${claim.amount?.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle as TextStyle}>Submission Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel as TextStyle}>Submission Date</Text>
            <Text style={styles.detailValue as TextStyle}>
              {claim.submission_date.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle as TextStyle}>Status Timeline</Text>
          <StatusTimeline events={timelineEvents} currentStatus={claim.status} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle as TextStyle}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}>
            <Text style={styles.statusText as TextStyle}>{claim.status}</Text>
          </View>
        </View>

        {claim.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle as TextStyle}>Notes</Text>
            <Text style={styles.notes as TextStyle}>{claim.notes}</Text>
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