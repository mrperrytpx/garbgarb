import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Libraries, useGoogleMapsScript } from "use-google-maps-script";
import { z } from "zod";
import { cartSelector } from "../../redux/slices/cartSlice";
import { AutocompletePrediction } from "react-places-autocomplete";
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
import { allowedCountries } from "../../utils/allowedCountries";

const libraries: Libraries = ["places"];

export type ValidatedForm = z.infer<typeof validationSchema>;

export type ValidatedAddress = Omit<ValidatedForm, "email">;

export const validationSchema = z.object({
  email: z.string().min(1, "Required").email(),
  city: z.string().min(1, { message: "Required" }),
  country: z.enum([...allowedCountries], {
    errorMap: () => ({
      message: `Invalid country 2-letter code`,
    }),
  }),
  province: z.string().min(1, { message: "Required" }),
  zip: z.string().min(1, { message: "Required" }),
  streetName: z.string().min(1, { message: "Required" }),
  streetNumber: z.string().min(1, { message: "Required" }),
  subpremise: z.string().optional(),
});

const CheckoutPage = () => {
  const session = useSession();
  const [checkoutStep, setCheckoutStep] = useState(4);

  const nextStep = () => {
    if (checkoutStep === 4) return;
    setCheckoutStep((prev) => prev + 1);
  };
  const prevStep = () => {
    if (checkoutStep === 1) return;
    setCheckoutStep((prev) => prev - 1);
  };

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
        <div className="w-full">
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
                  className="w-full flex-1 cursor-pointer
                   rounded-lg bg-slate-200 p-4 text-center font-semibold"
                >
                  Use an existing account
                </div>
                <p>Or</p>
                <div
                  onClick={nextStep}
                  className="w-full flex-1 cursor-pointer rounded-lg bg-slate-200 p-4 text-center font-semibold"
                >
                  Proceed as guest
                </div>
              </div>
            </>
          )}
          {checkoutStep === 2 && (
            <div className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-2">
              <SectionSeparator name="Shipping Address" number={checkoutStep} />
              <AddressForm
                setCheckoutStep={setCheckoutStep}
                suggestion={suggestion}
                setSuggestion={setSuggestion}
              />
            </div>
          )}
          {checkoutStep === 4 && (
            <div className="flex flex-col gap-2">
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
    <div className="mt-auto mb-2 flex w-full items-center justify-between">
      {checkoutStep > 1 && (
        <button
          disabled={checkoutStep === 1}
          className="w-28 rounded-lg border p-2 shadow-md hover:bg-slate-700 hover:text-white disabled:opacity-30"
          onClick={prevStep}
        >
          Back
        </button>
      )}
      {checkoutStep < 4 && (
        <button
          className="w-28 rounded-lg border p-2 shadow-md hover:bg-slate-700 hover:text-white disabled:opacity-30"
          onClick={nextStep}
          disabled={checkoutStep === 4}
        >
          Next
        </button>
      )}
    </div>
  );
};
