import { apiInstance } from "../../utils/axiosClients";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import type { TProductDetailsResult } from "../api/product";
import Image from "next/image";
import { SizeDropdown } from "../../components/SizeDropdown";
import { useState, useEffect } from "react";
import parse from "html-react-parser";
import type { TProductSizes } from "../api/product/sizes";
import type { TWarehouseResult } from "../api/product/availability";
import SizesTable from "../../components/SizesTable";
import { Portal } from "../../components/Portal";
import { addToCart, TCartProduct } from "../../redux/slices/cartSlice";
import { useDispatch } from "react-redux";
import { currency } from "../../utils/currency";
import { Accordion } from "../../components/Accordion";

const CheckmarkIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="white"
      className="h-6 w-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
};

const ArticlePage = ({
  data,
  sizes,
  product,
  productColors,
  productDescription,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [color, setColor] = useState(productColors[0]);
  const [option, setOption] = useState(product[color].filter((x) => x.inStock)[0]);

  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCentimeters, setIsCentimeters] = useState(true);

  const dispatch = useDispatch();

  const splitName = data?.sync_product.name.split(" ");
  const splitIndex = splitName.indexOf("Unisex");
  const myShirtName = splitName.slice(0, splitIndex).join(" ");
  const baseShirtName = splitName.slice(splitIndex).join(" ");

  const handleQuantity = () => {
    if (!quantity) setQuantity(1);
    if (+quantity < 1 || +quantity > 999) setQuantity(1);
  };

  function handleAddToCart() {
    if (!option || !data) return;

    const payload: TCartProduct = {
      name: data?.sync_product.name,
      quantity: quantity,
      color_code: option.color_code,
      color_name: option.color_name,
      sku: data?.sync_variants[option.index].sku,
      price: data?.sync_variants[option.index].retail_price,
      size: option?.size,
      size_index: option.index,
      variant_image: data?.sync_variants[option.index].files[1].thumbnail_url,
      store_product_variant_id: data?.sync_variants[option.index].id,
      store_product_id: data?.sync_variants[option.index].sync_product_id,
      base_product_variant_id: data?.sync_variants[option.index].variant_id,
      base_product_id: data?.sync_variants[option.index].product.product_id,
      external_id: data?.sync_variants[option.index].external_id,
    };

    if (!payload) return;

    dispatch(addToCart(payload));
  }

  function handleColorChange(color: string): void {
    setColor(color);
    setOption(product[color].filter((x) => x.inStock)[0]);
    setQuantity(1);
  }

  useEffect(() => {
    if (typeof window != "undefined" && window.document) {
      if (isSizeGuideOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSizeGuideOpen]);

  if (!data || !product || !option) return <div>Something went wrong...</div>;

  return (
    <div className="mx-auto max-w-screen-lg">
      <div className="flex flex-col items-center justify-center gap-6 p-4 md:flex-row lg:mt-6 lg:gap-28">
        <div className="sticky top-[76px]  max-w-[350px] rounded-lg border-4 md:flex-1 md:self-start lg:max-w-[500px]">
          <Image
            priority={true}
            width={500}
            height={500}
            alt="Piece of clothing with some words written on it"
            src={data?.sync_variants[option.index].files[1].preview_url}
            className="rounded-lg"
          />
        </div>

        <article className="mb-10 flex w-full flex-col items-center justify-center gap-6 md:flex-1 lg:max-w-[450px]">
          <div className="flex w-full flex-col items-start justify-center gap-4">
            <div className="flex w-full flex-col gap-0.5">
              <h1 className="text-left text-xl font-bold">{myShirtName}</h1>
              <p className="text-left text-xl">{baseShirtName}</p>
              <p
                style={{ backgroundColor: option.color_code }}
                className="block w-full rounded-lg pl-2 text-white"
              >
                {option.color_name}
              </p>
            </div>
            <p className="text-left text-xl">
              {currency(+data?.sync_variants[option?.index].retail_price)}
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2">
            {productColors.map((prodColor) => (
              <div
                className="p-0.25 relative flex items-center justify-center rounded-lg"
                key={prodColor}
              >
                <button
                  onClick={() => handleColorChange(prodColor)}
                  style={{
                    backgroundColor: prodColor,
                  }}
                  className="h-10 w-10 rounded-lg border-2"
                />
                {prodColor === color && (
                  <div className="absolute">
                    <CheckmarkIcon />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex w-full flex-col items-start justify-center">
            <p>Select Size:</p>
            <SizeDropdown
              getValue={(option) => option.id}
              getLabel={(option) => option.size}
              state={option}
              setState={setOption}
              options={product[color]}
            />
          </div>
          {/*  */}
          <div className="flex w-full flex-col gap-0.5">
            <p className="px-1 text-sm font-semibold">Qty:</p>
            <div className="flex gap-2">
              <input
                value={quantity}
                onChange={(e) => setQuantity(+e.target.value)}
                className="w-[100px] rounded-lg border p-3"
                onBlur={handleQuantity}
                min="1"
                max="999"
                type="number"
              />
              <button
                onClick={handleAddToCart}
                className="w-full self-end rounded-lg border p-3 hover:bg-slate-600 hover:text-white"
              >
                Add to cart!
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <Accordion title="More Details">{parse(productDescription)}</Accordion>
            <Accordion title="Size Guide">
              <p
                onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
                className="mb-4 cursor-pointer p-2 text-center text-sm font-bold   text-red-500"
              >
                Click to {isSizeGuideOpen ? "close" : "open"} the sizes guide
              </p>
            </Accordion>
            <Accordion title="Quality Guarantee & Returns">
              <li className="list-item text-sm font-normal">
                Quality is guaranteed. If there is a print error or visible quality issue, we'll
                replace or refund it.
              </li>
              <li className="list-item text-sm font-normal last-of-type:mb-4">
                Because the products are made to order, we do not accept general returns or
                sizing-related returns.
              </li>
            </Accordion>
          </div>
        </article>
      </div>
      {isSizeGuideOpen && sizes && (
        <Portal>
          <div className="relative flex max-h-full max-w-screen-md flex-col items-center gap-4 overflow-y-auto rounded-md border-2 bg-white p-4">
            <div role="heading" className="w-full border-b-2 font-bold">
              Measure yourself
            </div>
            <div className="flex w-full flex-col items-start justify-center gap-2 text-sm">
              {parse(sizes.size_tables[0].description.replace(/(\r\n|\n|\r)/gm, ""))}
            </div>
            <div className="flex flex-col items-start justify-center gap-2 sm:flex-row">
              <div className="w-[150px] self-center sm:self-start">
                <Image
                  width={150}
                  height={150}
                  alt="Visual guide for measuring yourself"
                  src={sizes?.size_tables[0].image_url}
                />
              </div>
              <div className="flex flex-1 flex-col items-start justify-center gap-2 text-sm">
                {parse(sizes.size_tables[0].image_description.replace(/(\r\n|\n|\r)/gm, ""))}
              </div>
            </div>
            <div className="flex gap-4 self-start">
              <span
                onClick={() => setIsCentimeters(true)}
                className={`cursor-pointer p-2 ${isCentimeters && "border-b-4 border-gray-500"}`}
              >
                Centimeters
              </span>
              <span
                onClick={() => setIsCentimeters(false)}
                className={`cursor-pointer p-2 ${!isCentimeters && "border-b-4 border-gray-500"}`}
              >
                Inches
              </span>
            </div>
            <SizesTable isCentimeters={isCentimeters} sizes={sizes} />
            <span
              tabIndex={1}
              onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
              className="absolute right-0 top-0 cursor-pointer p-1 pr-4 text-xl font-bold"
            >
              X
            </span>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default ArticlePage;

export type TWarehouseProduct = {
  id: number;
  size: string;
  inStock: boolean;
  index: number;
  color_name: string;
  color_code: string;
};

export const getServerSideProps: GetServerSideProps<{
  data: TProductDetailsResult;
  sizes: TProductSizes;
  product: { [key: string]: Array<TWarehouseProduct> };
  productDescription: string;
  productColors: Array<string>;
}> = async (context) => {
  const { articleId } = context.query;
  const articleRes = await apiInstance.get<TProductDetailsResult>("/api/product", {
    params: { id: articleId },
  });
  const articleData = articleRes.data;

  const productId = articleData.sync_variants[0].product.product_id;

  const sizesRes = await apiInstance.get<TProductSizes>("/api/product/sizes", {
    params: { id: productId },
  });
  const sizesData = sizesRes.data;

  const availabilityRes = await apiInstance.get<TWarehouseResult>("/api/product/availability", {
    params: { id: productId },
  });
  const availabilityData = availabilityRes.data;

  const productDescription = availabilityData.product.description
    .split("\n")
    .map((x) => `<li className="text-sm block w-full last-of-type:mb-4 font-normal">${x}</li>`)
    .slice(2)
    .join("");

  const variantIds = articleData?.sync_variants.reduce((acc: number[], variant) => {
    acc.push(variant.variant_id);
    return acc;
  }, []);

  const product: { [key: string]: Array<TWarehouseProduct> } = {};

  variantIds.forEach((id, i) => {
    const variant = availabilityData.variants.find((x) => x.id === id);
    if (!variant) return;

    const variantInfo = {
      index: i,
      id: variant?.id,
      size: variant?.size,
      inStock: !!variant?.availability_status.filter(
        (x) => x.region.includes("EU") && x.status === "in_stock"
      )[0],
      color_name: variant?.color,
      color_code: variant?.color_code,
    };

    product[variant.color_code] = product[variant.color_code]
      ? [...product[variant.color_code], variantInfo]
      : [variantInfo];
  });

  const productColors = Object.keys(product);

  return {
    props: {
      data: articleData,
      sizes: sizesData,
      product,
      productDescription,
      productColors,
    },
  };
};
