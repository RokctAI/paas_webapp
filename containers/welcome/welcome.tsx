import { useContext } from "react";
import cls from "./welcome.module.scss";
import { ThemeContext } from "contexts/theme/theme.context";
import { useQuery } from "react-query";
import informationService from "services/information";
import { useSettings } from "contexts/settings/settings.context";
import ErrorBoundary from "containers/errorBoundary/errorBoundary";
import WelcomeHeader from "components/welcomeHeader/welcomeHeader";
import Footer from "containers/layout/footer/footer";
import { generateSettings } from "utils/generateSettings";
import createSettings from "utils/createSettings";

type Props = {
  children: any;
};

export default function WelcomeContainer({ children }: Props) {
  const { isDarkMode } = useContext(ThemeContext);
  const { updateSettings } = useSettings();

  useQuery("settings", () => informationService.getSettings(), {
    onSuccess: (data) => {
      const obj = createSettings(data.data);
      updateSettings(generateSettings(obj));
    },
  });

  return (
    <ErrorBoundary isDarkMode={isDarkMode}>
      <WelcomeHeader />
      <div className={cls.body}>{children}</div>
      <Footer />
    </ErrorBoundary>
  );
}
