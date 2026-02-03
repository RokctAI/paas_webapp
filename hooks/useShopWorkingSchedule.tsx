import { useMemo } from "react";
import dayjs from "dayjs";
import { IShop, ShopWorkingDays } from "interfaces";
import { WEEK } from "constants/weekdays";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";

export default function useShopWorkingSchedule(data?: IShop) {
  const {order}= useSelector((state: RootState) => state.order)
  const { workingSchedule, isShopClosed, isOpen } = useMemo(() => {
    const isSelectedDeliveryDate = order.shop_id === data?.id && !!order.delivery_date
    const today = isSelectedDeliveryDate ? order.delivery_date : dayjs().format("YYYY-MM-DD");
    const weekDay = WEEK[isSelectedDeliveryDate ? dayjs(order.delivery_date).day() : dayjs().day()];
    const foundedSchedule = data?.shop_working_days?.find(
      (item) => item.day === weekDay
    );
    const isHoliday = data?.shop_closed_date?.some((item) =>
      dayjs(item.day).isSame(isSelectedDeliveryDate ? dayjs(order.delivery_date) : dayjs())
    );
    const isClosed = !data?.open || isHoliday;
    let schedule = {} as ShopWorkingDays;
    let isTimePassed: boolean = false;

    try {
      if (foundedSchedule) {
        schedule = { ...foundedSchedule };
        schedule.from = schedule.from.replace("-", ":");
        schedule.to = schedule.to.replace("-", ":");
        isTimePassed = dayjs().isAfter(`${today} ${schedule.to}`);
      }
    } catch (err) {
      console.log("err => ", err);
    }

    return {
      workingSchedule: schedule,
      isShopClosed: schedule.disabled || isClosed || isTimePassed,
      isOpen: Boolean(data?.open),
    };
  }, [data, order.delivery_date, order.shop_id]);

  return { workingSchedule, isShopClosed, isOpen };
}
