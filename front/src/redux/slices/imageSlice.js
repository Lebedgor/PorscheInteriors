import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios'





const initialState = {
  data: null,
  status: 'loading',
  imagesStatus: 'loading',
  interiorInfo: [],
  images: [],
  total: 0,
  pages: 1,
  deleteStatus: 'sending'
}


export const addImage = createAsyncThunk("image/addImage", async (params) => {
  const { data } = await axios.post("upload_image", params)

  return data
})

export const deleteImage = createAsyncThunk("image/deleteImage", async (params) => {

  const { data } = await axios.delete(`image/`, {data: params})

  return data
})

export const getInterior = createAsyncThunk("image/getInterior", async (id) => {

  const  { data }  = await axios.get(`interior/${id}`)

  return data
})

export const getImages = createAsyncThunk("image/getImages", async (id) => {

  const  { data }  = await axios.get(`interior_images/${id}`)

  return data
})

export const showMoreImages = createAsyncThunk("image/showMoreImages", async (id, page) => {

  const  { data }  = await axios.get(`interior_images/${id}/?page=2`)

  return data
})

const carImageSlice = createSlice({
  name: 'interiorImages',
  initialState,
  extraReducers: (builder) => {
    builder
    .addCase(addImage.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(addImage.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    })
    .addCase(addImage.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
    .addCase(getInterior.pending, (state) => {
      state.status = "loading";
      state.interiorInfo = [];
    })
    .addCase(getInterior.fulfilled, (state, action) => {
      state.status = "loaded";
      state.interiorInfo = action.payload;
    })
    .addCase(getInterior.rejected, (state) => {
      state.status = "error";
      state.interiorInfo = [];
    })
    .addCase(getImages.pending, (state) => {
      state.imagesStatus = "loading";
      state.images = [];
    })
    .addCase(getImages.fulfilled, (state, action) => {
      state.imagesStatus = "loaded";
      state.total = action.payload.total;
      state.pages = Math.ceil(state.total / 10);
      state.images = action.payload.images;
    })
    .addCase(getImages.rejected, (state) => {
      state.imagesStatus = "error";
      state.images = [];
    })
    .addCase(showMoreImages.pending, (state) => {
      state.imagesStatus = "loading";
    })
    .addCase(showMoreImages.fulfilled, (state, action) => {
      state.imagesStatus = "loaded";
      state.images = [ ...state.images, ...action.payload.images ];
    })
    .addCase(showMoreImages.rejected, (state) => {
      state.imagesStatus = "error";
    })
    .addCase(deleteImage.pending, (state) => {
      state.deleteStatus = "sending";
      state.data = null;
    })
    .addCase(deleteImage.fulfilled, (state, action) => {
      state.deleteStatus = "deleted";
      state.data = action.payload;
    })
    .addCase(deleteImage.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
  }
})

export default carImageSlice.reducer