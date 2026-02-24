import { createSlice } from "@reduxjs/toolkit";
import { CartType } from "interfaces";
import { RootState } from "redux/store";

type UserCartType = {
  userCart: CartType;
  indicatorVisible?: boolean
};

const initialState: UserCartType = {
  userCart: {
    id: 0,
    shop_id: 0,
    total_price: 0,
    user_carts: [
      {
        id: 0,
        name: "",
        user_id: 1,
        uuid: "",
        cartDetails: [],
      },
    ],
  },
};

const userCartSlice = createSlice({
  name: "userCart",
  initialState,
  reducers: {
    updateUserCart(state, action) {
      const { payload } = action;
      state.userCart = payload;
      state.indicatorVisible = true
    },
    updateGroupStatus(state, action) {
      const { payload } = action;
      state.userCart.group = !state.userCart.group;
      state.userCart.id = payload.id;
      state.userCart.owner_id = payload.owner_id;
      state.indicatorVisible = true
    },
    clearUserCart(state) {
      state.userCart = initialState.userCart;
      state.indicatorVisible = false
    },
    updateIndicatorState(state, action) {
      state.indicatorVisible = action.payload
    }
  },
});

export const { updateUserCart, updateGroupStatus, clearUserCart, updateIndicatorState } =
  userCartSlice.actions;

export const selectUserCart = (state: RootState) => state.userCart.userCart;

export default userCartSlice.reducer;
