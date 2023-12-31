import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios'



const initialState = {
  data: null,
  user: null,
  status: 'loading'
}

export const fetchAuth = createAsyncThunk('auth/fetchAuth', async (params) => {
  const { data } = await axios.post('/auth/login/', params)

  return data
})

export const fetchAuthMe = createAsyncThunk('auth/fetchAuthMe', async () => {
  const { data } = await axios.get('/auth/me')

  return data
})


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null
      window.localStorage.removeItem('token')
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchAuth.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(fetchAuth.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    })
    .addCase(fetchAuth.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
    .addCase(fetchAuthMe.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(fetchAuthMe.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    })
    .addCase(fetchAuthMe.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
  }
})

export const { logout } = authSlice.actions

export const isAuthInfo = (state) => !!state.auth.data;

export const authReducer = authSlice.reducer
 