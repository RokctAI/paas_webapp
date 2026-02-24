import cls from "./categorySearchInput.module.scss";
import Search2LineIcon from "remixicon-react/Search2LineIcon";
import CloseCircleLineIcon from "remixicon-react/CloseCircleLineIcon";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  searchTerm: string;
  setSearchTerm: (event: any) => void;
  handleClose: () => void;
};

export default function CategorySearchInput({
  searchTerm,
  setSearchTerm,
  handleClose,
}: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={`${cls.search} white-splash`}>
      <div className={cls.wrapper}>
        <label htmlFor="search">
          <Search2LineIcon />
        </label>
        <input
          type="text"
          id="search"
          ref={inputRef}
          placeholder={t("search")}
          autoComplete="off"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button className={cls.closeBtn} onClick={handleClose}>
          <CloseCircleLineIcon />
        </button>
      </div>
    </div>
  );
}
