import cls from "./shopShare.module.scss";
import ShareLineIcon from "remixicon-react/ShareLineIcon";
import { success, error } from "components/alert/toast";
import { useTranslation } from "react-i18next";

export default function ShopShare() {
  const { t } = useTranslation();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      success(t("copied.to.clipboard"));
    } catch {
      error(t("failed.to.copy"));
    }
  };

  return (
    <button className={cls.shareBtn} onClick={handleShare}>
      <ShareLineIcon />
    </button>
  );
}
