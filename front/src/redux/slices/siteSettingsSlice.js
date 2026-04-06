import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from '../../axios'
import { imageSettingsDefaults, normalizeImageSettings } from '../../imageSettings'

export const homeSeoDefaults = {
  title: '',
  description: '',
  h1: '',
  og_title: '',
  og_description: '',
  og_image: ''
}

const getErrorPayload = (error, fallbackMessage) => error?.response?.data || {
  success: false,
  message: fallbackMessage
}

const normalizeHomeSeoSettings = (settings = {}) => {
  const title = String(settings.title || '').trim()
  const description = String(settings.description || '').trim()
  const h1 = String(settings.h1 || '').trim()
  const ogTitle = String(settings.og_title || '').trim()
  const ogDescription = String(settings.og_description || '').trim()
  const ogImage = String(settings.og_image || '').trim()

  return {
    title,
    description,
    h1,
    og_title: ogTitle || title,
    og_description: ogDescription || description,
    og_image: ogImage
  }
}

const initialState = {
  settings: {},
  imageSettings: imageSettingsDefaults,
  homeSeo: homeSeoDefaults,
  status: 'idle',
  saveStatus: 'idle',
  error: null
}

export const fetchSiteSettings = createAsyncThunk('siteSettings/fetchSiteSettings', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('site-settings')

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося отримати налаштування сайту'))
  }
})

export const fetchImageSettings = createAsyncThunk('siteSettings/fetchImageSettings', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('site-settings/image')

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося отримати налаштування зображень'))
  }
})

export const updateImageSettings = createAsyncThunk('siteSettings/updateImageSettings', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.patch('site-settings/image', normalizeImageSettings(params))

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося зберегти налаштування зображень'))
  }
})

export const updateHomeSeoSettings = createAsyncThunk('siteSettings/updateHomeSeoSettings', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axios.patch('site-settings/seo/home', normalizeHomeSeoSettings(params))

    return data
  } catch (error) {
    return rejectWithValue(getErrorPayload(error, 'Не вдалося зберегти SEO налаштування'))
  }
})

const siteSettingsSlice = createSlice({
  name: 'siteSettings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteSettings.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSiteSettings.fulfilled, (state, action) => {
        const settings = action.payload?.settings || {}
        const normalizedImageSettings = normalizeImageSettings(settings?.images?.formatting || imageSettingsDefaults)
        const normalizedHomeSeo = normalizeHomeSeoSettings(settings?.seo?.home || homeSeoDefaults)

        state.status = 'loaded'
        state.settings = settings
        state.imageSettings = normalizedImageSettings
        state.homeSeo = normalizedHomeSeo
      })
      .addCase(fetchSiteSettings.rejected, (state, action) => {
        state.status = 'error'
        state.settings = {}
        state.imageSettings = imageSettingsDefaults
        state.homeSeo = homeSeoDefaults
        state.error = action.payload || null
      })
      .addCase(fetchImageSettings.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchImageSettings.fulfilled, (state, action) => {
        state.status = 'loaded'
        state.imageSettings = normalizeImageSettings(action.payload?.settings || imageSettingsDefaults)
        state.settings = {
          ...state.settings,
          images: {
            ...(state.settings.images || {}),
            formatting: state.imageSettings
          }
        }
      })
      .addCase(fetchImageSettings.rejected, (state, action) => {
        state.status = 'error'
        state.settings = {}
        state.imageSettings = imageSettingsDefaults
        state.homeSeo = homeSeoDefaults
        state.error = action.payload || null
      })
      .addCase(updateImageSettings.pending, (state) => {
        state.saveStatus = 'loading'
        state.error = null
      })
      .addCase(updateImageSettings.fulfilled, (state, action) => {
        state.saveStatus = 'loaded'
        state.imageSettings = normalizeImageSettings(action.payload?.settings || imageSettingsDefaults)
        state.settings = {
          ...state.settings,
          images: {
            ...(state.settings.images || {}),
            formatting: normalizeImageSettings(action.payload?.settings || imageSettingsDefaults)
          }
        }
      })
      .addCase(updateImageSettings.rejected, (state, action) => {
        state.saveStatus = 'error'
        state.error = action.payload || null
      })
      .addCase(updateHomeSeoSettings.pending, (state) => {
        state.saveStatus = 'loading'
        state.error = null
      })
      .addCase(updateHomeSeoSettings.fulfilled, (state, action) => {
        state.saveStatus = 'loaded'
        state.homeSeo = normalizeHomeSeoSettings(action.payload?.settings || homeSeoDefaults)
        state.settings = {
          ...state.settings,
          seo: {
            ...(state.settings.seo || {}),
            home: normalizeHomeSeoSettings(action.payload?.settings || homeSeoDefaults)
          }
        }
      })
      .addCase(updateHomeSeoSettings.rejected, (state, action) => {
        state.saveStatus = 'error'
        state.error = action.payload || null
      })
  }
})

export default siteSettingsSlice.reducer
