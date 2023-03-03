import { axiosClient } from "../../utils/axiosClient";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import type { TProductDetails } from "../api/product";
import Image from "next/image";
import { Dropdown } from "../../components/Dropdown";
import { useState } from "react";

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

const ArticlePage = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [dropdownValue, setDropdownValue] = useState(dropdownOptions[0].state);

  return (
    <div className="mb-28">
      {/* {JSON.stringify(data, null, 2)} */}
      <div className="max-w-[500px]">
        <Image
          width={600}
          height={600}
          alt="Piece of clothing with some words written on it"
          src={data?.result.sync_product.thumbnail_url}
        />
      </div>
      <h1>{data?.result.sync_product.name}</h1>
      <p>PRICE: {data?.result.sync_variants[0].retail_price}€</p>
      <p>{data?.result.sync_variants[0].product.name}</p>
      <p>SIZE:</p>
      <Dropdown state={dropdownValue} setState={setDropdownValue} options={dropdownOptions} />
      <p>QUANTITY</p>
      <input className="block" id="number" type="number" />
      <button>Add to cart!</button>
      <p>click to toggle size guide</p>
    </div>
  );
};

export default ArticlePage;

export const getServerSideProps: GetServerSideProps<{ data: TProductDetails }> = async (
  context
) => {
  const { articleId } = context.query;
  const res = await axiosClient.get<TProductDetails>("/api/product", { params: { id: articleId } });
  const data = res.data;

  return {
    props: {
      data,
    },
  };
};
