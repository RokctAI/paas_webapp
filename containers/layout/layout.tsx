import React, { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "./header/header";
import MobileHeader from "./mobileHeader/mobileHeader";
import ProfileHeader from "./profileHeader/profileHeader";
import { useMediaQuery } from "@mui/material";
import { useMutation, useQuery } from "react-query";
import cartService from "services/cart";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { updateUserCart } from "redux/slices/userCart";
import { clearCart, selectCart } from "redux/slices/cart";
import { useAuth } from "contexts/auth/auth.context";
import {
  selectCurrency,
  setCurrency,
  setDefaultCurrency,
} from "redux/slices/currency";
import currencyService from "services/currency";
import { Currency } from "interfaces";
import dynamic from "next/dynamic";
import informationService from "services/information";
import { useSettings } from "contexts/settings/settings.context";
import ErrorBoundary from "containers/errorBoundary/errorBoundary";
import { ThemeContext } from "contexts/theme/theme.context";
import Footer from "./footer/footer";
import createSettings from "utils/createSettings";
import dayjs from "dayjs";
import "dayjs/locale/nl";
import "dayjs/locale/pl";
import { generateSettings } from "../../utils/generateSettings";

const PushNotification = dynamic(
  () => import("containers/pushNotification/pushNotification"),
);

type LayoutProps = {
  children: any;
  locale: string;
};

const profileRoutes = [
  "checkout",
  "profile",
  "settings",
  "help",
  "orders/",
  "be-seller",
];

export default function Layout({ children, locale }: LayoutProps) {
  const { pathname } = useRouter();
  const isProfileRoute = profileRoutes.find((item) => pathname.includes(item));
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const cart = useAppSelector(selectCart);
  const currency = useAppSelector(selectCurrency);
  const { updateSettings } = useSettings();
  const { isDarkMode } = useContext(ThemeContext);
  const router = useRouter();
  const isShopDetailPage = router.pathname.startsWith("/shop/");

  useQuery("currencies", () => currencyService.getAll(), {
    onSuccess: (data) => {
      const activeCurrency = data.data.find((item: Currency) => item.default);
      const savedCurrency = data.data.find(
        (item: Currency) => item.id === currency?.id,
      );
      dispatch(setDefaultCurrency(activeCurrency));
      if (savedCurrency) {
        dispatch(setCurrency(savedCurrency));
      } else {
        dispatch(setCurrency(activeCurrency));
      }
    },
  });

  useQuery("settings", () => informationService.getSettings(), {
    onSuccess: (data) => {
      const obj = createSettings(data.data);
      updateSettings(generateSettings(obj));
    },
  });

  const { mutate: insertProducts } = useMutation({
    mutationFn: (data: any) => cartService.insert(data),
    onSuccess: (data) => {
      dispatch(clearCart());
      dispatch(updateUserCart(data.data));
    },
  });

  useEffect(() => {
    if (isAuthenticated && !!cart.length) {
      let addons: any[] = [];
      let products: any[] = [];
      cart.forEach((item) => {
        products.push({
          stock_id: item.stock.id,
          quantity: item.quantity,
        });
        item.addons.forEach((el) => {
          addons.push({
            stock_id: el.stock.id,
            quantity: el.quantity,
            parent_id: item.stock.id,
          });
        });
      });
      const payload = {
        shop_id: cart.find((item) => !!item.shop_id)?.shop_id,
        currency_id: currency?.id,
        rate: currency?.rate,
        products: [...products, ...addons],
      };
      insertProducts(payload);
    }
  }, [cart, currency, isAuthenticated, insertProducts]);

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  return (
    <ErrorBoundary isDarkMode={isDarkMode}>
      <div className="layout-container">
        {/* if you need fluid container, just remove this div */}
        <div style={{ minHeight: "100vh" }}>
          {isProfileRoute ? (
            <ProfileHeader />
          ) : isDesktop ? (
            <Header />
          ) : (
            <MobileHeader isShopDetailPage={isShopDetailPage} />
          )}
          {children}
        </div>
        {isAuthenticated && <PushNotification />}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
