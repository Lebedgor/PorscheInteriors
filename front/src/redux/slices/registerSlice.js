import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios'




const initialState = {
  data: null,
  status: "loading",
  settings: []
}

export const addRegister = createAsyncThunk("auth/addRegister", async (params) => {

  const { data } = await axios.post("auth/register", params);

  return data;
})

const registerSlice = createSlice({
  name: "register",
  initialState,
  extraReducers: (builder) => {
    builder
    .addCase(addRegister.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(addRegister.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    })
    .addCase(addRegister.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
  }
})


export default registerSlice.reducer