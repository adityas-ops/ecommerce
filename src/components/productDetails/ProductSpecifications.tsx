import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dimensions } from '../../types/product';
import colors from '../../theme/colors';

interface Props {
  category: string;
  sku: string;
  weight: number;
  dimensions: Dimensions;
  minimumOrderQuantity: number;
  barcode: string;
}

const ProductSpecifications: React.FC<Props> = ({
  category,
  sku,
  weight,
  dimensions,
  minimumOrderQuantity,
  barcode,
}) => {
  const specs = [
    { label: 'Category', value: category },
    { label: 'SKU', value: sku },
    { label: 'Weight', value: `${weight} Kg` },
    {
      label: 'Dimensions',
      value: `${dimensions.width} × ${dimensions.height} × ${dimensions.depth} Cm`,
    },
    { label: 'Min. order', value: `${minimumOrderQuantity} Unit` },
    { label: 'Barcode', value: barcode },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.foreground }]}>
        Specifications
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {specs.map((spec, index) => (
          <View
            key={index}
            style={[
              styles.row,
              {
                borderBottomWidth: index === specs.length - 1 ? 0 : 0.3,
                borderBottomColor: colors.border,
                backgroundColor:
                  index % 2 === 0 ? 'transparent' : colors.background + '40', // Slight striping if desired, or just transparent
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              {spec.label}
            </Text>
            <Text style={[styles.value, { color: colors.foreground }]}>
              {spec.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default ProductSpecifications;
