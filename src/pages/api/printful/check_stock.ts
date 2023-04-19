import { NextApiRequest, NextApiResponse } from "next";
import { TCheckoutPayload, cartItemsSchema } from "../stripe/checkout_session";
import { tryCatchAsync, tryCatchSync } from "../../../utils/tryCatchWrappers";
import { z } from "zod";
import { checkPayloadStock } from "../../../lib/checkPayload";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { cartItems }: { cartItems: TCheckoutPayload } = req.body;

        if (!cartItems) {
            console.log("No items in cart");
            return res.status(400).end("Please add items to your cart");
        }

        // CART ITEMS VALIDATION
        const [zodError, parsedCartItems] = tryCatchSync(cartItemsSchema.parse)(cartItems);

        if (zodError || !parsedCartItems) {
            console.log(zodError);
            if (zodError instanceof z.ZodError) {
                return res.status(400).end(zodError.message);
            } else {
                return res.status(400).end("Wrong Items shape");
            }
        }

        const [stockError, stockData] = await tryCatchAsync(checkPayloadStock)(cartItems);
        if (stockError || !stockData) {
            console.log(stockError);
            return res.status(stockError?.statusCode || 500).end(stockError?.message);
        }

        res.status(200).json(stockData);
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
