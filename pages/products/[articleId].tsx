import React from 'react'
import { useRouter } from 'next/router';

const ArticlePage = () => {

  const router = useRouter();
  const { productId } = router.query;

  return (
    <div>{productId}</div>
  )
}

export default ArticlePage;