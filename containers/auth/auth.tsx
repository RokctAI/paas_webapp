import React, { useContext } from "react";
import { BrandLogo, BrandLogoDark } from "components/icons";
import Image from "next/image";
import cls from "./auth.module.scss";
import { ThemeContext } from "contexts/theme/theme.context";
import Link from "next/link";
import { useQuery } from "react-query";
import informationService from "services/information";
import { useSettings } from "contexts/settings/settings.context";
import { generateSettings } from "utils/generateSettings";
import createSettings from "utils/createSettings";

type Props = {
  children: any;
};

export default function AuthContainer({ children }: Props) {
  const { isDarkMode } = useContext(ThemeContext);
  const { updateSettings } = useSettings();

  useQuery("settings", () => informationService.getSettings(), {
    onSuccess: (data) => {
      const obj = createSettings(data.data);
      updateSettings(generateSettings(obj));
    },
  });

  return (
    <div className={cls.container}>
      <div className={cls.authForm}>
        <div className={cls.formWrapper}>
          <div className={cls.header}>
            <Link href="/" style={{ display: "block" }}>
              {isDarkMode ? <BrandLogoDark /> : <BrandLogo />}
            </Link>
          </div>
          <div className={cls.body}>{children}</div>
        </div>
      </div>
      <div className={cls.hero}>
        <div className={cls.imgWrapper}>
          <Image fill src="/images/welcome.jpg" alt="Welcome to foodyman" />
        </div>
      </div>
    </div>
  );
}
