import React from "react";
import { axiosClient } from "../../utils/axiosClient";
import type { TPrintfulStore } from "../api/store";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";

const ProductsPage = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div>
      {data?.result.map((product) => (
        <div className=" p-8">{JSON.stringify(product, null, 10)}</div>
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
