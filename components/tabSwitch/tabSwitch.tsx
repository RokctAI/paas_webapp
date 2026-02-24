import React, { FC } from "react";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import cls from "./tabSwitch.module.scss";

interface TabSwitchProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  tabs: Array<{ value: string; icon: React.ReactNode }>;
}

export const TabSwitch: FC<TabSwitchProps> = ({
  tabs,
  selectedTab,
  setSelectedTab,
}) => {
  const { t } = useTranslation();
  return (
    <div className={cls.container}>
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.value}
          className={`${cls.button} ${tab.value === selectedTab ? cls.active : ""}`}
          onClick={() => setSelectedTab(tab.value)}
        >
          {tab.icon}
          {t(tab.value)}
          {tab.value === selectedTab ? (
            <m.div className={cls.underline} layoutId="underline" />
          ) : null}
        </button>
      ))}
    </div>
  );
};
