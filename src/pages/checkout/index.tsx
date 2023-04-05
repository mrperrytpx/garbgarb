import { useSelector } from "react-redux";
import { cartSelector } from "../../redux/slices/cartSlice";
import { useRouter } from "next/router";
import { Libraries } from "use-google-maps-script/dist/utils/createUrl";
import { useGoogleMapsScript } from "use-google-maps-script";
import { AddressForm } from "../../components/AddressForm";
import { SectionSeparator } from "../../components/SectionSeparator";
import { MinimalCartProduct } from "../../components/MinimalCartProduct";
import { OrderSummary } from "../../components/OrderSummary";
import { useState } from "react";
import { TShippingRatesResp } from "../api/printful/shipping_rates";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const libraries: Libraries = ["places"];

const validationSchema = z.object({
  city: z.string().min(1, { message: "City is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  province: z.string().min(1, { message: "State / Province is required" }),
  zip: z.string().min(1, { message: "Zip / Postal Code is required" }),
  streetName: z.string().min(1, { message: "Street Name is required" }),
  streetNumber: z.string().min(1, { message: "Street Number is required" }),
  subpremise: z.string().optional(),
});

export type ValidatedAddress = z.infer<typeof validationSchema>;

const CheckoutPage = () => {
  const productsInCart = useSelector(cartSelector);
  const router = useRouter();
  const [extraCosts, setExtraCosts] = useState<TShippingRatesResp | null>(null);

  const { isLoaded, loadError } = useGoogleMapsScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries,
  });
  const methods = useForm<ValidatedAddress>({
    resolver: zodResolver(validationSchema),
  });

  if (!productsInCart.length) {
    router.push("/products");
    return <div>Redirecting to shop</div>;
  }

  if (!isLoaded) return <div>Loading google...</div>;
  if (loadError) return <div>Something is wrong... try reloading the page</div>;

  return (
    <FormProvider {...methods}>
      <div className="mx-auto mb-6 flex w-full max-w-screen-lg flex-col items-start gap-2 lg:flex-row lg:gap-6">
        <main className="lg:max-w-3/4 mx-auto flex w-full max-w-screen-md flex-[3] flex-col gap-4">
          <SectionSeparator name="Cart overview" number="1" />
          <div className="flex w-full flex-col items-center gap-1 sm:p-2">
            {productsInCart.map((item) => (
              <MinimalCartProduct key={item.sku} item={item} />
            ))}
          </div>
          <SectionSeparator name="Shipping Address" number="2" />
          <AddressForm setExtraCosts={setExtraCosts} />
        </main>
        <OrderSummary extraCosts={extraCosts} />
      </div>
    </FormProvider>
  );
};

export default CheckoutPage;
