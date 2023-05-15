import type { NextApiRequest, NextApiResponse } from "next";
import { TCartProduct } from "../../../redux/slices/cartSlice";
import { allowedCountries } from "../../../utils/allowedCountries";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";
import { estimateShippingCost } from "../../../lib/estimateShippingCost";
import { ValidatedAddress } from "../../checkout";

export type TShippingRatesResp = {
    shipping: number | string;
    vat: number;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { cartItems, address }: { cartItems: TCartProduct[]; address: ValidatedAddress } =
            req.body;

        if (!allowedCountries.includes(address.country)) {
            console.log("Country not allowed", address.country);
            return res.status(400).end("We don't ship to Your country, sorry!");
        }

        const transformedItems = cartItems.map((item) => ({
            quantity: item.quantity,
            sync_variant_id: item.store_product_variant_id,
            retail_price: item.price,
        }));

        const [estimateShippingCostError, estimatedCosts] = await tryCatchAsync(
            estimateShippingCost
        )(address, transformedItems);

        if (estimateShippingCostError || !estimatedCosts) {
            console.log(estimateShippingCostError);
            return res
                .status(estimateShippingCostError?.statusCode || 500)
                .end(estimateShippingCostError?.message);
        }

        const calculatedVAT =
            Math.round(
                (estimatedCosts.costs.total /
                    (estimatedCosts.costs.subtotal +
                        estimatedCosts.costs.shipping -
                        estimatedCosts.costs.discount)) *
                    100
            ) / 100;

        res.json({
            shipping: Math.round(+estimatedCosts.retail_costs.shipping * calculatedVAT * 100) / 100,
            vat: calculatedVAT,
        });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
