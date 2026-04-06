import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios'

const getErrorPayload = (error, fallbackMessage) => error?.response?.data || {
  success: false,
  message: fallbackMessage
}

const initialState = {
  users: [],
  settings: null,
  user: null,
  status: 'idle',
  error: null
}

export const activate = createAsyncThunk('user/activate', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.patch('user/activate', params)

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося змінити статус користувача'))
  }
})

export const edit = createAsyncThunk('user/edit', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.patch('user/edit', params)

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося змінити пароль'))
  }
})

export const createUser = createAsyncThunk('user/create', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('user', params)

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося створити користувача'))
  }
})

export const removeUser = createAsyncThunk('user/remove', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await axios.delete(`user/${userId}`)

    return {
      ...data,
      userId
    }
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося видалити користувача'))
  }
})

export const getUser = createAsyncThunk('user/getUser', async (user_id, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('user/getUser', {
      params: {
        user_id
      }
    })

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося отримати користувача'))
  }
})

export const getAllUsers = createAsyncThunk('user/getAllUsers', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('user/getAllUsers')

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося отримати користувачів'))
  }
})

const registerSlice = createSlice({
  name: 'register',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(activate.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(activate.fulfilled, (state, action) => {
        state.status = 'loaded'
        const activatedUserId = Number(action.meta.arg?.user_id)

        state.users = state.users.map((user) => (
          user.user_id === activatedUserId
            ? {
                ...user,
                activate: Number(action.meta.arg?.activate)
              }
            : user
        ))
      })
      .addCase(activate.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload || null
      })
      .addCase(edit.pending, (state) => {
        state.status = 'loading'
        state.settings = null
        state.error = null
      })
      .addCase(edit.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.settings = action.payload
      })
      .addCase(edit.rejected, (state, action) => {
        state.status = 'error'
        state.settings = null
        state.error = action.payload || null
      })
      .addCase(createUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = 'loaded'

        if (action.payload?.user) {
          state.users = [...state.users, action.payload.user]
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload || null
      })
      .addCase(removeUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.users = state.users.filter((user) => user.user_id !== action.payload?.userId)
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload || null
      })
      .addCase(getUser.pending, (state) => {
        state.status = 'loading'
        state.user = null
        state.error = null
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.user = action.payload
      })
      .addCase(getUser.rejected, (state, action) => {
        state.status = 'error'
        state.user = null
        state.error = action.payload || null
      })
      .addCase(getAllUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.users = action.payload
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.status = 'error'
        state.users = []
        state.error = action.payload || null
      })
  }
})

export default registerSlice.reducer
