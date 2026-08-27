import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

interface Props {
  price: number;
  discountPercentage: number;
}

const ProductPriceBox: React.FC<Props> = ({ price, discountPercentage }) => {
  const discountedPrice = Math.round(
    price * (1 - (discountPercentage || 0) / 100),
  );

  return (
    <View style={styles.container}>
      <View style={[styles.box, { backgroundColor: colors.card }]}>
        <View style={styles.priceContainer}>
          <Text style={[styles.discountedPrice, { color: '#6C5CE7' }]}>
            ${discountedPrice}
          </Text>
          {discountPercentage > 0 && (
            <Text
              style={[styles.originalPrice, { color: colors.mutedForeground }]}
            >
              ${price}
            </Text>
          )}
        </View>

        {discountPercentage > 0 && (
          <View style={[styles.saveBadge, { backgroundColor: '#6C5CE720' }]}>
            <Text style={[styles.saveText, { color: '#6C5CE77' }]}>
              Save {Math.round(discountPercentage)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 50,
    borderWidth: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: '900',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProductPriceBox;
