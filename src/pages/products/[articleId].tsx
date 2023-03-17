import { axiosClient } from "../../utils/axiosClient";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import type { TProductDetails } from "../api/product";
import Image from "next/image";
import { Dropdown } from "../../components/Dropdown";
import { useState } from "react";
import parse from "html-react-parser";
import type { TSizes } from "../api/product/sizes";
import type { TProductAvailability } from "../api/product/availability";
import SizesTable from "../../components/SizesTable";
import { Portal } from "../../components/Portal";

const ArticlePage = ({
  data,
  sizes,
  dropdownOptions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [dropdownState, setDropdownState] = useState(dropdownOptions[0]);
  const [quantity, setQuantity] = useState("1");
  const [isToggledSizes, setIsToggledSizes] = useState(false);
  const [isCentimeters, setIsCentimeters] = useState(true);

  const splitName = data?.result.sync_product.name.split(" ");
  const whichIndex = splitName.indexOf("Unisex");
  const shirtName = splitName.slice(0, whichIndex).join(" ");
  const defualtShirtName = splitName.slice(whichIndex).join(" ");

  const handleQuantity = () => {
    if (!quantity) setQuantity("1");
    if (+quantity < 1 || +quantity > 999) setQuantity("1");
  };

  return (
    <div className="m-auto lg:mt-[50px]">
      <div className="flex flex-col items-center justify-center gap-4 p-6 lg:flex-row lg:gap-24">
        <div className="max-w-[500px] border-2">
          <Image
            priority={true}
            width={600}
            height={600}
            alt="Piece of clothing with some words written on it"
            src={data?.result.sync_product.thumbnail_url}
          />
        </div>

        <article className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-center text-2xl font-bold">{shirtName}</h1>
            <p className="text-center text-xl">{defualtShirtName}</p>
          </div>
          {/* 
          <p className="text-center text-sm">
            {data?.result.sync_variants[dropdownState?.].product.name}
          </p> */}

          <div className="flex flex-col items-center justify-center">
            <p className="text-md">Size:</p>
            <Dropdown state={dropdownState} setState={setDropdownState} options={dropdownOptions} />
          </div>
          <div className="flex flex-col items-center justify-center">
            <p>Quantity:</p>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="block w-32 border p-4 text-center"
              onBlur={handleQuantity}
              min="1"
              max="999"
              type="number"
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            {/* <p className="text-3xl">
              {Math.round(
                +data?.result.sync_variants[dropdownState?.index].retail_price *
                  Math.abs(+quantity) *
                  100
              ) / 100}
              €*
            </p> */}
            <p className="text-xs">*Taxes not included</p>
          </div>
          <button className="min-w-[8rem] border p-4 hover:bg-slate-600 hover:text-white">
            Add to cart!
          </button>
          <p
            onClick={() => setIsToggledSizes(!isToggledSizes)}
            className="cursor-pointer p-2 text-center text-sm font-bold"
          >
            Click to {isToggledSizes ? "close" : "open"} the sizes guide
          </p>
        </article>
      </div>
      {isToggledSizes && sizes && (
        <Portal>
          <div className="relative flex max-w-[800px] flex-col items-center justify-center gap-4 rounded-md border-2 bg-white p-4">
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
              onClick={() => setIsToggledSizes(false)}
              className="absolute right-0 top-0 cursor-pointer px-2 py-1 text-2xl font-bold"
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

export type TAvailableSizes = {
  id: number | undefined;
  size: string | undefined;
  inStock: boolean | undefined;
  index: number;
};

export const getServerSideProps: GetServerSideProps<{
  data: TProductDetails;
  sizes: TSizes;
  dropdownOptions: Array<TAvailableSizes>;
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

  const availabilityRes = await axiosClient.get<TProductAvailability>("/api/product/availability", {
    params: { id: articleData.result.sync_variants[0].product.product_id },
  });
  const availabiltiyData = availabilityRes.data;

  let sizes: Array<TAvailableSizes> = new Array(articleData.result.sync_variants.length)
    .fill({})
    .map((x, i) => ({ ...x, id: articleData.result.sync_variants[i].variant_id }));

  sizes = sizes.map((size, i) => {
    const variant = availabiltiyData.result.variants.find((x) => x.id === size.id);
    return {
      index: i,
      id: variant?.id,
      size: variant?.size,
      inStock: !!variant?.availability_status.find(
        (x) => x.region === "EU" && x.status === "in_stock"
      ),
    };
  });

  console.log(sizes);

  return {
    props: {
      data: articleData,
      sizes: sizesData,
      dropdownOptions: sizes,
    },
  };
};
