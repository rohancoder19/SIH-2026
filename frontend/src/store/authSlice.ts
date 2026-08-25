import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialToken = localStorage.getItem('surakshitsthan_token');
const initialUserStr = localStorage.getItem('surakshitsthan_user');
let initialUser: User | null = null;
if (initialUserStr) {
  try {
    initialUser = JSON.parse(initialUserStr);
  } catch (e) {
    initialUser = null;
  }
}

const initialState: AuthState = {
  user: initialUser || {
    id: 1,
    name: "Dr. Arisudan Sharma",
    email: "expert@surakshitsthan.gov.in",
    role: "Expert",
    organization: "Geological Survey of India (GSI)"
  },
  token: initialToken || 'demo_token_123',
  isAuthenticated: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('surakshitsthan_token', action.payload.token);
      localStorage.setItem('surakshitsthan_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('surakshitsthan_token');
      localStorage.removeItem('surakshitsthan_user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
