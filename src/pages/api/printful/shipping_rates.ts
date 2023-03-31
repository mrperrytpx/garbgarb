import type { NextApiRequest, NextApiResponse } from "next";
import { TCartProduct } from "../../../redux/slices/cartSlice";
import type { TAddress } from "../../checkout";
import { allowedCountries } from "../../../utils/allowedCountries";
import { tryCatchAsync } from "../../../utils/tryCatchWrappers";
import { validateAddress } from "../../../lib/validateAddress";
import { estimateShippingCost } from "../../../lib/estimateShippingCost";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { cartItems, address }: { cartItems: TCartProduct[]; address: TAddress } = req.body;

        if (!allowedCountries.includes(address.country_code))
            return res.status(400).end("We don't ship to Your country, sorry!");

        const [validateAddressError, validatedAddress] = await tryCatchAsync(validateAddress)(
            address
        );

        if (validateAddressError || !validatedAddress)
            return res
                .status(validateAddressError?.statusCode || 500)
                .end(validateAddressError?.message);

        const transformedItems = cartItems.map((item) => ({
            quantity: item.quantity,
            sync_variant_id: item.store_product_variant_id,
            retail_price: item.price,
        }));

        const [estimateShippingCostError, estimatedCosts] = await tryCatchAsync(
            estimateShippingCost
        )(validatedAddress, transformedItems);

        if (estimateShippingCostError || !estimatedCosts)
            return res
                .status(estimateShippingCostError?.statusCode || 500)
                .end(estimateShippingCostError?.message);

        const calculatedVAT =
            Math.round(
                (estimatedCosts.costs.total /
                    (estimatedCosts.costs.subtotal + estimatedCosts.costs.shipping)) *
                    100
            ) / 100;

        res.json({ shipping: estimatedCosts.retail_costs.shipping, vat: calculatedVAT });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
