import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios'

const getErrorPayload = (error, fallbackMessage) => error?.response?.data || {
  success: false,
  message: fallbackMessage
}

const initialState = {
  data: null,
  status: 'loading',
  categories: [],
  currentCategory: null,
  breadcrumbs: [],
}

export const getRootCategories = createAsyncThunk('category/getRootCategories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('category')

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося отримати категорії'))
  }
})

export const getCategoryTree = createAsyncThunk('category/getCategoryTree', async (id, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`category/${id}`)

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося отримати категорію'))
  }
})

export const addCategory = createAsyncThunk('category/addCategory', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('category', params)

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося створити категорію'))
  }
})

export const updateCategory = createAsyncThunk('category/updateCategory', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.patch('category', params)

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося оновити категорію'))
  }
})

export const deleteCategory = createAsyncThunk('category/deleteCategory', async (id, { rejectWithValue }) => {
  try {
    const { data } = await axios.delete(`category/${id}`)

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося видалити категорію'))
  }
})

const categorySlice = createSlice({
  name: 'category',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(addCategory.pending, (state) => {
        state.status = 'loading'
        state.data = null
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.data = action.payload
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.status = 'error'
        state.data = action.payload || null
      })
      .addCase(updateCategory.pending, (state) => {
        state.status = 'loading'
        state.data = null
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.data = action.payload
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.status = 'error'
        state.data = action.payload || null
      })
      .addCase(deleteCategory.pending, (state) => {
        state.status = 'loading'
        state.data = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.data = action.payload
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.status = 'error'
        state.data = action.payload || null
      })
      .addCase(getRootCategories.pending, (state) => {
        state.status = 'loading'
        state.categories = []
        state.currentCategory = null
        state.breadcrumbs = []
      })
      .addCase(getRootCategories.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.categories = action.payload.categories || []
        state.currentCategory = action.payload.category || null
        state.breadcrumbs = action.payload.breadcrumbs || []
      })
      .addCase(getRootCategories.rejected, (state, action) => {
        state.status = 'error'
        state.categories = []
        state.currentCategory = action.payload?.category || null
        state.breadcrumbs = []
      })
      .addCase(getCategoryTree.pending, (state) => {
        state.status = 'loading'
        state.categories = []
        state.currentCategory = null
        state.breadcrumbs = []
      })
      .addCase(getCategoryTree.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.categories = action.payload.categories || []
        state.currentCategory = action.payload.category || null
        state.breadcrumbs = action.payload.breadcrumbs || []
      })
      .addCase(getCategoryTree.rejected, (state, action) => {
        state.status = 'error'
        state.categories = []
        state.currentCategory = action.payload?.category || null
        state.breadcrumbs = []
      })
  }
})

export default categorySlice.reducer
