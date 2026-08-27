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

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Default', value: 'none' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name: A to Z', value: 'title-asc' },
  { label: 'Name: Z to A', value: 'title-desc' },
];

type LeftTab = 'sort' | 'filter';

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  categories,
  selectedCategory,
  selectedSort,
  onClose,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState<LeftTab>('sort');
  const [draftCategory, setDraftCategory] = useState<string>(selectedCategory);
  const [draftSort, setDraftSort] = useState<SortOption>(selectedSort);

  useEffect(() => {
    if (visible) {
      setDraftCategory(selectedCategory);
      setDraftSort(selectedSort);
      setActiveTab('sort');
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
    if (!name) return 'All Categories';
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
          {/* Top Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sort & Filter</Text>
            <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
              <Text style={styles.resetText}>Reset All</Text>
            </TouchableOpacity>
          </View>

          {/* Split Content Body */}
          <View style={styles.splitBody}>
            {/* Left Sidebar (Narrow Width Navigation) */}
            <View style={styles.leftSidebar}>
              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'sort' && styles.tabItemActive,
                ]}
                onPress={() => setActiveTab('sort')}
                activeOpacity={0.8}
              >
                {activeTab === 'sort' && <View style={styles.activeIndicator} />}
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === 'sort' && styles.tabItemTextActive,
                  ]}
                >
                  Sort By
                </Text>
                {draftSort !== 'none' && <View style={styles.dotBadge} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabItem,
                  activeTab === 'filter' && styles.tabItemActive,
                ]}
                onPress={() => setActiveTab('filter')}
                activeOpacity={0.8}
              >
                {activeTab === 'filter' && <View style={styles.activeIndicator} />}
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === 'filter' && styles.tabItemTextActive,
                  ]}
                >
                  Category
                </Text>
                {Boolean(draftCategory) && <View style={styles.dotBadge} />}
              </TouchableOpacity>
            </View>

            {/* Right Main Content Area */}
            <View style={styles.rightContent}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.rightScrollContent}
              >
                {activeTab === 'sort' ? (
                  <View style={styles.optionsList}>
                    {SORT_OPTIONS.map(opt => {
                      const isSelected = draftSort === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[
                            styles.optionRow,
                            isSelected && styles.optionRowSelected,
                          ]}
                          onPress={() => setDraftSort(opt.value)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && styles.optionLabelSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxSelected,
                            ]}
                          >
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color={colors.primaryForeground}
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.optionsList}>
                    <TouchableOpacity
                      style={[
                        styles.optionRow,
                        !draftCategory && styles.optionRowSelected,
                      ]}
                      onPress={() => setDraftCategory('')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionLabel,
                          !draftCategory && styles.optionLabelSelected,
                        ]}
                      >
                        All Categories
                      </Text>
                      <View
                        style={[
                          styles.checkbox,
                          !draftCategory && styles.checkboxSelected,
                        ]}
                      >
                        {!draftCategory && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={colors.primaryForeground}
                          />
                        )}
                      </View>
                    </TouchableOpacity>

                    {categories.map(cat => {
                      const isSelected = draftCategory === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.optionRow,
                            isSelected && styles.optionRowSelected,
                          ]}
                          onPress={() => setDraftCategory(cat)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && styles.optionLabelSelected,
                            ]}
                          >
                            {formatCategoryName(cat)}
                          </Text>
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxSelected,
                            ]}
                          >
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color={colors.primaryForeground}
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>

          {/* Footer Action Buttons */}
          <View style={styles.footer}>
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
              <Text style={styles.applyButtonText}>Apply</Text>
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
    height: '65%',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.foreground,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.destructive,
  },
  splitBody: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSidebar: {
    width: '32%',
    backgroundColor: colors.secondary,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  tabItem: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItemActive: {
    backgroundColor: colors.card,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
  },
  tabItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  tabItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  dotBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  rightContent: {
    flex: 1,
    backgroundColor: colors.card,
  },
  rightScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  optionsList: {
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  optionRowSelected: {
    backgroundColor: colors.secondary,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    flex: 1,
    marginRight: 8,
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
    backgroundColor: colors.card,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
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
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
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
