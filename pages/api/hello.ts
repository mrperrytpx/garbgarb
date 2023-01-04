// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from "axios";

// products https://api.printful.com/store/products?store_id=9524028
// single product https://api.printful.com/store/products/296406176?store_id=9524028

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {

  const { data } = await axios.get("https://api.printful.com/store/products/296406176?store_id=9524028", {
    headers: {
      'Authorization': `Bearer ${process.env.PRINTFUL_STORE_API_KEY}`
    }
  })

  res.status(200).json(data)
}
