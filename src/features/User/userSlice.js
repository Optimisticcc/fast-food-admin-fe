import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAllUser, saveUser, removeUser, getUserById } from "api/userApi.js";

export const getAllUs = createAsyncThunk(
  "/taikhoans",
  async (params, thunkAPI) => {
    const listUser = await getAllUser(params);
    return listUser;
  }
);

// export const saveUs = createAsyncThunk('/taikhoans/save', async(params, thunkAPI) => {
//     const save = await saveUser(params)
//     return save
// })
// export const deleteUs = createAsyncThunk('/taikhoans/delete', async (params, thunkAPI) => {
//     const removePro = await removeUser(params);
//     return removePro
// })

export const getUsById = createAsyncThunk(
  "/taikhoans/show",
  async (params, thunkAPI) => {
    const getById = await getUserById(params);
    return getById;
  }
);
const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    permisions: [],
    totalCount: 1,
    loading: false,
  },
  reducers: {},
  extraReducers: {
    [getAllUs.pending]: (state, action) => {
      state.loading = true;
    },
    [getAllUs.rejected]: (state, action) => {
      state.loading = false;
    },
    [getAllUs.fulfilled]: (state, action) => {
      state.loading = false;
      state.permisions = action.payload.permisions;
      state.users = action.payload.data;
      state.totalCount = action.payload.totalCount;
    },
    // [saveUs.fulfilled]: (state,action) => {

    // },
    // [deleteUs.fulfilled]: (state, action) => {

    // },
    [getUsById.fulfilled]: (state, action) => {},
  },
});

const { reducer, actions } = userSlice;
export default reducer;
