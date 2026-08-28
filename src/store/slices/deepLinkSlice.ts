import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DeepLinkState {
  pendingDeepLink: string | null;
  invalidUrl: string | null;
  invalidTitle: string;
  invalidMessage: string;
  isInvalidModalOpen: boolean;
}

const initialState: DeepLinkState = {
  pendingDeepLink: null,
  invalidUrl: null,
  invalidTitle: 'Invalid Link',
  invalidMessage: 'The link you opened is invalid or no longer available.',
  isInvalidModalOpen: false,
};

const deepLinkSlice = createSlice({
  name: 'deepLink',
  initialState,
  reducers: {
    setPendingDeepLink: (state, action: PayloadAction<string | null>) => {
      state.pendingDeepLink = action.payload;
    },
    clearPendingDeepLink: state => {
      state.pendingDeepLink = null;
    },
    setInvalidDeepLink: (
      state,
      action: PayloadAction<{
        url: string;
        title?: string;
        message?: string;
      }>,
    ) => {
      state.invalidUrl = action.payload.url;
      state.invalidTitle = action.payload.title || 'Invalid Link';
      state.invalidMessage =
        action.payload.message ||
        'The link you opened is invalid or no longer available.';
      state.isInvalidModalOpen = true;
    },
    clearInvalidDeepLink: state => {
      state.invalidUrl = null;
      state.invalidTitle = 'Invalid Link';
      state.invalidMessage =
        'The link you opened is invalid or no longer available.';
      state.isInvalidModalOpen = false;
    },
  },
});

export const {
  setPendingDeepLink,
  clearPendingDeepLink,
  setInvalidDeepLink,
  clearInvalidDeepLink,
} = deepLinkSlice.actions;

export default deepLinkSlice.reducer;
