import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import type { TCheckoutPayload } from "../../checkout";
import type { TWarehouseSingleVariant } from "../product/availability";
import type { TPrintfulStore } from "../store";
import type { TProductDetails, TProductVariant } from "../product/index";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
    apiVersion: "2022-11-15",
});

function formatAmountForStripe(amount: number, currency: string): number {
    let numberFormat = new Intl.NumberFormat(["en-US"], {
        style: "currency",
        currency: currency,
        currencyDisplay: "symbol",
    });
    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency: boolean = true;
    for (let part of parts) {
        if (part.type === "decimal") {
            zeroDecimalCurrency = false;
        }
    }
    return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}

const printfulStore = axios.create({
    baseURL: "https://api.printful.com/store",
    headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
    timeout: 7000,
    signal: new AbortController().signal,
});

interface PromiseFulfilledResult<T> {
    status: "fulfilled";
    value: T;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { cartItems, address }: { cartItems: Array<TCheckoutPayload>; address: string } =
            req.body;

        if (!cartItems) return res.status(400).end("Bad request");

        const promises: Promise<TProductVariant[] | Error>[] = [];

        cartItems.forEach((item) => {
            const promise: Promise<TProductVariant[] | Error> = new Promise(async (res, rej) => {
                try {
                    const response = await printfulStore.get<TProductDetails>(
                        `/products/${item.store_product_id}`
                    );

                    if (response.status === 404) {
                        throw new Error("Product not found");
                    }

                    const data: TProductVariant[] = response.data.result.sync_variants;
                    res(data);
                } catch (err: any) {
                    if (err instanceof Error) {
                        rej(err);
                    }
                }
            });
            promises.push(promise);
        });

        const printfulStoreItems = (await Promise.allSettled(promises))
            .filter((x) => x.status === "fulfilled")
            .map((x) => (x as PromiseFulfilledResult<TProductVariant[]>).value)
            .flat();

        const cartItemsCheck = cartItems.map((item) => {
            const storeItem = printfulStoreItems.find(
                (x) => x.id === item.store_product_variant_id
            );

            if (!storeItem) return {};

            return storeItem;
        });

        console.log(cartItemsCheck);

        // console.log("CART ITEMS: ", cartItems);

        // const warehouseStock = await Promise.all(
        //     cartItems.map(async (item) => {
        //         const res = await axios.get<TWarehouseSingleVariant>(
        //             `https://api.printful.com/products/variant/${item.sync_variant_id}`
        //         );
        //         const data = res.data.result.variant;
        //         return data;
        //     })
        // );

        // const stripeProducts = await stripe.products.list({
        //     limit: numOfItemsInPrintfulStore,
        // });

        // const params: Stripe.Checkout.SessionCreateParams = {
        //     submit_type: "pay",
        //     mode: "payment",
        //     payment_method_types: ["card"],
        //     line_items: [
        //         ...cartItems.map((item) => ({
        //             price_data: {
        //                 currency: "eur",
        //                 unit_amount: formatAmountForStripe(+item.price, "eur"),
        //                 product_data: {
        //                     name: item.name,
        //                     images: [item.variant_image],
        //                     description: `Size: ${item.size}, Color: ${item.color_name}`,
        //                 },
        //             },
        //             quantity: item.quantity,
        //         })),
        //     ],
        //     success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/success`,
        //     cancel_url: process.env.NEXT_PUBLIC_SERVER_URL,
        // };

        // const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create(
        //     params
        // );

        const checkoutSession: any = {};

        res.json(checkoutSession);
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
