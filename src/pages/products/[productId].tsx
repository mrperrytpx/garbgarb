import {
    GetServerSideProps,
    GetServerSidePropsContext,
    InferGetServerSidePropsType,
    PreviewData,
} from "next";
import Image from "next/image";
import { SizeDropdown } from "../../components/SizeDropdown";
import React, { useState } from "react";
import parse from "html-react-parser";
import SizesTable from "../../components/SizesTable";
import { Portal } from "../../components/Portal";
import { addToCart, cartSelector, TCartProduct } from "../../redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { currency } from "../../utils/currency";
import { Accordion } from "../../components/Accordion";
import { QueryClient } from "@tanstack/react-query";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { sortStuffByProductColor } from "../../utils/sortStuffByProductColor";
import { getProduct, useGetProduct } from "../../hooks/useGetProduct";
import {
    getProductAvailability,
    useGetProductAvailability,
} from "../../hooks/useGetProductAvailability";
import { useGetProductSizes } from "../../hooks/useGetProductSizes";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";
import { PageError } from "../../components/PageError";
import Head from "next/head";

const CheckedIcon = () => {
    return (
        <svg className="h-6 w-6" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="20" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        </svg>
    );
};

const ArticlePage = ({
    product,
    productColors,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const router = useRouter();
    const dispatch = useDispatch();

    const { productId, color: chosenColor } = router.query;

    const productQuery = useGetProduct(productId);
    const storeProductId = productQuery.data?.sync_variants[0].product.product_id;

    const availabilityQuery = useGetProductAvailability(storeProductId);
    const productsInCart = useSelector(cartSelector);

    const [color, setColor] = useState(() => {
        if (chosenColor) return chosenColor as string;
        return productColors[0];
    });
    const [option, setOption] = useState(product[color].filter((x) => x.inStock)[0]);
    const [quantity, setQuantity] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCentimeters, setIsCentimeters] = useState(true);

    const productDescription = availabilityQuery.data?.product.description
        .split("\n")
        .map((x) => `<p className="text-sm block w-full last-of-type:mb-2 font-normal">${x}</p>`)
        .slice(2)
        .join("")!;

    const splitName = productQuery.data?.sync_product.name.split(" ");
    const splitIndex = splitName?.indexOf("Unisex");
    const myShirtName = splitName?.slice(0, splitIndex).join(" ");
    const baseShirtName = splitName?.slice(splitIndex).join(" ");

    const handleQuantity = () => {
        if (!quantity) setQuantity(1);
        if (+quantity < 1 || +quantity > 99) setQuantity(1);
    };

    function handleAddToCart() {
        if (!productQuery.data) return;

        const inCart = productsInCart.find(
            (x) => x.sku === productQuery.data.sync_variants[option.index].sku
        );
        if (inCart && inCart.quantity + quantity > 99) {
            toast.warn("Can't add more than 99 of each variant");
            return;
        }

        const payload: TCartProduct = {
            name: productQuery.data.sync_product.name,
            quantity: quantity,
            color_code: option.color_code,
            color_name: option.color_name,
            sku: productQuery.data.sync_variants[option.index].sku,
            price: productQuery.data.sync_variants[option.index].retail_price,
            size: option.size,
            size_index: option.index,
            variant_image: productQuery.data.sync_variants[option.index].files[1].thumbnail_url,
            store_product_variant_id: productQuery.data.sync_variants[option.index].id,
            store_product_id: productQuery.data.sync_variants[option.index].sync_product_id,
            base_product_variant_id: productQuery.data.sync_variants[option.index].variant_id,
            base_product_id: productQuery.data.sync_variants[option.index].product.product_id,
            external_id: productQuery.data.sync_variants[option.index].external_id,
            outOfStock: false,
        };

        if (!payload) return;

        dispatch(addToCart(payload));
        toast.success("Added to cart!");
    }

    function handleColorChange(color: string): void {
        router.replace({ query: { ...router.query, color } }, undefined, { shallow: true });
        setColor(color);
        setOption(product[color].filter((x) => x.inStock)[0]);
        setQuantity(1);
    }

    const sizesQuery = useGetProductSizes(storeProductId, isModalOpen);

    const spanProp = isModalOpen ? { tabIndex: 0 } : {};

    if (productQuery.isLoading || availabilityQuery.isLoading)
        return (
            <>
                <Head>
                    <title>GarbGarb - {myShirtName}</title>
                </Head>
                <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-2 text-gray-200">
                    <p className="text-sm font-semibold">Loading product...</p>
                    <LoadingSpinner size={50} />
                </div>
            </>
        );

    if (productQuery.isError || availabilityQuery.isError)
        return (
            <>
                <Head>
                    <title>GarbGarb - {myShirtName}</title>
                </Head>
                <PageError />;
            </>
        );

    if (!productQuery.data || !availabilityQuery.data)
        return (
            <>
                <Head>
                    <title>GarbGarb - {myShirtName}</title>
                </Head>
                <PageError />;
            </>
        );

    return (
        <>
            <Head>
                <meta property="og:title" content={myShirtName} />
                <meta property="og:description" content={baseShirtName} />
                <meta
                    property="og:image"
                    content={productQuery.data.sync_variants[option.index].files[1].preview_url}
                />
                <meta
                    property="og:url"
                    content={process.env.NEXT_PUBLIC_SERVER_URL + router.asPath}
                />
                <meta name="twitter:card" content="summary_large_image"></meta>
                <title>GarbGarb - {myShirtName}</title>
            </Head>
            <div className="mx-auto mb-8 w-full max-w-screen-lg">
                <div className="p-4">
                    <Breadcrumbs />
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-6 px-4 py-2 md:flex-row lg:mt-4 lg:gap-12">
                    <div className="w-full max-w-[350px] rounded-md bg-slate-200 sm:max-w-[500px] md:sticky md:top-20 md:flex-1 md:self-start">
                        <Image
                            priority={true}
                            width={500}
                            height={500}
                            placeholder="blur"
                            blurDataURL="iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNkqGfAAIxDWRAAOIQFAap6xDkAAAAASUVORK5CYII"
                            alt="Piece of clothing with some words written on it"
                            src={productQuery.data.sync_variants[option.index].files[1].preview_url}
                            className="aspect-square rounded-lg"
                        />
                    </div>
                    {/*  */}
                    <article className="mb-10 flex w-full flex-col items-center justify-center gap-6 rounded-md bg-black p-4 text-gray-200 md:flex-1 lg:max-w-[450px]">
                        <div className="flex w-full flex-col items-start justify-center gap-4">
                            <div className="flex w-full flex-col gap-0.5">
                                <h1 className="text-left text-xl font-bold">{myShirtName}</h1>
                                <p className="text-left">{baseShirtName}</p>
                                <p
                                    style={{ backgroundColor: option.color_code }}
                                    className="block w-full rounded-lg border border-slate-500  pl-2"
                                >
                                    <span className="font-bold drop-shadow-[1px_1px_1.5px_rgb(0,0,0)]">
                                        {option.color_name}
                                    </span>
                                </p>
                            </div>
                            <div className="flex w-full items-center justify-between gap-2">
                                <p className="text-xl">
                                    {currency(
                                        +productQuery.data?.sync_variants[option?.index]
                                            .retail_price
                                    )}
                                </p>
                                <p className="text-xs">Tax / VAT not included</p>
                            </div>
                        </div>
                        {/*  */}
                        <div className="flex w-full flex-wrap gap-2">
                            {productColors.map((prodColor) => (
                                <div
                                    style={{
                                        backgroundColor: prodColor,
                                    }}
                                    className="group relative flex items-center justify-center gap-2 rounded-lg hover:animate-hop"
                                    key={prodColor}
                                >
                                    <button
                                        aria-label={`Color value ${prodColor}`}
                                        onClick={() => handleColorChange(prodColor)}
                                        style={{
                                            backgroundColor: prodColor,
                                        }}
                                        className="h-10 w-10 rounded-lg border-2 border-slate-500 hover:border-white"
                                    />
                                    {prodColor === color && (
                                        <div className="absolute">
                                            <CheckedIcon />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/*  */}
                        <div className="flex w-full flex-col items-start justify-center">
                            <p>Select Size:</p>
                            <SizeDropdown
                                getValue={(option) => option.id}
                                getLabel={(option) => option.size}
                                state={option}
                                setState={setOption}
                                options={product[color]}
                            />
                        </div>
                        {/*  */}
                        <div className="flex w-full flex-col gap-0.5">
                            <label
                                aria-label="Quantity"
                                htmlFor="qty"
                                className="px-1 text-sm font-semibold"
                            >
                                Qty:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="qty"
                                    name="qty"
                                    value={quantity}
                                    onChange={(e) => setQuantity(+e.target.value)}
                                    className="w-[100px] rounded-lg border border-slate-500 bg-black p-3 shadow-sm shadow-slate-500 hover:border-white"
                                    onBlur={handleQuantity}
                                    min="1"
                                    max="99"
                                    type="number"
                                />
                                <button
                                    onClick={handleAddToCart}
                                    className="w-full self-end rounded-lg border border-slate-500 p-3 shadow-sm shadow-slate-500 hover:animate-hop hover:bg-slate-200 hover:text-black focus:bg-slate-200 focus:text-black"
                                >
                                    Add to cart!
                                </button>
                            </div>
                        </div>
                        {/*  */}
                        <div className="flex flex-col">
                            <Accordion title="More Details">
                                <div className="flex w-full flex-col gap-2 px-2">
                                    {parse(productDescription)}
                                </div>
                            </Accordion>
                            <Accordion title="Size Guide">
                                <div className="mb-4 mt-2 flex flex-col gap-2 px-2">
                                    <div
                                        onClick={() => setIsModalOpen(!isModalOpen)}
                                        className="w-max cursor-pointer self-center border border-slate-400 p-2 hover:border-white hover:bg-slate-200 hover:text-black  focus:bg-slate-200 focus:text-black"
                                    >
                                        <span
                                            className="h-full cursor-pointer text-sm font-bold"
                                            {...spanProp}
                                        >
                                            Click to {isModalOpen ? "close" : "open"} the sizes
                                            guide
                                        </span>
                                    </div>
                                </div>
                            </Accordion>
                            <Accordion title="Quality Guarantee & Returns">
                                <div className="flex flex-col gap-2 px-2">
                                    <p className="list-item text-sm font-normal">
                                        Quality is guaranteed. If there is a print error or visible
                                        quality issue, we'll replace or refund it.
                                    </p>
                                    <p className="list-item text-sm font-normal last-of-type:mb-4">
                                        Because the products are made to order, we do not accept
                                        general returns or sizing-related returns.
                                    </p>
                                </div>
                            </Accordion>
                        </div>
                    </article>
                </div>
                {/*  */}
                {isModalOpen && (
                    <Portal>
                        <div className="relative flex max-h-full max-w-screen-md flex-col items-center gap-4 overflow-y-auto rounded-md border-2 border-slate-500 bg-black p-4 text-slate-100 hover:border-slate-200">
                            {!sizesQuery.data ? (
                                <LoadingSpinner size={50} />
                            ) : (
                                <>
                                    <button
                                        aria-label="Close size guide"
                                        onClick={() => setIsModalOpen(!isModalOpen)}
                                        className="absolute right-0 top-0 mr-4 mt-2 rounded-lg bg-black p-1 shadow-sm shadow-slate-500 hover:bg-red-600"
                                    >
                                        <RxCross1 size="20" />
                                    </button>
                                    <h1 className="w-full border-b-2 border-slate-500 font-bold">
                                        Measure yourself
                                    </h1>
                                    <div className="flex w-full flex-col items-start justify-center gap-2 text-sm">
                                        {parse(
                                            sizesQuery.data.size_tables[0].description.replace(
                                                /(\r\n|\n|\r)/gm,
                                                ""
                                            )
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start justify-center gap-2 sm:flex-row">
                                        <div className="w-[150px] self-center sm:self-start">
                                            <Image
                                                width={150}
                                                height={150}
                                                alt="Visual guide for measuring yourself"
                                                src={sizesQuery.data?.size_tables[0].image_url}
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col items-start justify-center gap-2 text-sm">
                                            {parse(
                                                sizesQuery.data.size_tables[0].image_description.replace(
                                                    /(\r\n|\n|\r)/gm,
                                                    ""
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 self-start">
                                        <span
                                            tabIndex={1}
                                            onClick={() => setIsCentimeters(true)}
                                            className={`font-semibol cursor-pointer p-2 hover:border-b-4 hover:border-slate-500 hover:bg-slate-200 hover:text-black ${
                                                isCentimeters && "border-b-4 border-slate-500"
                                            }`}
                                        >
                                            Centimeters
                                        </span>
                                        <span
                                            tabIndex={1}
                                            onClick={() => setIsCentimeters(false)}
                                            className={`cursor-pointer p-2 font-semibold hover:border-b-4  hover:border-slate-500 hover:bg-slate-200 hover:text-black ${
                                                !isCentimeters && "border-b-4 border-slate-500"
                                            }`}
                                        >
                                            Inches
                                        </span>
                                    </div>
                                    <SizesTable
                                        isCentimeters={isCentimeters}
                                        sizes={sizesQuery.data}
                                    />
                                </>
                            )}
                        </div>
                    </Portal>
                )}
            </div>
        </>
    );
};

export default ArticlePage;

export type TWarehouseProduct = {
    id: number;
    size: string;
    inStock: boolean;
    index: number;
    color_name: string;
    color_code: string;
};

export const getServerSideProps: GetServerSideProps<{
    product: {
        [key: string]: TWarehouseProduct[];
    };
    productColors: string[];
}> = async (context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>) => {
    const { productId } = context.query;
    const queryClient = new QueryClient();

    const storeData = await queryClient.fetchQuery({
        queryKey: ["product", productId],
        queryFn: () => getProduct(productId),
    });
    const storeProductId = storeData.sync_variants[0].product.product_id;

    const productAvailability = await queryClient.fetchQuery({
        queryKey: ["availability", storeProductId],
        queryFn: () => getProductAvailability(storeProductId),
    });

    const { product, productColors } = sortStuffByProductColor(storeData, productAvailability);

    return {
        props: {
            product,
            productColors,
        },
    };
};
