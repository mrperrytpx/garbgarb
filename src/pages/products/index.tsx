import React from "react";
import { apiInstance } from "../../utils/axiosClients";
import type { TProduct } from "../api/store";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { ProductCard } from "../../components/ProductCard";

const ProductsPage = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="flex flex-1 flex-col flex-wrap items-center justify-center gap-8 py-8 md:flex-row">
      {data?.map((product) => (
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
  data: TProduct[] | undefined;
}> = async () => {
  const res = await apiInstance.get<TProduct[]>("/api/store");
  const data = res.data;

  return {
    props: {
      data,
    },
  };
};
