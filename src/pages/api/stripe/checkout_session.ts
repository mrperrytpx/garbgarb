import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { z } from "zod";
import type { TBaseVariants, TWarehouseSingleVariant } from "../product/availability";
import type { TProductDetails, TProductVariant } from "../product/index";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
    apiVersion: "2022-11-15",
});

const cartItemsSchema = z.array(
    z.object({
        store_product_id: z.number(),
        store_product_variant_id: z.number(),
        quantity: z.number({ description: "Quantity can't be 0" }).min(1),
    })
);
export type TCheckoutPayload = z.infer<typeof cartItemsSchema>;

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
        const { cartItems, address }: { cartItems: TCheckoutPayload; address: string } = req.body;

        if (!cartItems) return res.status(400).end("Bad request");

        let parsedCartItems: TCheckoutPayload = [];
        try {
            parsedCartItems = cartItemsSchema.parse(cartItems);
        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).end(err.message);
            }
        }
        const uniqueProductIDsInCart = [
            ...new Set(parsedCartItems.map((item) => item.store_product_id)),
        ];

        const printfulStoreItemsPromises: Promise<TProductVariant[] | Error>[] = [];
        uniqueProductIDsInCart.forEach((item) => {
            const promise: Promise<TProductVariant[] | Error> = new Promise(async (res, rej) => {
                try {
                    const response = await printfulStore.get<TProductDetails>(`/products/${item}`);

                    if (response.status === 404) {
                        throw new Error("Product not found");
                    }

                    const data: TProductVariant[] = response.data.result.sync_variants;
                    res(data);
                } catch (err: any) {
                    rej(err as Error);
                }
            });
            printfulStoreItemsPromises.push(promise);
        });
        const printfulStoreItems = (await Promise.allSettled(printfulStoreItemsPromises))
            .filter((x) => x.status === "fulfilled")
            .map((x) => (x as PromiseFulfilledResult<TProductVariant[]>).value)
            .flat();

        const cartItemsExistInStore = parsedCartItems
            .map((item) => {
                const storeItem = printfulStoreItems.filter(
                    (x) => x.id === item.store_product_variant_id
                )[0];
                if (!storeItem) return null;
                return { ...storeItem, quantity: item.quantity };
            })
            .filter(Boolean) as (TProductVariant & { quantity: number })[];

        const uniqueVariantIDsInCart = [
            ...new Set(cartItemsExistInStore.map((item) => item?.variant_id)),
        ];

        const warehouseStock = (
            await Promise.allSettled(
                uniqueVariantIDsInCart.map(async (item) => {
                    const res = await axios.get<TWarehouseSingleVariant>(
                        `https://api.printful.com/products/variant/${item}`
                    );
                    const data = res.data.result.variant;
                    return data;
                })
            )
        )
            .filter((x) => x.status === "fulfilled")
            .map((x) => (x as PromiseFulfilledResult<TBaseVariants>).value);

        if (!cartItemsExistInStore)
            return res.status(400).end("Cart items don't exist in the store");

        const cartItemsInStock = cartItemsExistInStore
            .map((item) => {
                const warehouseItem = warehouseStock.find((x) => x.id === item?.variant_id);
                return {
                    ...item,
                    in_stock: !!warehouseItem?.availability_status.filter(
                        (reg) => reg.region.includes("EU") && reg.status === "in_stock"
                    ),
                };
            })
            .filter((item) => item.in_stock);

        if (!cartItemsInStock) return res.status(400).end("Cart items aren't in stock");

        const params: Stripe.Checkout.SessionCreateParams = {
            submit_type: "pay",
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                ...cartItemsInStock.map((item) => ({
                    price_data: {
                        currency: "eur",
                        unit_amount: formatAmountForStripe(+item?.retail_price, "eur"),
                        product_data: {
                            name: item.name,
                            images: [item?.files[1].thumbnail_url],
                            description: item.product.name,
                        },
                    },
                    quantity: item.quantity,
                })),
            ],
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/success`,
            cancel_url: process.env.NEXT_PUBLIC_SERVER_URL,
        };

        const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create(
            params
        );

        res.json(checkoutSession);
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
