import { z } from "zod";
import { tryCatchSync } from "../utils/tryCatchWrappers";
import { ApiError } from "next/dist/server/api-utils";
import { printfulApiInstance, printfulApiKeyInstance } from "../utils/axiosClients";
import { TProductDetails, TProductVariant } from "../pages/api/product";
import { TBaseVariants, TWarehouse } from "../pages/api/product/availability";

const cartItemsSchema = z
    .array(
        z.object({
            store_product_id: z.number(),
            store_product_variant_id: z.number(),
            quantity: z.number({ description: "Quantity can't be 0" }).min(1),
        })
    )
    .min(1);
export type TCheckoutPayload = z.infer<typeof cartItemsSchema>;

export async function checkPayloadStock(
    items: TCheckoutPayload
): Promise<(TProductVariant & { quantity: number; in_stock: boolean })[]> {
    const [zodError, parsedCartItems] = tryCatchSync(cartItemsSchema.parse)(items);

    if (zodError || !parsedCartItems) {
        console.log(zodError);
        if (zodError instanceof z.ZodError) {
            throw new ApiError(400, zodError.message);
        } else {
            throw new ApiError(400, "Wrong payload shape");
        }
    }

    // ID VALIDATIONS SO ITEMS EXIST
    const uniqueStoreProductIDsInCart = [
        ...new Set(parsedCartItems.map((item) => item.store_product_id)),
    ];

    const printfulStoreItems = (
        await Promise.allSettled(
            uniqueStoreProductIDsInCart.map(async (id) => {
                const res = await printfulApiKeyInstance.get<TProductDetails>(
                    `store/products/${id}`
                );
                const data = res.data.result.sync_variants;
                return data;
            })
        )
    )
        .filter((x) => x.status === "fulfilled")
        .map((x) => (x as PromiseFulfilledResult<TProductVariant[]>).value)
        .flat();

    if (!printfulStoreItems) throw new ApiError(500, "The store is empty. Try again later");
    //-------------------//
    const cartItemsExistInStore = parsedCartItems
        .map((item) => {
            const storeItem = printfulStoreItems.filter(
                (x) => x.id === item.store_product_variant_id
            )[0];
            if (!storeItem) return null;
            return { ...storeItem, quantity: item.quantity };
        })
        .filter(Boolean) as (TProductVariant & { quantity: number })[];

    if (!cartItemsExistInStore) {
        throw new ApiError(404, "Items in your cart don't exist in the Store");
    }

    const uniqueProductIDsInCart = [
        ...new Set(cartItemsExistInStore.map((item) => item?.product.product_id)),
    ];

    const warehouseStock = (
        await Promise.allSettled(
            uniqueProductIDsInCart.map(async (item) => {
                const res = await printfulApiInstance.get<TWarehouse>(`products/${item}`);
                const data = res.data.result.variants;
                return data;
            })
        )
    )
        .filter((x) => x.status === "fulfilled")
        .map((x) => (x as PromiseFulfilledResult<TBaseVariants[]>).value)
        .flat();

    const cartItemsInStock = cartItemsExistInStore
        .map((item) => {
            const warehouseItem = warehouseStock.find((x) => x.id === item?.variant_id);
            return {
                ...item,
                in_stock: !!warehouseItem?.availability_status.find(
                    (reg) => reg.region.includes("EU") && reg.status === "in_stock"
                ),
            };
        })
        .filter((item) => item.in_stock);

    if (!cartItemsInStock) {
        throw new ApiError(404, "None of the items in Your cart are in stock");
    }

    return cartItemsInStock;
}
