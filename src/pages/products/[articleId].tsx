import { axiosClient } from "../../utils/axiosClient";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import type { TProductDetails } from "../api/product";
import Image from "next/image";
import { Dropdown } from "../../components/Dropdown";
import { useState, useEffect } from "react";
import parse from "html-react-parser";
import type { TSizes } from "../api/product/sizes";
import type { TWarehouse } from "../api/product/availability";
import SizesTable from "../../components/SizesTable";
import { Portal } from "../../components/Portal";
import { addToCart, TCartProduct } from "../../redux/slices/cartSlice";
import { useDispatch } from "react-redux";
import { currency } from "../../utils/currency";

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

  const splitName = data?.result.sync_product.name.split(" ");
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
      name: data?.result.sync_product.name,
      quantity: quantity,
      color_code: option.color_code,
      color_name: option.color_name,
      sku: data?.result.sync_variants[option.index].sku,
      price: data?.result.sync_variants[option.index].retail_price,
      size: option?.size,
      size_index: option.index,
      variant_image: data?.result.sync_variants[option.index].files[1].thumbnail_url,
      store_product_variant_id: data?.result.sync_variants[option.index].id,
      store_product_id: data?.result.sync_variants[option.index].sync_product_id,
      base_product_variant_id: data?.result.sync_variants[option.index].variant_id,
      base_product_id: data?.result.sync_variants[option.index].product.product_id,
      external_id: data?.result.sync_variants[option.index].external_id,
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
    <div className="flex-1">
      {/* {JSON.stringify(data, null, 2)} */}
      <div className="flex flex-col items-center justify-center gap-4 p-6 lg:flex-row lg:gap-24">
        <div className="max-w-[500px] self-start border-2">
          <Image
            priority={true}
            width={600}
            height={600}
            alt="Piece of clothing with some words written on it"
            src={data?.result.sync_variants[option.index].files[1].preview_url}
          />
        </div>

        <article className="flex max-w-[90%] flex-col items-center justify-center gap-4 lg:max-w-[450px]">
          <div className="flex flex-col items-center justify-center gap-4">
            <div>
              <h1 className="text-center text-2xl font-bold">{myShirtName}</h1>
              <p className="text-center text-xl">{baseShirtName}</p>
            </div>
            <div className="text-sm">{parse(productDescription)}</div>
          </div>

          <p className="text-center text-sm">
            {data?.result.sync_variants[option?.index].product.name}
          </p>

          <div className="flex justify-center gap-2">
            {productColors.map((color, i) => (
              <button
                onClick={() => handleColorChange(color)}
                key={i}
                style={{
                  backgroundColor: color,
                }}
                className="h-14 w-14 rounded-lg border-2"
              />
            ))}
          </div>

          <div className="flex flex-col items-center justify-center">
            <p>CURRENT COLOR: {product[color][0].color_name}</p>
            <p className="text-md">Size:</p>
            <Dropdown
              getValue={(option) => option.id}
              getLabel={(option) => option.size}
              state={option}
              setState={setOption}
              options={product[color]}
            />
          </div>
          {/*  */}
          <div className="flex items-center justify-center gap-4">
            <div>
              <p>Quantity:</p>
              <input
                value={quantity}
                onChange={(e) => setQuantity(+e.target.value)}
                className="block w-32 border p-4 text-center"
                onBlur={handleQuantity}
                min="1"
                max="999"
                type="number"
              />
            </div>
            <div className="flex flex-col items-center justify-center self-end">
              <p className="text-3xl">
                {currency(+data?.result.sync_variants[option?.index].retail_price * +quantity)}
              </p>
              <p className="text-xs">*VAT not included</p>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="min-w-[8rem] border p-4 hover:bg-slate-600 hover:text-white"
          >
            Add to cart!
          </button>
          <p
            onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
            className="cursor-pointer p-2 text-center text-sm font-bold"
          >
            Click to {isSizeGuideOpen ? "close" : "open"} the sizes guide
          </p>
        </article>
      </div>
      {isSizeGuideOpen && sizes && (
        <Portal>
          <div className="relative flex max-h-full max-w-screen-md flex-col items-center gap-4 overflow-y-auto rounded-md border-2 bg-white p-4">
            <div role="heading" className="w-full border-b-2 font-bold">
              Measure yourself
            </div>
            <div className="flex w-full flex-col items-start justify-center gap-2 text-sm">
              {parse(sizes.result.size_tables[0].description.replace(/(\r\n|\n|\r)/gm, ""))}
            </div>
            <div className="flex flex-col items-start justify-center gap-2 sm:flex-row">
              <div className="w-[150px] self-center sm:self-start">
                <Image
                  width={150}
                  height={150}
                  alt="Visual guide for measuring yourself"
                  src={sizes?.result.size_tables[0].image_url}
                />
              </div>
              <div className="flex flex-1 flex-col items-start justify-center gap-2 text-sm">
                {parse(sizes.result.size_tables[0].image_description.replace(/(\r\n|\n|\r)/gm, ""))}
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
  data: TProductDetails;
  sizes: TSizes;
  product: { [key: string]: Array<TWarehouseProduct> };
  productDescription: string;
  productColors: Array<string>;
}> = async (context) => {
  const { articleId } = context.query;
  const articleRes = await axiosClient.get<TProductDetails>("/api/product", {
    params: { id: articleId },
  });
  const articleData = articleRes.data;

  const sizesRes = await axiosClient.get<TSizes>("/api/product/sizes", {
    params: { id: articleData.result.sync_variants[0].product.product_id },
  });
  const sizesData = sizesRes.data;

  const availabilityRes = await axiosClient.get<TWarehouse>("/api/product/availability", {
    params: { id: articleData.result.sync_variants[0].product.product_id },
  });
  const availabilityData = availabilityRes.data;

  const productDescription = availabilityData.result.product.description
    .split("\n")
    .map((x) => `<p>${x}</p>`)
    .join("");

  const variantIds = new Array(articleData?.result.sync_variants.length)
    .fill("")
    .map((_x, i) => articleData?.result.sync_variants[i].variant_id);

  const product: { [key: string]: Array<TWarehouseProduct> } = {};

  variantIds.forEach((id, i) => {
    const variant = availabilityData.result.variants.filter((x) => x.id === id)[0];

    const variantInfo = {
      index: i,
      id: variant.id,
      size: variant.size,
      inStock: !!variant?.availability_status.filter(
        (x) => x.region.includes("EU") && x.status === "in_stock"
      )[0],
      color_name: variant.color,
      color_code: variant.color_code,
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
