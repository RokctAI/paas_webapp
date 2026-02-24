import React from "react";
import { PopoverProps } from "@mui/material";
import PopoverContainer from "containers/popover/popover";
import cls from "./deliveryTimePopover.module.scss";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import { OrderFormValues } from "interfaces";
import dayjs, { ManipulateType } from "dayjs";
import roundedDeliveryTime from "utils/roundedDeliveryTime";
import getShortTimeType from "utils/getShortTimeType";

interface Props extends PopoverProps {
  weekDay: string;
  time: string;
  handleOpenDrawer: () => void;
  formik?: FormikProps<OrderFormValues>;
  timeType: string;
}

export default function DeliveryTimePopover({
  weekDay,
  time,
  handleOpenDrawer,
  formik,
  timeType,
  ...rest
}: Props) {
  const { t } = useTranslation();
  const currentDeliveryTime = `${formik?.values?.delivery_date} ${formik?.values?.delivery_time}`;
  const handleClose = (event: any) => {
    event.preventDefault();
    if (rest.onClose) rest.onClose({}, "backdropClick");
  };
  const handleSelectStandardTime = (event: any) => {
    const estimatedDeliveryDuration = Number(time);
    const type: ManipulateType = timeType as ManipulateType;
    const addedTime = dayjs(currentDeliveryTime, "YYYY-MM-DD HH:mm").add(
      estimatedDeliveryDuration,
      type,
    );
    const standardTime = roundedDeliveryTime(
      addedTime,
      estimatedDeliveryDuration,
    );
    const standardDate = dayjs(addedTime).format("YYYY-MM-DD");
    formik?.setFieldValue("delivery_date", standardDate);
    formik?.setFieldValue("delivery_time", standardTime);
    handleClose(event);
  };

  return (
    <PopoverContainer
      {...rest}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <div className={cls.wrapper}>
        {!formik?.values?.delivery_time?.includes("-") ? (
          <Link
            href="/"
            className={cls.link}
            onClick={handleSelectStandardTime}
          >
            <span className={cls.text}>
              {t("add")} — {time} <span>{t(getShortTimeType(timeType))}</span>
            </span>
          </Link>
        ) : (
          ""
        )}
        <Link
          href="/"
          className={cls.link}
          onClick={(event) => {
            handleClose(event);
            handleOpenDrawer();
          }}
        >
          <span className={cls.text}>{t("schedule")}</span>
        </Link>
      </div>
    </PopoverContainer>
  );
}
