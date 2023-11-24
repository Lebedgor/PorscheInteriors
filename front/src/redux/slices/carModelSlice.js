import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios'





const initialState = {
  data: null,
  status: 'loading',
  models: [],
}


export const addCarModel = createAsyncThunk("model/addCarModel", async (params) => {
  const { data } = await axios.post("model", params)

  return data
})

export const updateCarModel = createAsyncThunk("model/updateCarModel", async (params) => {

  const { data } = await axios.patch(`model/${params.model_id}`, params)

  return data
})

export const deleteCarModel = createAsyncThunk("model/deleteCarModel", async (id) => {

  const { data } = await axios.delete(`model/${id}`)

  return data
})

export const getCarModels = createAsyncThunk("model/getCarModels", async () => {

  const  { data }  = await axios.get("model")

  return data
})

const carModelSlice = createSlice({
  name: 'carModel',
  initialState,
  extraReducers: (builder) => {
    builder
    .addCase(addCarModel.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(addCarModel.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    })
    .addCase(addCarModel.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
    .addCase(updateCarModel.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(updateCarModel.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    })
    .addCase(updateCarModel.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
    .addCase(deleteCarModel.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(deleteCarModel.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    })
    .addCase(deleteCarModel.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
    .addCase(getCarModels.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(getCarModels.fulfilled, (state, action) => {
      state.status = "loaded";
      state.models = action.payload;
    })
    .addCase(getCarModels.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
  }
})

export default carModelSlice.reducer