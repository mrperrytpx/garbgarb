import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Libraries, useGoogleMapsScript } from "use-google-maps-script";
import { z } from "zod";
import { cartSelector } from "../../redux/slices/cartSlice";
import { AutocompletePrediction } from "react-places-autocomplete";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { PageError } from "../../components/PageError";
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

export type ValidatedAddress = Omit<ValidatedForm, "email" | "name">;

export const validationSchema = z.object({
    name: z.string().min(1, "Required"),
    email: z.string().min(1, "Required").email(),
    city: z.string().min(1, { message: "Required" }),
    country: z.enum([...allowedCountries], {
        errorMap: (issue, ctx) => {
            if (issue.code === "invalid_enum_value")
                return { message: "We don't ship to that country" };
            return { message: ctx.defaultError };
        },
    }),
    zip: z.string().min(1, { message: "Required" }),
    streetName: z.string().min(1, { message: "Required" }),
    streetNumber: z.string().min(1, { message: "Required" }),
    subpremise: z.string().optional(),
});

const CheckoutPage = () => {
    const session = useSession();
    const [checkoutStep, setCheckoutStep] = useState(1);

    if (session.data?.user && checkoutStep === 1) {
        setCheckoutStep(2);
    }

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

    if (!isLoaded || session.status === "loading")
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
                <div className="flex w-full flex-col gap-4">
                    <div className="flex">
                        <SectionSeparator checkoutStep={checkoutStep} name="Login" number={1} />
                        <SectionSeparator checkoutStep={checkoutStep} name="Cart" number={2} />
                        <SectionSeparator checkoutStep={checkoutStep} name="Address" number={3} />
                        <SectionSeparator checkoutStep={checkoutStep} name="Summary" number={4} />
                    </div>
                    {checkoutStep === 1 && (
                        <>
                            <div className="mt-8 flex flex-col items-center justify-between gap-6">
                                <div
                                    onClick={() => signIn()}
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
                            <div className="flex w-full flex-col items-center gap-2">
                                {productsInCart.map((item) => (
                                    <MinimalCartProduct key={item.sku} item={item} />
                                ))}
                            </div>
                            <StepButtons
                                checkoutStep={checkoutStep}
                                prevStep={prevStep}
                                nextStep={nextStep}
                            />
                        </div>
                    )}
                    {checkoutStep === 3 && (
                        <div className="flex flex-col gap-2">
                            <AddressForm
                                setCheckoutStep={setCheckoutStep}
                                suggestion={suggestion}
                                setSuggestion={setSuggestion}
                            />
                        </div>
                    )}
                    {checkoutStep === 4 && (
                        <div className="flex flex-col gap-2">
                            <OrderSummary
                                setCheckoutStep={setCheckoutStep}
                                suggestion={suggestion}
                            />
                            <StepButtons
                                checkoutStep={checkoutStep}
                                prevStep={prevStep}
                                nextStep={nextStep}
                            />
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
    const session = useSession();
    const productsInCart = useSelector(cartSelector);

    return (
        <div className="mt-auto mb-2 flex w-full items-center justify-between">
            {checkoutStep > 1 && (
                <button
                    disabled={checkoutStep === 2 && !!session.data?.user}
                    className="w-28 rounded-lg border p-2 shadow-md enabled:hover:bg-slate-700 enabled:hover:text-white disabled:opacity-30"
                    onClick={prevStep}
                >
                    Back
                </button>
            )}
            {checkoutStep < 4 && (
                <button
                    className="enabled:hoverhover:bg-slate-700 enabled:hoverhover:text-white w-28 rounded-lg border p-2 shadow-md disabled:opacity-30"
                    onClick={nextStep}
                    disabled={checkoutStep === 4 || !!productsInCart.some((x) => x.outOfStock)}
                >
                    Next
                </button>
            )}
        </div>
    );
};
