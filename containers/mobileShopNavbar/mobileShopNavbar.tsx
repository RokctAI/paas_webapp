import React, { useEffect, useMemo, useRef, useState } from "react";
import { Category } from "interfaces";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import "swiper/css";
import scrollToView from "utils/scrollToView";
import { useMediaQuery } from "@mui/material";
import Search2LineIcon from "remixicon-react/Search2LineIcon";
import cls from "./mobileShopNavbar.module.scss";
import ArrowLeftSLineIcon from "remixicon-react/ArrowLeftSLineIcon";
import ArrowRightSLineIcon from "remixicon-react/ArrowRightSLineIcon";

type Props = {
  categories?: Category[];
  loading: boolean;
  isPopularVisible?: boolean;
  openSearch: () => void;
};

export default function MobileShopNavbar({
  categories = [],
  loading,
  isPopularVisible,
  openSearch,
}: Props) {
  const localCategories = useMemo(
    () =>
      isPopularVisible
        ? [
            { uuid: "popular", translation: { title: "popular" }, id: 0 },
            ...categories,
          ]
        : categories,
    [categories, isPopularVisible],
  );
  const isBigDesktop = useMediaQuery("(min-width:1799px)");
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [activeSection, setActiveSection] = useState<null | string>(null);
  const [showPrevButton, setShowPrevButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(true);

  const swiperRef = useRef<SwiperRef>(null);
  const slideIdToIndexMap = useMemo(
    () =>
      Object.fromEntries(
        localCategories?.map((item, index) => [item.uuid, index]),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories],
  );

  useEffect(() => {
    // Set the first category as activeSection when the component mounts
    setActiveSection(
      localCategories?.[0]?.uuid?.length
        ? localCategories?.[0]?.uuid
        : isPopularVisible
          ? "popular"
          : null,
    );
  }, [isPopularVisible, localCategories]);

  useEffect(() => {
    const handleScroll = () => {
      const sections: NodeListOf<HTMLDivElement> =
        document.querySelectorAll("[data-section]");
      const lastSectionId = sections[sections.length - 1]?.getAttribute("id");
      const firstSectionId = sections[0]?.getAttribute("id");

      sections.forEach((section) => {
        if (
          scrollY >=
          section.getBoundingClientRect().top +
            window.pageYOffset -
            (isBigDesktop ? 151 : isDesktop ? 131 : 41)
        ) {
          const current = section?.getAttribute("id");
          setActiveSection(current);
        }
      });

      if (window.scrollY === 0) {
        setActiveSection(firstSectionId);
      }

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        setActiveSection(lastSectionId);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeSection === null) return;
    swiperRef.current?.swiper?.slideTo(slideIdToIndexMap[activeSection]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const handleClick = (event: any, uuid?: string) => {
    event.preventDefault();
    if (uuid) {
      setActiveSection(uuid);
    }
    scrollToView(uuid, isBigDesktop ? -130 : isDesktop ? -110 : -40);
  };

  if (loading) {
    return (
      <div className={`${cls.loadingContainer} white-splash`}>
        <button className={cls.iconBtn}>
          <Search2LineIcon />
        </button>
        <div className={cls.body}>
          {Array.from(Array(8).keys()).map((_, index) => (
            <div key={index} className={cls.item} />
          ))}
        </div>
      </div>
    );
  }

  if (!localCategories?.length) {
    return <div></div>;
  }

  return (
    <div className={`${cls.container} white-splash`}>
      {!loading && (
        <>
          <button className={cls.iconBtn} onClick={openSearch}>
            <Search2LineIcon />
          </button>
          {showPrevButton && (
            <button onClick={() => swiperRef.current?.swiper.slidePrev()}>
              <ArrowLeftSLineIcon />
            </button>
          )}
          <Swiper
            ref={swiperRef}
            slidesPerView="auto"
            spaceBetween={5}
            // navigation
            // modules={[Navigation]}
            onReachEnd={() => setShowNextButton(false)}
            onReachBeginning={() => setShowPrevButton(false)}
            onSlideChange={(swiper) => {
              const isBeginning = swiper.isBeginning;
              const isEnd = swiper.isEnd;
              setShowPrevButton(!isBeginning);
              setShowNextButton(!isEnd);
            }}
            className="category-swiper"
          >
            {localCategories.map((item) => (
              <SwiperSlide className={cls.categorySlide} key={item.id}>
                <a
                  className={`${cls.categoryItem} ${activeSection === item.uuid ? "active" : ""}`}
                  onClick={(event) => handleClick(event, item.uuid)}
                  href={`#${item.uuid}`}
                >
                  {item.translation?.title}
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
          {showNextButton && (
            <button onClick={() => swiperRef.current?.swiper.slideNext()}>
              <ArrowRightSLineIcon />
            </button>
          )}
        </>
      )}
    </div>
  );
}
