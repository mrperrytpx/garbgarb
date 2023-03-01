import { axiosClient } from "../../utils/axiosClient";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import type { TProductDetails } from "../api/product";

const ArticlePage = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return <div>{JSON.stringify(data, null, 2)}</div>;
};

export default ArticlePage;

export const getServerSideProps: GetServerSideProps<{ data: TProductDetails | undefined }> = async (
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
