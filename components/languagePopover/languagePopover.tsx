import RadioInput from "components/inputs/radioInput";
import cls from "./languagePopover.module.scss";
import { Langauge } from "interfaces";
import { useQuery } from "react-query";
import languageService from "services/language";
import { setCookie } from "utils/session";
import { useTranslation } from "react-i18next";
import { ChangeEvent } from "react";

type Props = {
  onClose: () => void;
};

export default function LanguagePopover({ onClose }: Props) {
  const { i18n } = useTranslation();
  const { data } = useQuery("languages", () => languageService.getAllActive());

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const lang = event.target.value;
    const isRTL = !!data?.data.find((item: Langauge) => item.locale == lang)
      ?.backward;
    setCookie("locale", lang);
    setCookie("dir", isRTL ? "rtl" : "ltr");
    onClose();
    window.location.reload();
  };

  const controlProps = (item: string) => ({
    checked: i18n.language === item,
    onChange: handleChange,
    value: item,
    id: item,
    name: "language",
    inputProps: { "aria-label": item },
  });

  return (
    <div className={cls.wrapper}>
      {data?.data?.map((item: Langauge) => (
        <label key={item.locale} htmlFor={item.locale} className={cls.row}>
          <RadioInput {...controlProps(item.locale)} />
          <span className={cls.text}>{item.title}</span>
        </label>
      ))}
    </div>
  );
}
