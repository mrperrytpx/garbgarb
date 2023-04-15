import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Libraries, useGoogleMapsScript } from "use-google-maps-script";
import { z } from "zod";
import { cartSelector } from "../../redux/slices/cartSlice";
import { AutocompletePrediction } from "react-places-autocomplete";
import { ValidatedAddress } from "./old";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { PageError } from "../../utils/PageError";
import { useRouter } from "next/dist/client/router";
import { FormProvider, useForm } from "react-hook-form";
import { SectionSeparator } from "../../components/SectionSeparator";
import { MinimalCartProduct } from "../../components/MinimalCartProduct";
import { useSession, signIn } from "next-auth/react";
import { AddressForm } from "../../components/AddressForm";
import { OrderSummary } from "../../components/OrderSummary";

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

const CheckoutPage = () => {
  const session = useSession();
  const [checkoutStep, setCheckoutStep] = useState(1);

  const nextStep = () => setCheckoutStep((prev) => prev + 1);
  const prevStep = () => setCheckoutStep((prev) => prev - 1);

  //   useEffect(() => {
  //     if (session.data?.user) setCheckoutStep(2);
  //   }, [session]);

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
      <div className="mx-auto mb-2 flex w-full max-w-screen-md flex-col items-start gap-2 px-2 lg:gap-6">
        <div className="w-full flex-1">
          {checkoutStep === 1 && (
            <>
              <SectionSeparator name="Login" number={checkoutStep} />
              <div className="mt-8 flex flex-col items-center justify-between gap-6">
                <div
                  onClick={() => {
                    if (session.data?.user) {
                      nextStep();
                    } else {
                      signIn();
                    }
                  }}
                  className="flex w-full flex-1 cursor-pointer flex-col rounded-lg bg-slate-200 p-4 text-center font-semibold"
                >
                  Use an existing account
                </div>
                <p>Or</p>
                <div
                  onClick={nextStep}
                  className="w-full flex-1 rounded-lg bg-slate-200 p-4 text-center font-semibold"
                >
                  Proceed as guest
                </div>
              </div>
            </>
          )}
          {checkoutStep === 2 && (
            <div className="flex h-full flex-col gap-4">
              <SectionSeparator name="Cart overview" number={checkoutStep} />
              <div className="flex w-full flex-col items-center gap-1 sm:p-2">
                {productsInCart.map((item) => (
                  <MinimalCartProduct key={item.sku} item={item} />
                ))}
              </div>
              <StepButtons checkoutStep={checkoutStep} prevStep={prevStep} nextStep={nextStep} />
            </div>
          )}
          {checkoutStep === 3 && (
            <div className="flex h-full flex-col gap-2">
              <SectionSeparator name="Shipping Address" number={checkoutStep} />
              <AddressForm suggestion={suggestion} setSuggestion={setSuggestion} />
              <StepButtons checkoutStep={checkoutStep} prevStep={prevStep} nextStep={nextStep} />
            </div>
          )}
          {checkoutStep === 4 && (
            <div className="flex h-full flex-col gap-2">
              <SectionSeparator name="Summary" number={checkoutStep} />

              <OrderSummary suggestion={suggestion} />
              <StepButtons checkoutStep={checkoutStep} prevStep={prevStep} nextStep={nextStep} />
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default CheckoutPage;

interface IStepButtonsProps {
  prevStep: () => void;
  nextStep: () => void;
  checkoutStep: number;
}

const StepButtons = ({ checkoutStep, prevStep, nextStep }: IStepButtonsProps) => {
  return (
    <div className="mt-auto mb-2 flex w-full items-center justify-between px-2">
      <button
        disabled={checkoutStep === 1}
        className="w-28 rounded-lg border p-2 shadow-md hover:bg-slate-700 hover:text-white disabled:opacity-30"
        onClick={prevStep}
      >
        Back
      </button>
      <button
        className="w-28 rounded-lg border p-2 shadow-md hover:bg-slate-700 hover:text-white disabled:opacity-30"
        onClick={nextStep}
        disabled={checkoutStep === 4}
      >
        Next
      </button>
    </div>
  );
};
