import React from 'react';
import { ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export default function FilterBar({ options, selectedValue, onSelect }: FilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterOption,
              selectedValue === option.value && styles.selectedOption,
            ]}
            onPress={() => onSelect(option.value)}
            accessibilityLabel={`Filter by ${option.label}`}
            accessibilityState={{ selected: selectedValue === option.value }}
          >
            <Text
              style={[
                styles.optionText,
                selectedValue === option.value && styles.selectedOptionText,
              ] as TextStyle}
            >
              {option.label}
            </Text>
            {option.count !== undefined && (
              <View style={styles.countBadge}>
                <Text style={styles.countText as TextStyle}>{option.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text.secondary,
  } as ViewStyle,
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  } as ViewStyle,
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: theme.colors.background.secondary,
  } as ViewStyle,
  selectedOption: {
    backgroundColor: theme.colors.primary.default,
  } as ViewStyle,
  optionText: {
    fontSize: 14,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.primary,
  } as TextStyle,
  selectedOptionText: {
    color: theme.colors.background.primary,
  } as TextStyle,
  countBadge: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  } as ViewStyle,
  countText: {
    fontSize: 12,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.primary,
  } as TextStyle,
}); 