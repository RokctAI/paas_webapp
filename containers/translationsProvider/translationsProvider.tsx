import { ReactNode, useContext, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { Langauge } from "interfaces";
import i18n from "i18n";
import { setCookie } from "utils/session";
import { ThemeContext } from "contexts/theme/theme.context";

type TranslationsProviderProps = {
  children: ReactNode;
  locale: string;
  translation: Record<string, string>;
  languages: Langauge[];
};

const TranslationsProvider = ({
  children,
  locale,
  translation,
  languages,
}: TranslationsProviderProps) => {
  const { setDirection } = useContext(ThemeContext);
  const defaultLanguage = languages?.find((item) => Boolean(item?.default));
  const selectedLanguage = languages?.find((item) => item?.locale === locale);
  const fallbackLng = defaultLanguage?.locale || locale;

  useEffect(() => {
    const html = document.documentElement;
    const lang = selectedLanguage?.locale || locale;
    const dir = selectedLanguage?.backward ? "rtl" : "ltr";
    html.setAttribute("lang", lang);
    html.setAttribute("dir", dir);
    setCookie("locale", lang);
    setCookie("dir", dir);
    setDirection(dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supportedLngs =
    languages && languages?.length
      ? languages?.map((item) => item?.locale)
      : [locale];

  i18n.init({
    lng: locale,
    fallbackLng,
    supportedLngs,
    ns: ["translation"],
    defaultNS: "translation",
    localePath: null,
    resources: {
      [locale]: { translation: translation || {} },
    },
  });

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default TranslationsProvider;
