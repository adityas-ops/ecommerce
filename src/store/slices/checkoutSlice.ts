import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CheckoutState {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cod' | 'card' | 'upi';
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

const initialState: CheckoutState = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  paymentMethod: 'cod',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCheckoutDetails: (
      state,
      action: PayloadAction<Partial<CheckoutState>>,
    ) => {
      return { ...state, ...action.payload };
    },
    clearCheckoutDetails: () => {
      return initialState;
    },
  },
});

export const { setCheckoutDetails, clearCheckoutDetails } =
  checkoutSlice.actions;

export default checkoutSlice.reducer;
