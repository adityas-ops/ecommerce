import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  email: string;
  password: string;
}

const initialState: UserState = {
  email: '',
  password: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ email?: string; password?: string }>,
    ) => {
      if (action.payload.email !== undefined) {
        state.email = action.payload.email;
      }
      if (action.payload.password !== undefined) {
        state.password = action.payload.password;
      }
    },
    clearUser: state => {
      state.email = '';
      state.password = '';
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
