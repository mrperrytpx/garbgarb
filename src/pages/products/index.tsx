import React from "react";
import { axiosClient } from "../../utils/axiosClient";
import type { TPrintfulStore } from "../api/store";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import ProductCard from "../../components/ProductCard";

const ProductsPage = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8 md:flex-row">
      {data?.result.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          thumbnail={product.thumbnail_url}
        />
      ))}
    </div>
  );
};

export default ProductsPage;

export const getServerSideProps: GetServerSideProps<{
  data: TPrintfulStore | undefined;
}> = async () => {
  const res = await axiosClient.get<TPrintfulStore>("/api/store");
  const data = res.data;

  return {
    props: {
      data,
    },
  };
};
