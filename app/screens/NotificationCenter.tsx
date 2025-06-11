import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '../components/Icon';
import { NotificationItem } from '../components/NotificationItem';
import { useNotifications } from '../hooks/useNotifications';
import { usePreferencesStore } from '../services/preferences';
import { useTheme } from '../theme';

type SortOption = 'newest' | 'oldest' | 'unread';
type FilterOption = 'all' | 'unread' | 'insurance' | 'pharmacy';

export function NotificationCenter() {
  const theme = useTheme();
  const { notifications, isLoading, refetch } = useNotifications();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { accessibility } = usePreferencesStore();

  const filteredNotifications = useCallback(() => {
    let filtered = [...notifications];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((notification) =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterBy !== 'all') {
      filtered = filtered.filter((notification) => {
        switch (filterBy) {
          case 'unread':
            return !notification.read;
          case 'insurance':
            return notification.type === 'insurance_claim';
          case 'pharmacy':
            return notification.type === 'pharmacy_refill';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'unread':
          if (a.read === b.read) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return a.read ? 1 : -1;
        default:
          return 0;
      }
    });

    return filtered;
  }, [notifications, sortBy, filterBy, searchQuery]);

  const renderFilterButton = (option: FilterOption, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterBy === option && styles.filterButtonActive,
      ]}
      onPress={() => setFilterBy(option)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filterBy === option && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: theme.colors.card },
          ]}
          placeholder="Search notifications..."
          placeholderTextColor={theme.colors.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filters}>
        <View style={styles.filterRow}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('unread', 'Unread')}
        </View>
        <View style={styles.filterRow}>
          {renderFilterButton('insurance', 'Insurance')}
          {renderFilterButton('pharmacy', 'Pharmacy')}
        </View>
      </View>

      <View style={styles.sortContainer}>
        <Text style={[styles.sortLabel, { color: theme.colors.text }]}>Sort by:</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            const options: SortOption[] = ['newest', 'oldest', 'unread'];
            const currentIndex = options.indexOf(sortBy);
            setSortBy(options[(currentIndex + 1) % options.length]);
          }}
        >
          <Text style={[styles.sortButtonText, { color: theme.colors.primary }]}>
            {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
          </Text>
          <Icon name="chevron-down" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications()}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            fontSize={accessibility.fontSize}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  filters: {
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortLabel: {
    marginRight: 8,
    fontSize: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    marginRight: 4,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
}); 