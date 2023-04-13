import { TProductDetailsResult } from "../pages/api/product";
import { TWarehouseResult } from "../pages/api/product/availability";
import { TWarehouseProduct } from "../pages/products/[productId]";

export function sortStuffByProductColor(
    storeData: TProductDetailsResult | undefined,
    availabilityData: TWarehouseResult | undefined
) {
    const variantIds = storeData?.sync_variants.reduce((acc: number[], variant) => {
        acc.push(variant.variant_id);
        return acc;
    }, []);

    const product: { [key: string]: Array<TWarehouseProduct> } = {};

    variantIds?.forEach((id, i) => {
        const variant = availabilityData?.variants.find((x) => x.id === id);
        if (!variant) return;

        const variantInfo = {
            index: i,
            id: variant?.id,
            size: variant?.size,
            inStock: !!variant?.availability_status.filter(
                (x) => x.region.includes("EU") && x.status === "in_stock"
            )[0],
            color_name: variant?.color,
            color_code: variant?.color_code,
        };

        product[variant.color_code] = product[variant.color_code]
            ? [...product[variant.color_code], variantInfo]
            : [variantInfo];
    });

    const productColors = Object.keys(product);

    return { product, productColors };
}
