import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAllOrder, removeOrder, saveOrder, getAllDiscount } from "api/orderApi";
export const getAllOrd = createAsyncThunk(
  "/donhangs",
  async (params, thunkAPI) => {
    const listOrder = await getAllOrder(params);
    return listOrder;
  }
);
export const getAllDis = createAsyncThunk(
  "/giamgias",
  async (params, thunkAPI) => {
    const listDiscount = await getAllDiscount(params);
    return listDiscount;
  }
);
// export const saveOrd = createAsyncThunk('/donhangs/save', async(params, { rejectWithValue }) => {
//    try{
//     const save = await saveOrder(params)
//     return save

//    }catch(err){
//        if(!err.response) throw err
//        console.log(err.response,'---------')
//         return rejectWithValue(err.response.data.message)
//    }
// })
export const deleteOrd = createAsyncThunk(
  "/donhangs/delete",
  async (params, thunkAPI) => {
    const removeOrd = await removeOrder(params);
    return removeOrd;
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    totalCount: 1,
    loading: false,
    message: "",
    discounts: []
  },
  reducers: {},
  extraReducers: {
    [getAllOrd.pending]: (state, action) => {
      state.loading = true;
    },
    [getAllOrd.rejected]: (state, action) => {
      state.loading = false;
    },
    [getAllOrd.fulfilled]: (state, action) => {
      state.orders = action.payload.data;
      state.totalCount = action.payload.totalCount;
      state.loading = false;
    },
    [getAllDis.pending]: (state, action) => {
    },
    [getAllDis.rejected]: (state, action) => {
    },
    [getAllDis.fulfilled]: (state, action) => {
      state.discounts = action.payload.data;
    },
    // [saveOrd.rejected]: (state,action) => {
    //     state.message = action.payload
    //     state.success = false
    // },
    // [saveOrd.fulfilled]: (state,action) => {
    //     state.success = true
    // },
    [deleteOrd.fulfilled]: (state, action) => {},
  },
});

const { reducer, actions } = orderSlice;
export const { removeImage } = actions;
export default reducer;
