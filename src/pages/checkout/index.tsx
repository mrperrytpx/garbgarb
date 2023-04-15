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
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { AutocompletePrediction } from "react-places-autocomplete";
import { PageError } from "../../utils/PageError";

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
  const [suggestion, setSuggestion] = useState<AutocompletePrediction | null>(null);

  const { isLoaded, loadError } = useGoogleMapsScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries,
  });
  const methods = useForm<ValidatedAddress>({
    resolver: zodResolver(validationSchema),
  });

  if (!isLoaded)
    return (
      <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-2">
        <p className="text-sm">Creating Your Session...</p>
        <LoadingSpinner size={50} />
      </div>
    );

  if (!productsInCart.length) {
    router.push("/products");
  }

  if (loadError) return <PageError error={loadError} />;

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
          <AddressForm suggestion={suggestion} setSuggestion={setSuggestion} />
        </main>
        <OrderSummary suggestion={suggestion} />
      </div>
    </FormProvider>
  );
};

CheckoutPage.auth = true;

export default CheckoutPage;
