import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios'





const initialState = {
  data: null,
  status: 'loading',
  interiors: [],
  model: [],
}


export const addInterior = createAsyncThunk("interior/addInterior", async (params) => {
  const { data } = await axios.post("interior", params)

  return data
})

export const updateInterior = createAsyncThunk("interior/updateInterior", async (params) => {

  const { data } = await axios.patch(`interior`, params)

  return data
})

export const deleteInterior = createAsyncThunk("interior/deleteInterior", async (id) => {

  const { data } = await axios.delete(`interior/${id}`)

  return data
})

export const getInteriors = createAsyncThunk("interior/getInteriors", async (id) => {

  const  { data }  = await axios.get(`model/${id}`)

  return data
})

const carInteriorSlice = createSlice({
  name: 'carInterior',
  initialState,
  extraReducers: (builder) => {
    builder
    .addCase(addInterior.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(addInterior.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    })
    .addCase(addInterior.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
    .addCase(updateInterior.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(updateInterior.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    })
    .addCase(updateInterior.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
    .addCase(deleteInterior.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(deleteInterior.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    })
    .addCase(deleteInterior.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
    .addCase(getInteriors.pending, (state) => {
      state.status = "loading";
      state.interiors = [];
    })
    .addCase(getInteriors.fulfilled, (state, action) => {
      state.status = "loaded";
      state.interiors = action.payload.interiors;
      state.model = action.payload.model[0];
    })
    .addCase(getInteriors.rejected, (state) => {
      state.status = "error";
      state.interiors = [];
    })
  }
})

export default carInteriorSlice.reducer