import usePlacesAutocomplete from "use-places-autocomplete";
import { useFormContext } from "react-hook-form";
import { useGetSuggestionsQuery } from "../hooks/useGetSuggestionsQuery";
import { AutocompletePrediction } from "react-places-autocomplete";
import { LoadingSpinner } from "./LoadingSpinner";
import { useEffect, useRef } from "react";
import { ValidatedForm } from "../pages/checkout";
import { useSession } from "next-auth/react";
import Link from "next/link";

export type TAddress = {
    address1: string;
    address2?: string;
    zip: string | number;
    city: string;
    country_code: string;
};

export type TGoogleAddressDetails = {
    long_name: string;
    short_name: string;
    types: Array<string>;
};

interface IAddressFormProps {
    suggestion: AutocompletePrediction | null;
    setSuggestion: React.Dispatch<React.SetStateAction<AutocompletePrediction | null>>;
    setCheckoutStep: React.Dispatch<React.SetStateAction<number>>;
}

export const AddressForm = ({ suggestion, setSuggestion, setCheckoutStep }: IAddressFormProps) => {
    const {
        ready,
        setValue,
        clearSuggestions,
        suggestions: { status, data },
    } = usePlacesAutocomplete({
        debounce: 500,
        requestOptions: {
            types: ["address"],
        },
    });

    const session = useSession();

    const {
        register,
        formState: { errors },
        setValue: setFormValue,
        handleSubmit,
        clearErrors,
    } = useFormContext<ValidatedForm>();

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const ref = useRef<HTMLUListElement>(null);
    const addressData = useGetSuggestionsQuery(suggestion);

    // useEffect(() => {
    //   function handleClickOutside(event: Event) {
    //     if (ref.current && !ref.current.contains(event.target as Node)) {
    //       clearSuggestions();
    //     }
    //   }
    //   const eventTypes = ["mousedown", "touchstart"];
    //   eventTypes.forEach((type) => {
    //     document.addEventListener(type as keyof DocumentEventMap, handleClickOutside);
    //     return () => {
    //       document.removeEventListener(type as keyof DocumentEventMap, handleClickOutside);
    //     };
    //   });
    // }, [ref]);

    useEffect(() => {
        if (session.data?.user?.email) {
            setFormValue("email", session.data?.user?.email, { shouldValidate: true });
        }
    }, [session]);

    useEffect(() => {
        if (addressData.data) {
            setFormValue("streetName", addressData.data.streetName || "");
            setFormValue("streetNumber", addressData.data.streetNumber || "");
            setFormValue("city", addressData.data.city || "");
            setFormValue("country", addressData.data.country || "");
            setFormValue("zip", addressData.data.zip || "");
            setFormValue("subpremise", addressData.data?.subpremise);
        }
    }, [addressData.data]);

    const onSubmit = handleSubmit(() => {
        setCheckoutStep((prev) => prev + 1);
    });

    return (
        <form
            onSubmit={onSubmit}
            className="relative flex min-h-[300px] flex-col items-start justify-start gap-4 p-2"
        >
            <fieldset className="flex w-full flex-col items-center">
                <div className="flex w-full flex-col gap-2">
                    <div>
                        <label className="block p-1 text-sm" htmlFor="email">
                            <strong className="uppercase">Email</strong>
                        </label>
                        <input
                            {...register("email")}
                            name="email"
                            id="email"
                            type="email"
                            className="h-10 w-full border p-2 text-sm"
                            placeholder="Email address"
                            autoComplete="off"
                            disabled={!ready}
                        />
                        {errors.email && (
                            <span className="mb-1 pl-1 text-sm font-semibold">
                                {errors.email.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="relative flex w-full flex-1 flex-col self-start sm:w-auto">
                            <label className="block p-1 text-sm" htmlFor="streetName">
                                <strong className="uppercase">Street name</strong>
                            </label>
                            <input
                                {...register("streetName")}
                                name="streetName"
                                id="streetName"
                                onChange={handleInput}
                                className="h-10 w-full border p-2 text-sm"
                                type="text"
                                placeholder="Street Name"
                                autoComplete="off"
                                disabled={!ready}
                            />
                            {errors.streetName && (
                                <span className="mb-1 pl-1 text-sm font-semibold">
                                    {errors.streetName.message}
                                </span>
                            )}
                            {addressData.isLoading && addressData.fetchStatus !== "idle" ? (
                                <div className="absolute top-[68px] left-0 z-20 w-full gap-0.5 bg-white px-2">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                status === "OK" && (
                                    <ul
                                        ref={ref}
                                        className="absolute top-[68px] left-0 flex w-full flex-col rounded-md bg-white shadow-lg outline outline-1"
                                    >
                                        {data.map((suggestion, i) => (
                                            <li
                                                className="cursor-pointer border-b-2 p-2 last-of-type:border-0 hover:bg-slate-700 hover:text-white"
                                                key={i}
                                                onClick={() => {
                                                    clearSuggestions();
                                                    clearErrors();
                                                    setSuggestion(suggestion);
                                                }}
                                            >
                                                <strong className="uppercase">
                                                    {suggestion.description}
                                                </strong>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            )}
                        </div>
                        <div className="flex w-full flex-1 gap-2">
                            <div className="flex w-full flex-col self-start sm:w-auto">
                                <label className="block p-1 text-sm" htmlFor="streetNumber">
                                    <strong className="uppercase">St. Number</strong>
                                </label>
                                <input
                                    {...register("streetNumber")}
                                    name="streetNumber"
                                    id="streetNumber"
                                    className="h-10 w-full border p-2 text-sm"
                                    type="text"
                                    placeholder="Street Number"
                                    autoComplete="off"
                                    disabled={!ready}
                                />
                                {errors.streetNumber && (
                                    <span className="mb-1 pl-1 text-sm font-semibold">
                                        {errors.streetNumber.message}
                                    </span>
                                )}
                            </div>
                            <div className="flex w-full flex-col self-start sm:w-auto">
                                <label className="block p-1 text-sm" htmlFor="subpremise">
                                    <strong className="uppercase">Subpremise</strong>
                                </label>
                                <input
                                    {...register("subpremise")}
                                    name="subpremise"
                                    id="subpremise"
                                    className="h-110 w-full border p-2 text-sm"
                                    type="text"
                                    placeholder="Apartment, Suite, etc."
                                    autoComplete="off"
                                    onChange={handleInput}
                                    disabled={!ready}
                                />
                                {errors.subpremise && (
                                    <span className="mb-1 pl-1 text-sm font-semibold">
                                        {errors.subpremise.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-4">
                        <div className="flex gap-2">
                            <div className="w-full">
                                <label className="block p-1 text-sm" htmlFor="city">
                                    <strong className="uppercase">City</strong>
                                </label>
                                <input
                                    {...register("city")}
                                    name="city"
                                    id="city"
                                    className="h-10 w-full border  p-2 text-sm"
                                    type="text"
                                    placeholder="City"
                                    autoComplete="off"
                                    disabled={!ready}
                                />
                                {errors.city && (
                                    <span className="mb-1 pl-1 text-sm font-semibold" role="error">
                                        {errors.city.message}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <div className="w-full">
                                    <label className="block p-1 text-sm" htmlFor="country">
                                        <strong className="uppercase">Country code</strong>
                                    </label>
                                    <input
                                        {...register("country")}
                                        name="country"
                                        id="country"
                                        className="h-10 w-full border  p-2 text-sm"
                                        type="text"
                                        placeholder="Country"
                                        autoComplete="off"
                                        disabled={!ready}
                                    />
                                </div>

                                <div className="w-full">
                                    <label className="block p-1 text-sm" htmlFor="zip">
                                        <strong className="uppercase">Zip</strong>
                                    </label>
                                    <input
                                        {...register("zip")}
                                        name="zip"
                                        id="zip"
                                        className="h-10 w-full border p-2 text-sm"
                                        type="text"
                                        placeholder="Zip"
                                        autoComplete="off"
                                        disabled={!ready}
                                    />
                                    {errors.zip && (
                                        <span className="mb-1 pl-1 text-sm font-semibold">
                                            {errors.zip.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                {errors.country && (
                                    <>
                                        <p className="mb-1 pl-1 text-sm font-semibold">
                                            {errors.country.message}
                                        </p>
                                        <Link
                                            className="pl-1 text-sm uppercase underline"
                                            href="/returns-faq"
                                        >
                                            Check available countries
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </fieldset>
            <div className="mt-auto mb-2 flex w-full items-center justify-between">
                <button
                    type="button"
                    onClick={() => setCheckoutStep((prev) => prev - 1)}
                    className="w-28 rounded-lg border p-2 shadow-md hover:bg-slate-700 hover:text-white disabled:opacity-30"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="w-28 rounded-lg border p-2 shadow-md hover:bg-slate-700 hover:text-white disabled:opacity-30"
                >
                    Next
                </button>
            </div>
        </form>
    );
};
