import type { NextApiRequest, NextApiResponse } from "next";
import { TCartProduct } from "../../../redux/slices/cartSlice";
import type { TAddress } from "../../checkout";
import { allowedCountries } from "../../../utils/allowedCountries";
import { tryCatch } from "../../../utils/tryCatchWrapper";
import { validateAddress } from "../../../lib/validateAddress";
import { estimateShippingCost } from "../../../lib/estimateShippingCost";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { cartItems, address }: { cartItems: TCartProduct[]; address: TAddress } = req.body;

        if (!allowedCountries.includes(address.country_code)) {
            return res.status(400).end("We don't ship to Your country, sorry!");
        }

        const [validateAddressError, validatedAddress] = await tryCatch(validateAddress)(address);

        if (validateAddressError || validatedAddress === null) {
            return res.status(400).end(validateAddressError?.message);
        }

        const [estimateShippingCostError, estimatedCosts] = await tryCatch(estimateShippingCost)(
            validatedAddress,
            cartItems
        );

        if (estimateShippingCostError || estimatedCosts === null) {
            return res.status(400).end(estimateShippingCostError?.message);
        }

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
