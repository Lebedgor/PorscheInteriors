import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios'



const initialState = {
  data: null,
  user: null,
  status: 'loaded'
}

export const fetchAuth = createAsyncThunk('auth/fetchAuth', async (params) => {
  const { data } = await axios.post('/auth/login/', params)

  return data
})

export const fetchAuthMe = createAsyncThunk('auth/fetchAuthMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/auth/me')

    return data
  } catch (error) {
    const status = error?.response?.status

    if (status === 401 || status === 403) {
      return rejectWithValue({ unauthorized: true })
    }

    throw error
  }
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
    .addCase(fetchAuthMe.rejected, (state, action) => {
      const isUnauthorized = Boolean(action.payload?.unauthorized)

      state.status = isUnauthorized ? "loaded" : "error";
      state.data = null;

      if (isUnauthorized) {
        window.localStorage.removeItem('token')
      }
    })
  }
})

export const { logout } = authSlice.actions

export const isAuthInfo = (state) => !!state.auth.data;

export const authReducer = authSlice.reducer
 
