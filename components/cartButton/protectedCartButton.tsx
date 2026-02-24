import React from "react";
import cls from "./cartButton.module.scss";
import Link from "next/link";
import ShoppingBag3LineIcon from "remixicon-react/ShoppingBag3LineIcon";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  clearUserCart,
  selectUserCart,
  updateIndicatorState,
  updateUserCart,
} from "redux/slices/userCart";
import { useQuery } from "react-query";
import cartService from "services/cart";
import Price from "components/price/price";
import { selectCurrency } from "redux/slices/currency";
import shopService from "services/shop";
import { useSettings } from "contexts/settings/settings.context";

type Props = {};

export default function ProtectedCartButton({}: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectUserCart);
  const cartIndicatorVisible = useAppSelector(state => state.userCart.indicatorVisible)
  const cartItems = cart?.user_carts.flatMap((item) => item.cartDetails) || [];
  const currency = useAppSelector(selectCurrency);
  const {location} = useSettings();

  useQuery(
    ["cart", currency?.id],
    () => cartService.get({ currency_id: currency?.id }),
    {
    onSuccess: (data) => dispatch(updateUserCart(data.data)),
      onError: () => dispatch(clearUserCart()),
      retry: false,
    }
  );

  const locationArray = location.split(',')

 useQuery(
    ["shopZone", location],
    () =>
      shopService.checkZoneById(cart?.shop_id, {
        address: { latitude: locationArray.at(0), longitude: locationArray.at(1) },
      }),
    {
      onError: () => dispatch(updateIndicatorState(false)),
      onSuccess: () => dispatch(updateIndicatorState(true)),
      enabled: !!cartItems.length,
    }
  );

  if (cartItems.length && cartIndicatorVisible) {
    return (
      <div className={cls.cartBtnWrapper}>
        <Link href={`/shop/${cart.shop_id}`} className={cls.cartBtn}>
          <ShoppingBag3LineIcon />
          <div className={cls.text}>
            <span>{t("order")}</span>{" "}
            <span className={cls.price}>
              <Price number={cart.total_price} />
            </span>
          </div>
        </Link>
      </div>
    );
  } else {
    return <div></div>;
  }
}
