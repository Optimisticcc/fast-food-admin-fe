import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllDiscount,
  getDiscountBySlug,
  getDiscountById,
  saveDiscount,
  removeDiscount,
} from "api/discountApi.js";

export const getAllDis = createAsyncThunk(
  "/giamgias",
  async (params, thunkAPI) => {
    const listDiscount = await getAllDiscount(params);
    return listDiscount;
  }
);

export const getDisById = createAsyncThunk(
  "/giamgias/show",
  async (params, thunkAPI) => {
    const getById = await getDiscountById(params);
    return getById;
  }
);
const discountSlice = createSlice({
  name: "discounts",
  initialState: {
    discounts: [],
    totalCount: 1,
    loading: false,
  },
  reducers: {},
  extraReducers: {
    [getAllDis.pending]: (state, action) => {
      state.loading = true;
    },
    [getAllDis.rejected]: (state, action) => {
      state.loading = false;
    },
    [getAllDis.fulfilled]: (state, action) => {
      console.log("🚀 ~ file: discountSlice.js ~ line 41 ~ action", action);
      state.loading = false;
      state.discounts = action.payload.data;
      state.totalCount = action.payload.totalCount;
    },
    // [saveCus.fulfilled]: (state,action) => {

    // },
    // [deleteDiscount.fulfilled]: (state, action) => {

    // },
    [getDisById.fulfilled]: (state, action) => {},
  },
});

const { reducer, actions } = discountSlice;
export const { removeImage } = actions;
export default reducer;
