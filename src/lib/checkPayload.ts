import { z } from "zod";
import { tryCatchSync } from "../utils/tryCatchWrappers";
import { ApiError } from "next/dist/server/api-utils";
import { printfulApiInstance, printfulApiKeyInstance } from "../utils/axiosClients";
import { TProductDetails, TProductVariant } from "../pages/api/product";
import { TBaseVariants, TWarehouseSingleVariant } from "../pages/api/product/availability";

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
        if (zodError instanceof z.ZodError) {
            throw new ApiError(400, zodError.message);
        } else {
            throw new ApiError(400, "Wrong payload shape");
        }
    }

    // ID VALIDATIONS SO ITEMS EXIST
    const uniqueProductIDsInCart = [
        ...new Set(parsedCartItems.map((item) => item.store_product_id)),
    ];

    const printfulStoreItems = (
        await Promise.allSettled(
            uniqueProductIDsInCart.map(async (id) => {
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

    const uniqueVariantIDsInCart = [
        ...new Set(cartItemsExistInStore.map((item) => item?.variant_id)),
    ];

    const warehouseStock = (
        await Promise.allSettled(
            uniqueVariantIDsInCart.map(async (item) => {
                const res = await printfulApiInstance.get<TWarehouseSingleVariant>(
                    `products/variant/${item}`
                );
                const data = res.data.result.variant;
                return data;
            })
        )
    )
        .filter((x) => x.status === "fulfilled")
        .map((x) => (x as PromiseFulfilledResult<TBaseVariants>).value);

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

    if (!cartItemsInStock) {
        throw new ApiError(400, "None of the items in Your cart are in stock");
    }

    return cartItemsInStock;
}
