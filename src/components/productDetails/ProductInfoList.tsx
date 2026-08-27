import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import colors from '../../theme/colors';

interface Props {
  shippingInformation: string;
  warrantyInformation: string;
  returnPolicy: string;
  minimumOrderQuantity: number;
}

const ProductInfoList: React.FC<Props> = ({
  shippingInformation,
  warrantyInformation,
  returnPolicy,
  minimumOrderQuantity,
}) => {
  const infoItems = [
    {
      label: 'SHIPPING',
      value: shippingInformation,
      icon: 'car-outline',
    },
    {
      label: 'WARRANTY',
      value: warrantyInformation,
      icon: 'shield-checkmark-outline',
    },
    {
      label: 'RETURNS',
      value: returnPolicy,
      icon: 'refresh-outline',
    },
    {
      label: 'MINIMUM ORDER',
      value: `${minimumOrderQuantity} unit${
        minimumOrderQuantity > 1 ? 's' : ''
      }`,
      icon: 'cube-outline',
    },
  ];

  return (
    <View style={styles.container}>
      {infoItems.map((item, index) => (
        <View
          key={index}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[styles.iconContainer, { backgroundColor: '#6C5CE720' }]}
          >
            <Ionicons name={item.icon as any} size={20} color="#6C5CE7" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              {item.label}
            </Text>
            <Text style={[styles.value, { color: colors.foreground }]}>
              {item.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProductInfoList;
