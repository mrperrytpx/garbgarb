// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { TCartProduct } from "../../../redux/slices/cartSlice";
import { TAddress } from "../../checkout";
import { allowedCountries } from "../../../utils/allowedCountries";

const printfulStoreClient = axios.create({
    baseURL: "https://api.printful.com",
    headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
    timeout: 7000,
    signal: new AbortController().signal,
});

export type TShippingOption = {
    id: string;
    name: string;
    rate: string;
    currency: "EUR";
    minDeliveryDays: number;
    maxDeliveryDays: number;
    minDeliveryDate: string;
    maxDeliveryDate: string;
};

export type TPostgridVerifiedAddress = {
    status: string;
    message: string;
    data: Data;
};

export type Data = {
    city: string;
    country: string;
    details: Details;
    formattedAddress: string;
    geoData: GeoData;
    line1: string;
    line2: string;
    line3: string;
    postalOrZip: string;
    provinceOrState: string;
    summary: Summary;
};

export type Details = {
    building: string;
    premise: string;
};

export type GeoData = {
    latitude: string;
    longitude: string;
    geoAccuracy: string;
};

export type Summary = {
    verificationStatus: string;
    postProcessedVerificationMatchLevel: string;
    preProcessedVerificationMatchLevel: string;
    parsingStatus: string;
    lexiconIdentificationMatchLevel: string;
    contextIdentificationMatchLevel: string;
    postCodeStatus: string;
    matchScore: number;
};

export type TPostgridError = {
    status: string;
    message: string;
    data: TErrorData;
};

export type TErrorData = {
    error: string;
};

export type TShippingAndVAT = {
    costs: Costs;
    retail_costs: RetailCosts;
};

export type Costs = {
    currency: string;
    subtotal: number;
    discount: number;
    shipping: number;
    digitization: number;
    additional_fee: number;
    fulfillment_fee: number;
    retail_delivery_fee: number;
    tax: number;
    vat: number;
    total: number;
};

export type RetailCosts = {
    currency: string;
    subtotal: number;
    discount: number;
    shipping: number;
    tax: null;
    vat: null;
    total: number;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { cartItems, address }: { cartItems: TCartProduct[]; address: TAddress } = req.body;

        if (!allowedCountries.includes(address.country_code)) {
            return res.status(400).end("We don't ship to Your country, sorry!");
        }

        const postgridAddressFormat = {
            line1: address.address1,
            line2: address.address2,
            city: address.city,
            postalOrZip: address.zip.toString(),
            country: address.country_code,
        };

        const validateAddressResponse = await axios.post<TPostgridVerifiedAddress | TPostgridError>(
            "https://api.postgrid.com/v1/intl_addver/verifications?geoData=false&includeDetails=tru",
            {
                address: { ...postgridAddressFormat },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.POSTGRID_API_KEY,
                },
            }
        );

        if (!validateAddressResponse) return res.status(400).end("Provide a valid address");

        const validatedAddress = validateAddressResponse.data.data;

        if ("error" in validatedAddress) {
            return res.status(400).end(validatedAddress.error);
        }

        if (
            validatedAddress.summary.verificationStatus !== "verified" &&
            validatedAddress.summary.verificationStatus !== "partially_verified"
        ) {
            return res.status(400).end("Could not verify your address. Change it");
        }

        const shippingOptionsResponse = await printfulStoreClient.post(
            "/orders/estimate-costs",
            {
                recipient: {
                    address1: validatedAddress.line1,
                    address2: validatedAddress.line2,
                    city: validatedAddress.city,
                    zip: validatedAddress.postalOrZip,
                    country_code: validatedAddress.country,
                },
                items: cartItems.map((item) => ({
                    quantity: item.quantity,
                    sync_variant_id: item.store_product_variant_id,
                    retail_price: item.price,
                })),
                locale: "en-US",
            },
            {
                headers: {
                    "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID,
                },
            }
        );
        const shippingAndVATEstimates: TShippingAndVAT = shippingOptionsResponse.data.result;

        const calculatedVAT =
            Math.round(
                (shippingAndVATEstimates.costs.total /
                    (shippingAndVATEstimates.costs.subtotal +
                        shippingAndVATEstimates.costs.shipping)) *
                    100
            ) / 100;

        if (!shippingAndVATEstimates) return res.status(400).end("No shipping available");

        res.json({ shipping: shippingAndVATEstimates.retail_costs.shipping, vat: calculatedVAT });
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default handler;
