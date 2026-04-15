import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../services/api';

// REGISTER
export const register = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.register(data);

      localStorage.setItem('token', res.data.token);

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Registration failed'
      );
    }
  }
);

// LOGIN
export const login = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.login(data);

      localStorage.setItem('token', res.data.token);

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Login failed'
      );
    }
  }
);

// LOAD USER 
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('No token');

      const res = await authApi.getProfile();

      //  returns FULL user with wishlist
      return { user: res.data, token };
    } catch (err) {
      return rejectWithValue('Session expired');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null, // ✅ persist token
    loading: false,
    error: null
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },

    clearError: (state) => {
      state.error = null;
    },



    setUser: (state, action) => {
      state.user = action.payload;
    },



    // 🔥 NEW: update wishlist after toggle
    updateWishlist: (state, action) => {
      if (state.user) {
        state.user.wishlist = action.payload;
      }
    }
  },

  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // LOGIN
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // 🔥 LOAD USER (KEY FIX)
      .addCase(loadUser.pending, (s) => {
        s.loading = true;
      })
      .addCase(loadUser.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;   // includes wishlist
        s.token = a.payload.token;
      })
      .addCase(loadUser.rejected, (s) => {
        s.loading = false;
        s.user = null;
        s.token = null;
      });
  }
});

export const { setUser , logout, clearError, updateWishlist } = authSlice.actions;
export default authSlice.reducer;
