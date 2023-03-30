import React from "react";
import { apiInstance } from "../../utils/axiosClients";
import type { TPrintfulStore } from "../api/store";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { ProductCard } from "../../components/ProductCard";

const ProductsPage = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="flex flex-1 flex-col flex-wrap items-center justify-center gap-8 py-8 md:flex-row">
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
  const res = await apiInstance.get<TPrintfulStore>("/api/store");
  const data = res.data;

  return {
    props: {
      data,
    },
  };
};
