import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import SEO from "components/seo";
import StoreContainer from "containers/storeContainer/storeContainer";
import ShopHeader from "containers/shopHeader/shopHeader";
import ProductList from "containers/productList/productList";
import { useMediaQuery } from "@mui/material";
import MobileShopNavbar from "containers/mobileShopNavbar/mobileShopNavbar";
import { GetServerSideProps } from "next";
import { dehydrate, QueryClient, useQuery } from "react-query";
import shopService from "services/shop";
import { useRouter } from "next/router";
import productService from "services/product";
import { CategoryWithProducts } from "interfaces";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import { useTranslation } from "react-i18next";
import { clearProduct, selectProduct } from "redux/slices/product";
import dynamic from "next/dynamic";
import { getCookie, removeCookie } from "utils/session";
import getImage from "utils/getImage";
import getLanguage from "utils/getLanguage";
import useDebounce from "hooks/useDebounce";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const ProductContainer = dynamic(
  () => import("containers/productContainer/productContainer"),
);
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const PageLoading = dynamic(() => import("components/loader/pageLoading"));
const CategorySearchInput = dynamic(
  () => import("components/categorySearchInput/categorySearchInput"),
);

type Props = {
  memberState: any;
};

const renderProductList = (
  items: CategoryWithProducts[],
  loading: boolean,
  hasParent?: boolean,
  title?: string,
) => {
  return items?.map((item) => {
    return (
      <Fragment key={item.id}>
        <ProductList
          uuid={item.uuid}
          title={title || item.translation?.title}
          products={
            item.products.concat(
              item.children?.length > 0
                ? item.children.flatMap((child) => child.products)
                : [],
            ) || []
          }
          loading={loading}
        />
      </Fragment>
    );
  });
};

export default function Restaurant({ memberState }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { query, replace } = useRouter();
  const shopId = Number(query.id);
  const currency = useAppSelector(selectCurrency);
  const { product, isOpen } = useAppSelector(selectProduct);
  const dispatch = useAppDispatch();
  const isOpenProduct = Boolean(query.product) || isOpen;
  const uuid = String(query.product || "");

  const [isSearchCategorySearchOpen, setIsSearchCategorySearchOpen] =
    useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const debounceSearchValue = useDebounce(searchValue, 500);

  useEffect(() => {
    if (products?.data?.all?.length && isSearchCategorySearchOpen) {
      if (debounceSearchValue?.length) {
        handleSearch(debounceSearchValue);
      } else {
        setFilteredProducts(products?.data?.all || []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceSearchValue]);

  const { data, error } = useQuery(
    ["shop", shopId, locale],
    () => shopService.getById(shopId),
    { keepPreviousData: true },
  );

  const { data: products, isLoading } = useQuery(
    [
      "products",
      shopId,
      currency?.id,
      locale,
      query?.category_id,
      query?.sub_category_id,
      query?.brands,
    ],
    () => {
      let params: Record<string, string | undefined | number | string[]> = {
        currency_id: currency?.id,
        category_id: query?.sub_category_id || query?.category_id || undefined,
      };
      if (query?.brands) {
        if (Array.isArray(query.brands)) {
          delete params["brand_ids[0]"];
          params = Object.assign(
            params,
            ...query?.brands?.map((brand, index) => ({
              [`brand_ids[${index}]`]: brand,
            })),
          );
        } else {
          params = Object.assign(params, { [`brand_ids[0]`]: query?.brands });
        }
      }

      return productService.getAllShopProducts(shopId, params);
    },
    {
      staleTime: 0,
      onSuccess: (data) => {
        setFilteredProducts(data?.data?.all || []);
      },
    },
  );

  const extractedCategories = useMemo(
    () => products?.data?.all?.map((item: any) => ({ ...item, products: [] })),
    [products?.data?.all],
  );

  const handleCloseProduct = () => {
    dispatch(clearProduct());
    const params: Record<string, string | undefined | number> = {
      id: shopId,
    };
    if (query?.category_id) {
      params.category_id = query?.category_id as string;
    }
    if (query?.sub_category_id) {
      params.sub_category_id = query?.sub_category_id as string;
    }
    if (uuid) {
      replace(
        {
          query: params,
        },
        undefined,
        { shallow: true },
      );
    }
  };

  const handleCloseCategorySearch = () => {
    if (!searchValue?.length) {
      setIsSearchCategorySearchOpen(false);
    } else {
      setSearchValue("");
    }
  };

  const handleSearch = useCallback(
    (search: string = "") => {
      const filtered: any = [];

      for (let i = 0; i < products?.data?.all?.length; i++) {
        const category = products?.data?.all?.[i];
        const categoryWithoutProduct = {
          ...products?.data?.all?.[i],
          products: [],
        };
        for (let j = 0; j < category?.products?.length; j++) {
          const product = category?.products?.[j];
          if (
            product?.translation?.title
              ?.toLowerCase()
              ?.includes(search?.toLowerCase())
          ) {
            categoryWithoutProduct?.products?.push(product);
          }
        }
        if (categoryWithoutProduct?.products?.length) {
          filtered?.push(categoryWithoutProduct);
        }
      }
      setFilteredProducts(filtered);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products?.data?.all],
  );

  if (error) {
    console.log("error => ", error);
    replace("/");
    return <PageLoading />;
  }

  return (
    <>
      <SEO
        title={data?.data?.translation?.title}
        description={data?.data?.translation?.description}
        image={getImage(data?.data?.logo_img)}
      />
      <StoreContainer
        data={data?.data}
        memberState={memberState}
        categories={extractedCategories || []}
      >
        <ShopHeader />
        {isSearchCategorySearchOpen ? (
          <CategorySearchInput
            searchTerm={searchValue}
            setSearchTerm={setSearchValue}
            handleClose={handleCloseCategorySearch}
          />
        ) : (
          <MobileShopNavbar
            categories={extractedCategories || []}
            loading={isLoading}
            isPopularVisible={!!products?.data?.recommended?.length}
            openSearch={() => setIsSearchCategorySearchOpen(true)}
          />
        )}
        {!!products?.data?.recommended?.length &&
        !debounceSearchValue?.length ? (
          <ProductList
            title={t("popular")}
            products={products?.data?.recommended || []}
            loading={isLoading}
          />
        ) : (
          <div></div>
        )}
        {filteredProducts ? (
          renderProductList(filteredProducts, isLoading, !!query?.category_id)
        ) : (
          <div></div>
        )}
        {isDesktop ? (
          <ModalContainer open={!!isOpenProduct} onClose={handleCloseProduct}>
            <ProductContainer
              handleClose={handleCloseProduct}
              data={product}
              uuid={uuid}
            />
          </ModalContainer>
        ) : (
          <MobileDrawer open={!!isOpenProduct} onClose={handleCloseProduct}>
            <ProductContainer
              handleClose={handleCloseProduct}
              data={product}
              uuid={uuid}
            />
          </MobileDrawer>
        )}
      </StoreContainer>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient();
  const shopId = Number(ctx.query.id);
  const groupId = Number(ctx.query.g);
  let memberState = getCookie("member", ctx);
  const locale = getLanguage(ctx.req.cookies?.locale);

  if (memberState && groupId) {
    if (memberState.cart_id !== groupId) {
      removeCookie("member");
      memberState = null;
    }
  }

  await queryClient.prefetchQuery(["shop", shopId, locale], () =>
    shopService.getById(shopId),
  );

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      memberState,
    },
  };
};
