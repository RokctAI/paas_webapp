import { createSlice } from "@reduxjs/toolkit";
import { CartProduct } from "interfaces";
import { RootState } from "redux/store";

type CartType = {
  cartItems: CartProduct[];
};

const initialState: CartType = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { payload } = action;
      const existingIndex = state.cartItems.findIndex(
        (item) =>
          item?.stock?.id === payload?.stock?.id &&
          item?.addons?.length === payload?.addons?.length &&
          item?.addons?.every((addon) =>
            payload?.addons?.find(
              (pAddon: any) =>
                pAddon?.stock?.id === addon?.stock?.id &&
                pAddon?.quantity === addon?.quantity,
            ),
          ),
      );
      if (existingIndex >= 0) {
        state.cartItems[existingIndex].quantity += payload.quantity;
      } else {
        state.cartItems.push(payload);
      }
    },
    setToCart(state, action) {
      const { payload } = action;
      const existingIndex = state.cartItems.findIndex(
        (item) =>
          item?.stock?.id === payload?.stock?.id &&
          item?.addons?.length === payload?.addons?.length &&
          item?.addons?.every((addon) =>
            payload?.addons?.find(
              (pAddon: any) =>
                pAddon?.stock?.id === addon?.stock?.id &&
                pAddon?.quantity === addon?.quantity,
            ),
          ),
      );
      if (existingIndex >= 0) {
        state.cartItems[existingIndex] = payload;
      } else {
        state.cartItems.push(payload);
      }
    },
    reduceCartItem(state, action) {
      const { payload } = action;
      const itemIndex = state.cartItems.findIndex(
        (item) =>
          item?.stock?.id === payload?.stock?.id &&
          item?.addons?.length === payload?.addons?.length &&
          item?.addons?.every((addon) =>
            payload?.addons?.find(
              (pAddon: any) =>
                pAddon?.stock?.id === addon?.stock?.id &&
                pAddon?.quantity === addon?.quantity,
            ),
          ),
      );

      if (state.cartItems[itemIndex].quantity > 1) {
        state.cartItems[itemIndex].quantity -= 1;
      }
    },
    removeFromCart(state, action) {
      const { payload } = action;
      state.cartItems.map((cartItem) => {
        if (cartItem.id === payload.id) {
          state.cartItems = state.cartItems.filter(
            (item) =>
              !(
                item?.stock?.id === payload?.stock?.id &&
                item?.addons?.length === payload?.addons?.length &&
                item?.addons?.every((addon) =>
                  payload?.addons?.find(
                    (pAddon: any) =>
                      pAddon?.stock?.id === addon?.stock?.id &&
                      pAddon?.quantity === addon?.quantity,
                  ),
                )
              ),
          );
        }
        return state;
      });
    },
    clearCart(state) {
      state.cartItems = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  reduceCartItem,
  setToCart,
} = cartSlice.actions;

export const selectCart = (state: RootState) => state.cart.cartItems;
export const selectTotalPrice = (state: RootState) =>
  state.cart.cartItems.reduce(
    (total, item) =>
      (total +=
        item.quantity * item.stock.price +
        item?.addons?.reduce(
          (acc, addon) =>
            (acc += (addon?.quantity ?? 1) * (addon.stock?.price ?? 0)),
          0,
        )),
    0,
  );

export default cartSlice.reducer;
