import React, { useEffect, useState } from "react";
import cls from "./pushNotification.module.scss";
import { useTranslation } from "react-i18next";
import { IPushNotification, NotificationData } from "interfaces";
import { getNotification } from "utils/firebaseMessageListener";
import CloseFillIcon from "remixicon-react/CloseFillIcon";
import { ClickAwayListener } from "@mui/material";
import Link from "next/link";
import { NotificationStatus } from "../../interfaces/user.interface";

type Props = {};

export default function PushNotification({}: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<IPushNotification | undefined>(undefined);
  const [notificationData, setNotificationData] = useState<
    NotificationData | undefined
  >(undefined);

  useEffect(() => {
    getNotification(setData, setNotificationData);
  }, []);

  function handleClose() {
    setData(undefined);
  }

  const getDetailLink = () => {
    if (notificationData?.type === NotificationStatus.NEWS_PUBLISH) {
      return `/?news=${notificationData.id}`;
    }
  };

  const notificationContent = () =>
    notificationData?.type === NotificationStatus.NEWS_PUBLISH ? (
      <>
        <div className={cls.header}>
          <h3 className={cls.title}>{t("you.received.new.news")}</h3>
          <button className={cls.closeBtn} type="button" onClick={handleClose}>
            <CloseFillIcon />
          </button>
        </div>
        <p className={cls.text}>{data?.title}</p>
      </>
    ) : (
      <>
        <div className={cls.header}>
          <h3 className={cls.title}>
            {t("your.order")} #{data?.title}
          </h3>
          <button className={cls.closeBtn} type="button" onClick={handleClose}>
            <CloseFillIcon />
          </button>
        </div>
        <p className={cls.text}>{t("your.order.status.updated.text")}</p>
        <Link
          href={`/orders/${notificationData?.id || data?.title}`}
          className={cls.cta}
          onClick={handleClose}
        >
          {t("show")}
        </Link>
      </>
    );

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div className={cls.container}>
        <div className={`${cls.wrapper} ${data ? "" : cls.hidden}`}>
          {notificationContent()}
        </div>
      </div>
    </ClickAwayListener>
  );
}
