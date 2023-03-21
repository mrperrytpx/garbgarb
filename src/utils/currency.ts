export const currency = (price: string | number, currency = "Eur"): string => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(+price);
};
