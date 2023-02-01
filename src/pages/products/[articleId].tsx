import React from "react";
import { useRouter } from "next/router";

const ArticlePage = () => {
  const router = useRouter();
  const { articleId } = router.query;

  return <div>{articleId}</div>;
};

export default ArticlePage;
