import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import colors from '../../theme/colors';

export type SortOption =
  | 'none'
  | 'price-asc'
  | 'price-desc'
  | 'title-asc'
  | 'title-desc';

interface FilterBottomSheetProps {
  visible: boolean;
  categories: string[];
  selectedCategory: string;
  selectedSort: SortOption;
  onClose: () => void;
  onApply: (category: string, sort: SortOption) => void;
}

const SORT_OPTIONS: { label: string; value: SortOption; icon: string }[] = [
  { label: 'Default', value: 'none', icon: 'reorder-two-outline' },
  { label: 'Price: Low to High', value: 'price-asc', icon: 'arrow-up-outline' },
  { label: 'Price: High to Low', value: 'price-desc', icon: 'arrow-down-outline' },
  { label: 'Name: A to Z', value: 'title-asc', icon: 'text-outline' },
  { label: 'Name: Z to A', value: 'title-desc', icon: 'text-outline' },
];

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  categories,
  selectedCategory,
  selectedSort,
  onClose,
  onApply,
}) => {
  const [draftCategory, setDraftCategory] = useState<string>(selectedCategory);
  const [draftSort, setDraftSort] = useState<SortOption>(selectedSort);

  useEffect(() => {
    if (visible) {
      setDraftCategory(selectedCategory);
      setDraftSort(selectedSort);
    }
  }, [visible, selectedCategory, selectedSort]);

  const handleApply = () => {
    onApply(draftCategory, draftSort);
  };

  const handleReset = () => {
    setDraftCategory('');
    setDraftSort('none');
    onApply('', 'none');
  };

  const formatCategoryName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Handle indicator bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
              <Text style={styles.resetText}>Reset All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Sorting Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortList}>
                {SORT_OPTIONS.map(opt => {
                  const isSelected = draftSort === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.sortOption,
                        isSelected && styles.sortOptionSelected,
                      ]}
                      onPress={() => setDraftSort(opt.value)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={opt.icon as any}
                        size={18}
                        color={isSelected ? colors.primary : colors.mutedForeground}
                        style={{ marginRight: 10 }}
                      />
                      <Text
                        style={[
                          styles.sortOptionLabel,
                          isSelected && styles.sortOptionLabelSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={colors.primary}
                          style={{ marginLeft: 'auto' }}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Categories Filter Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoriesWrap}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !draftCategory && styles.categoryChipSelected,
                  ]}
                  onPress={() => setDraftCategory('')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      !draftCategory && styles.categoryChipTextSelected,
                    ]}
                  >
                    All Categories
                  </Text>
                </TouchableOpacity>

                {categories.map(cat => {
                  const isSelected = draftCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipSelected,
                      ]}
                      onPress={() => setDraftCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {formatCategoryName(cat)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.destructive,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 12,
  },
  sortList: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOptionSelected: {
    backgroundColor: colors.secondary,
  },
  sortOptionLabel: {
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '500',
  },
  sortOptionLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.foreground,
  },
  categoryChipTextSelected: {
    color: colors.primaryForeground,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
});

export default FilterBottomSheet;
