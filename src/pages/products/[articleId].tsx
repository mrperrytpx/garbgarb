import { axiosClient } from "../../utils/axiosClient";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import type { TProductDetails } from "../api/product";
import Image from "next/image";
import Dropdown from "../../components/Dropdown";

const ArticlePage = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div>
      <div>
        <Image
          width={600}
          height={600}
          alt="Piece of clothing with some words written on it"
          src={data?.result.sync_product.thumbnail_url}
        />
      </div>
      <h1>{data?.result.sync_product.name}</h1>
      <Dropdown />
    </div>
  );
};

export default ArticlePage;

export const getServerSideProps: GetServerSideProps<{ data: TProductDetails }> = async (
  context
) => {
  const { articleId } = context.query;
  const res = await axiosClient.get("/api/product", { params: { id: articleId } });
  const data = res.data;

  return {
    props: {
      data,
    },
  };
};
