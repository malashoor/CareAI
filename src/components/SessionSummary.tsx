import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import ViewShot from 'react-native-view-shot';

interface SessionSummaryProps {
  visible: boolean;
  onClose: () => void;
  patterns: {
    category: string;
    count: number;
    severity: 'error' | 'warning' | 'info';
    examples: string[];
  }[];
  startTime: number;
  endTime: number;
}

export function SessionSummary({ visible, onClose, patterns, startTime, endTime }: SessionSummaryProps) {
  const viewShotRef = React.useRef<ViewShot>(null);

  const getSeverityCount = (severity: 'error' | 'warning' | 'info') => {
    return patterns.filter(p => p.severity === severity).length;
  };

  const getTotalCount = () => {
    return patterns.reduce((sum, p) => sum + p.count, 0);
  };

  const getDuration = () => {
    const duration = endTime - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handleShare = async () => {
    if (viewShotRef.current) {
      try {
        const uri = await viewShotRef.current.capture();
        await Share.share({
          url: uri,
          title: 'Log Pattern Session Summary'
        });
      } catch (error) {
        console.error('Error sharing session summary:', error);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ViewShot ref={viewShotRef} style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Session Summary</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getSeverityCount('error')}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.error }]}>Errors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getSeverityCount('warning')}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.warning }]}>Warnings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getSeverityCount('info')}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.info }]}>Info</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>
              Total Patterns: {getTotalCount()}
            </Text>
            <Text style={styles.detailText}>
              Duration: {getDuration()}
            </Text>
            <Text style={styles.detailText}>
              Start: {new Date(startTime).toLocaleTimeString()}
            </Text>
            <Text style={styles.detailText}>
              End: {new Date(endTime).toLocaleTimeString()}
            </Text>
          </View>

          <View style={styles.patternsContainer}>
            <Text style={styles.sectionTitle}>Top Patterns</Text>
            {patterns
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map((pattern, index) => (
                <View key={index} style={styles.patternItem}>
                  <Text style={[
                    styles.patternCategory,
                    { color: theme.colors[pattern.severity] }
                  ]}>
                    {pattern.category}
                  </Text>
                  <Text style={styles.patternCount}>
                    {pattern.count} occurrences
                  </Text>
                </View>
              ))}
          </View>
        </ViewShot>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.dark,
  },
  shareButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.dark,
  },
  statLabel: {
    fontSize: theme.typography.sizes.sm,
    marginTop: 4,
  },
  detailsContainer: {
    marginBottom: theme.spacing.lg,
  },
  detailText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.gray[600],
    marginBottom: 4,
  },
  patternsContainer: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.dark,
    marginBottom: theme.spacing.sm,
  },
  patternItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  patternCategory: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
  },
  patternCount: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gray[600],
  },
  closeButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  closeButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 