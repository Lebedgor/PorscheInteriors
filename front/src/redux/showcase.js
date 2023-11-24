import { configureStore } from "@reduxjs/toolkit";
import  carInterior  from "./slices/interiorSlice";
import  carModel  from "./slices/carModelSlice";
import  interiorImages  from "./slices/imageSlice";
import  { authReducer }  from "./slices/authSlice";
import  registerSlice  from "./slices/registerSlice";
import  userSlice  from "./slices/userSlice";


export const showcase = configureStore({
  reducer: {
    carInterior,
    auth: authReducer,
    carModel,
    interiorImages,
    registerSlice,
    userSlice,
  }
})