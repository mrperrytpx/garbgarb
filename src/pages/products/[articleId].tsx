import { axiosClient } from "../../utils/axiosClient";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import type { TProductDetails } from "../api/product";
import Image from "next/image";
import { Dropdown } from "../../components/Dropdown";
import { useState, useMemo } from "react";
import parse from "html-react-parser";
import type { TSizes } from "../api/productSizes";
import SizesTable from "../../components/SizesTable";

const dropdownOptions = [
  {
    state: "one",
  },
  {
    state: "two",
  },
  {
    state: "three",
  },
];

const ArticlePage = ({ data, sizes }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [dropdownValue, setDropdownValue] = useState(dropdownOptions[0].state);
  const [quantity, setQuantity] = useState("1");
  const [isToggledSizes, setIsToggledSizes] = useState(false);

  const splitName = data?.result.sync_product.name.split(" ");
  const whichIndex = splitName.indexOf("Unisex");
  const shirtName = splitName.slice(0, whichIndex).join(" ");
  const defualtShirtName = splitName.slice(whichIndex).join(" ");

  const handleQuantity = () => {
    if (!quantity) setQuantity("1");
    if (+quantity < 1 || +quantity > 999) setQuantity("1");
  };

  return (
    <div className="mb-28 flex flex-col items-center justify-center gap-24 p-6 lg:flex-row">
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
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl">{data?.result.sync_variants[0].retail_price}€*</p>
          <p className="text-xs">*Taxes not included</p>
        </div>
        <p className="text-center text-sm">{data?.result.sync_variants[0].product.name}</p>
        <div className="flex flex-col items-center justify-center">
          <p className="text-md">Size:</p>
          <Dropdown state={dropdownValue} setState={setDropdownValue} options={dropdownOptions} />
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
      {isToggledSizes && sizes && (
        <div className="flex flex-col items-center justify-center gap-4">
          {/* <div className="flex flex-col items-center justify-center gap-2">
            {parse(measureYourself)}
          </div>
          <div className="flex flex-col items-start justify-center gap-2">
            {parse(measureYourselfGuide)}
          </div> */}
          <SizesTable sizes={sizes} />
        </div>
      )}
    </div>
  );
};

export default ArticlePage;

export const getServerSideProps: GetServerSideProps<{
  data: TProductDetails;
  sizes: TSizes;
}> = async (context) => {
  const { articleId } = context.query;
  const articleRes = await axiosClient.get<TProductDetails>("/api/product", {
    params: { id: articleId },
  });
  const articleData = articleRes.data;

  const sizesRes = await axiosClient.get<TSizes>("/api/productSizes", {
    params: { id: articleData.result.sync_variants[0].product.product_id },
  });
  const sizesData = sizesRes.data;

  return {
    props: {
      data: articleData,
      sizes: sizesData,
    },
  };
};
