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
import { AddressForm } from "../../components/CustomerForm";
import { OrderSummary } from "../../components/OrderSummary";
import { allowedCountries } from "../../utils/allowedCountries";

const libraries: Libraries = ["places"];

export type ValidatedForm = z.infer<typeof validationSchema>;

export type ValidatedAddress = Omit<ValidatedForm, "email" | "name">;

export const validationSchema = z.object({
    name: z
        .string()
        .min(1, "Required")
        .regex(/\p{L}+ \p{L}+/u, "Has to contain both first and last name"),
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
            <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-2 text-gray-200">
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
            <div className="mx-auto mb-2 mt-4 flex w-full max-w-screen-md flex-col items-start gap-2 px-2 lg:gap-6">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex">
                        <SectionSeparator checkoutStep={checkoutStep} name="Login" number={1} />
                        <SectionSeparator checkoutStep={checkoutStep} name="Cart" number={2} />
                        <SectionSeparator checkoutStep={checkoutStep} name="Address" number={3} />
                        <SectionSeparator checkoutStep={checkoutStep} name="Review" number={4} />
                    </div>
                    {checkoutStep === 1 && (
                        <>
                            <div className="mt-8 flex flex-col items-center justify-between gap-6 p-2 text-gray-200">
                                <button
                                    onClick={() => signIn()}
                                    className="w-full flex-1 cursor-pointer rounded-lg border-2 border-slate-500 bg-black
                   p-4 text-center font-semibold hover:animate-hop hover:bg-slate-200 hover:text-black focus:border-white"
                                >
                                    Use an existing account
                                </button>
                                <p>Or</p>
                                <button
                                    onClick={nextStep}
                                    className="w-full flex-1 cursor-pointer rounded-lg border-2 border-slate-500 bg-black p-4 text-center font-semibold hover:animate-hop hover:bg-slate-200 hover:text-black focus:border-white"
                                >
                                    Proceed as guest
                                </button>
                            </div>
                        </>
                    )}
                    {checkoutStep === 2 && (
                        <div className="flex flex-col gap-4 p-2">
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
                            <div className="w-full p-2">
                                <StepButtons
                                    checkoutStep={checkoutStep}
                                    prevStep={prevStep}
                                    nextStep={nextStep}
                                />
                            </div>
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
        <div className="mb-2 mt-auto flex w-full items-center justify-between text-gray-200">
            {checkoutStep > 1 && (
                <button
                    disabled={checkoutStep === 2 && !!session.data?.user}
                    className="w-28 rounded-lg border border-slate-500 bg-black p-2 shadow-sm shadow-slate-500 enabled:hover:animate-hop enabled:hover:bg-slate-200 enabled:hover:text-black enabled:focus:bg-slate-200 enabled:focus:text-black disabled:opacity-30"
                    onClick={prevStep}
                >
                    Back
                </button>
            )}
            {checkoutStep < 4 && (
                <button
                    className="w-28 rounded-lg border border-slate-500 bg-black p-2 shadow-sm shadow-slate-500 hover:bg-slate-200 enabled:hover:animate-hop enabled:hover:text-black enabled:focus:bg-slate-200 enabled:focus:text-black disabled:opacity-30"
                    onClick={nextStep}
                    disabled={checkoutStep === 4 || !!productsInCart.some((x) => x.outOfStock)}
                >
                    Next
                </button>
            )}
        </div>
    );
};
