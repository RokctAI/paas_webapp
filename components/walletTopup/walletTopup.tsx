import React, { useEffect, useMemo, useState } from "react";
import cls from "./walletTopup.module.scss";
import {
  FormControlLabel,
  Grid,
  RadioGroup,
  useMediaQuery,
} from "@mui/material";
import TextInput from "components/inputs/textInput";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import PrimaryButton from "components/button/primaryButton";
import DarkButton from "components/button/darkButton";
import { useMutation, useQuery } from "react-query";
import { error, success } from "components/alert/toast";
import paymentService from "../../services/payment";
import RadioInput from "../inputs/radioInput";
import { useAppSelector } from "../../hooks/useRedux";
import { selectCurrency } from "../../redux/slices/currency";
import { useAuth } from "../../contexts/auth/auth.context";
import { useRouter } from "next/router";
import Loading from "../loader/loading";

type Props = {
  handleClose: () => void;
};

interface formValues {
  price: number | undefined;
  payment: string;
}

export default function WalletTopup({ handleClose }: Props) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const currency = useAppSelector(selectCurrency);
  const { user } = useAuth();
  const [payFastUrl, setPayFastUrl] = useState("");
  const [payFastWebHookWaiting, setPayFastWebHookWaiting] = useState(false);
  const router = useRouter();

  const { isLoading: externalPayLoading, mutate: externalPay } = useMutation({
    mutationFn: (payload: any) =>
      paymentService.payExternal(payload.name, payload.data),
    onSuccess: (data, payload) => {
      if (payload.name === "pay-fast") {
        if (data?.data?.data?.sandbox) {
          setPayFastUrl(
            `https://sandbox.payfast.co.za/onsite/engine.js/?uuid=${data?.data?.data?.uuid}`,
          );
        } else {
          setPayFastUrl(
            `https://www.payfast.co.za/onsite/engine.js/?uuid=${data?.data?.data?.uuid}`,
          );
        }
      } else {
        window.location.replace(data.data.data.url);
      }
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  useEffect(() => {
    if (payFastUrl) {
      const script = document.createElement("script");
      script.src = payFastUrl;
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        if (window.payfast_do_onsite_payment) {
          // @ts-ignore
          window.payfast_do_onsite_payment(
            {
              uuid: payFastUrl.split("uuid=")[1],
            },
            (result: boolean) => {
              if (result) {
                success(t("payment.success"));
              } else {
                error(t("payment.failed"));
              }
              setPayFastWebHookWaiting(true);
              setTimeout(() => {
                setPayFastWebHookWaiting(false);
                router.replace("/wallet");
                handleClose();
              }, 10000);
            },
          );
        }
      };
      document.body.appendChild(script);
      setPayFastUrl("");
      return () => {
        document.body.removeChild(script);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payFastUrl]);

  const { data } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentService.getAll(),
  });

  const paymentsList = useMemo(
    () =>
      data?.data.filter(
        (item) => !(item.tag === "wallet" || item.tag === "cash"),
      ),
    [data],
  );

  const formik = useFormik({
    initialValues: {
      price: undefined,
      payment: "",
    },
    onSubmit: (values: formValues) => {
      const body = {
        name: values.payment,
        data: {
          wallet_id: user?.wallet?.id,
          total_price: values.price,
          currency_id: currency?.id,
        },
      };
      externalPay(body);
    },
    validate: (values: formValues) => {
      const errors = {} as formValues;
      if (!values.price) {
        errors.price = t("required");
      }
      if (!values.payment) {
        errors.payment = t("required");
      }
      return errors;
    },
  });

  return (
    <>
      {payFastWebHookWaiting && (
        <div className={cls.overlay}>
          <Loading />
        </div>
      )}
      <div className={cls.wrapper}>
        <h1 className={cls.title}>{t("topup.wallet")}</h1>
        <form className={cls.form} onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={12}>
              <TextInput
                name="price"
                type="number"
                label={t("price")}
                placeholder={t("type.here")}
                value={formik.values.price}
                onChange={formik.handleChange}
                error={!!formik.errors.price && formik.touched.price}
              />
              <div style={{ color: "red", fontSize: "14px" }}>
                {formik.errors?.price && formik.touched?.price
                  ? formik.errors?.price
                  : ""}
              </div>
            </Grid>
            <Grid item xs={12} md={12}>
              <RadioGroup
                name="payment"
                value={formik.values.payment}
                onChange={formik.handleChange}
              >
                {paymentsList?.map((payment) => (
                  <FormControlLabel
                    key={payment.id}
                    value={payment.tag}
                    control={<RadioInput />}
                    label={t(payment.tag)}
                  />
                ))}
              </RadioGroup>
              <div style={{ color: "red", fontSize: "14px" }}>
                {formik.errors?.payment && formik.touched?.payment
                  ? formik.errors?.payment
                  : ""}
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <PrimaryButton type="submit" loading={externalPayLoading}>
                {t("send")}
              </PrimaryButton>
            </Grid>
            <Grid item xs={12} md={6} mt={isDesktop ? 0 : -2}>
              <DarkButton type="button" onClick={handleClose}>
                {t("cancel")}
              </DarkButton>
            </Grid>
          </Grid>
        </form>
      </div>
    </>
  );
}
