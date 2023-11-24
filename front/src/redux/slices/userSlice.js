import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../../axios'




const initialState = {
  users: [],
  settings: [],
  user: [],
  status: "loading"
}

export const activate = createAsyncThunk("user/activate", async (params) => {

  const { data } = await axios.patch("user/activate", params);

  return data;
})

export const edit = createAsyncThunk("user/edit", async (params) => {

  const { data } = await axios.patch("user/edit", params);

  return data;
})

export const getUser = createAsyncThunk("user/getUser", async (user_id) => {

  const { data } = await axios.get("user/getUser", {user_id: user_id});

  return data;
})

export const getAllUsers = createAsyncThunk("user/getAllUsers", async () => {

  const { data } = await axios.get("user/getAllUsers");

  return data;
})

const registerSlice = createSlice({
  name: "register",
  initialState,
  extraReducers: (builder) => {
    builder
    .addCase(activate.pending, (state) => {
      state.status = "loading";
      state.data = null;
    })
    .addCase(activate.fulfilled, (state, action) => {
      state.status = "loaded";
    })
    .addCase(activate.rejected, (state) => {
      state.status = "error";
      state.data = null;
    })
    .addCase(edit.pending, (state) => {
      state.status = "loading";
      state.settings = [];
    })
    .addCase(edit.fulfilled, (state, action) => {
      state.status = "loaded";
      state.settings = action.payload;
    })
    .addCase(edit.rejected, (state) => {
      state.status = "error";
      state.settings = [];
    })
    .addCase(getUser.pending, (state) => {
      state.status = "loading";
      state.settings = [];
    })
    .addCase(getUser.fulfilled, (state, action) => {
      state.status = "loaded";
      state.user = action.payload;
    })
    .addCase(getUser.rejected, (state) => {
      state.status = "error";
      state.settings = [];
    })
    .addCase(getAllUsers.pending, (state) => {
      state.status = "loading";
      state.settings = [];
    })
    .addCase(getAllUsers.fulfilled, (state, action) => {
      state.status = "loaded";
      state.users = action.payload;
    })
    .addCase(getAllUsers.rejected, (state) => {
      state.status = "error";
      state.settings = [];
    })
  }
})


export default registerSlice.reducer