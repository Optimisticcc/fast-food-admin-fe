import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login, me } from "api/userApi.js";

export const loginThunk = createAsyncThunk(
  "/taikhoans/login",
  async (params, thunkAPI) => {
    const loginAuth = await login(params);
    return loginAuth;
  }
);

export const getMe = createAsyncThunk(
  "/taikhoans/me",
  async (params, thunkAPI) => {
    const userInfo = await me();
    return userInfo;
  }
);

const productSlice = createSlice({
  name: "me",
  initialState: {
    user: null,
    loading: false,
    token: localStorage.getItem("token") || "",
    success: false,
    permision: null,
  },
  reducers: {
    logout: (state, action) => {
      state.user = null;
      state.token = "";
      state.success = false;
    },
    loginSucces: (state, action) => {
      state.loading = false;

      state.user = { ...action.payload.user, token: action.payload.token };
      state.token = action.payload.token;
      state.permision = action.payload.permision;
      localStorage.setItem("token", state.token);
      localStorage.setItem("permision", state.permision);
      state.success = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
  },
  extraReducers: {
    [loginThunk.pending]: (state, action) => {
      state.loading = true;
    },
    [loginThunk.fulfilled]: (state, action) => {
      state.loading = false;
      state.user = { ...action.payload.user, token: action.payload.token };
      state.token = action.payload.token;
      localStorage.setItem("token", state.token);
      state.success = true;
    },
    [loginThunk.rejected]: (state, action) => {
      state.loading = false;
      console.log("Reject");
      state.success = false;
    },
    [getMe.fulfilled]: (state, action) => {
      console.log(
        "🚀 ~ file: loginSlice.js ~ line 65 ~ action",
        action.payload
      );
      state.loading = false;
      state.user = action.payload.user;
      state.permision = action.payload.permision;
    },
    [getMe.rejected]: (state, action) => {
      state.loading = false;
      state.user = null;
      state.token = "";
      localStorage.removeItem("token");
    },
  },
});

const { reducer, actions } = productSlice;
export const { logout, loginSucces, setToken } = actions;
export default reducer;
