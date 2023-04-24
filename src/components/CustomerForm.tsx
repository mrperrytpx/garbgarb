import usePlacesAutocomplete from "use-places-autocomplete";
import { useFormContext } from "react-hook-form";
import { useGetSuggestionsQuery } from "../hooks/useGetSuggestionsQuery";
import { AutocompletePrediction } from "react-places-autocomplete";
import { LoadingSpinner } from "./LoadingSpinner";
import { KeyboardEvent, MouseEvent, useEffect, useRef } from "react";
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

    const addressData = useGetSuggestionsQuery(suggestion);

    const handleChoice = (suggestion: AutocompletePrediction) => {
        clearSuggestions();
        clearErrors();
        setSuggestion(suggestion);
    };

    const handleKeyboardChoice = (
        e: KeyboardEvent<HTMLLIElement>,
        suggestion: AutocompletePrediction
    ) => {
        if (e.code === "Space" || e.code === "Enter") {
            clearSuggestions();
            clearErrors();
            setSuggestion(suggestion);
        }
    };

    useEffect(() => {
        if (session.data?.user?.email) {
            setFormValue("email", session.data?.user?.email, { shouldValidate: true });
        }
        if (session.data?.user.name) {
            setFormValue("name", session.data?.user?.name, { shouldValidate: true });
        }
    }, [session, setFormValue]);

    useEffect(() => {
        if (addressData.data) {
            setFormValue("streetName", addressData.data.streetName || "");
            setFormValue("streetNumber", addressData.data.streetNumber || "");
            setFormValue("city", addressData.data.city || "");
            setFormValue("country", addressData.data.country || "");
            setFormValue("zip", addressData.data.zip || "");
            setFormValue("subpremise", addressData.data?.subpremise);
        }
    }, [addressData.data, setFormValue]);

    const onSubmit = handleSubmit(() => {
        setCheckoutStep((prev) => prev + 1);
    });

    return (
        <form
            onSubmit={onSubmit}
            className="relative flex flex-col items-start justify-start gap-4 rounded-lg bg-black p-2 text-white"
        >
            <fieldset className="flex w-full flex-col items-center">
                <div className="flex w-full flex-col gap-2">
                    <div>
                        <label className="block p-1 text-xs" htmlFor="name">
                            <strong className="uppercase">Full Name</strong>
                        </label>
                        <input
                            style={{
                                borderColor: errors.name ? "rgb(220 38 38)" : "rgb(107 114 128)",
                            }}
                            {...register("name")}
                            name="name"
                            id="name"
                            type="text"
                            className="h-10 w-full rounded-md border border-gray-500 bg-black p-2 text-sm"
                            placeholder="Full Name"
                            autoComplete="off"
                            disabled={!ready}
                        />
                        {errors.name && (
                            <span className="pl-1 text-xs font-semibold text-red-500">
                                {errors.name.message}
                            </span>
                        )}
                    </div>
                    <div>
                        <label className="block p-1 text-xs" htmlFor="email">
                            <strong className="uppercase">Email</strong>
                        </label>
                        <input
                            style={{
                                borderColor: errors.email ? "rgb(220 38 38)" : "rgb(107 114 128)",
                            }}
                            {...register("email")}
                            name="email"
                            id="email"
                            type="email"
                            className="h-10 w-full rounded-md border border-gray-500 bg-black p-2 text-sm"
                            placeholder="Email address"
                            autoComplete="off"
                            disabled={!ready}
                        />
                        {errors.email && (
                            <span className="pl-1 text-xs font-semibold text-red-500">
                                {errors.email.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                        <div className="relative flex w-full flex-1 flex-col  gap-1 self-start sm:w-auto">
                            <label className="block p-1 text-xs" htmlFor="streetName">
                                <strong className="uppercase">Street name</strong>
                            </label>
                            <input
                                style={{
                                    borderColor: errors.streetName
                                        ? "rgb(220 38 38)"
                                        : "rgb(107 114 128)",
                                }}
                                {...register("streetName")}
                                name="streetName"
                                id="streetName"
                                onChange={handleInput}
                                className="h-10 w-full rounded-md border border-gray-500 bg-black p-2 text-sm"
                                type="text"
                                placeholder="Street Name"
                                autoComplete="off"
                                disabled={!ready}
                            />
                            {errors.streetName && (
                                <span className="pl-1 text-xs font-semibold text-red-500">
                                    {errors.streetName.message}
                                </span>
                            )}
                            {addressData.isLoading && addressData.fetchStatus !== "idle" ? (
                                <div className="absolute left-0 top-[68px] z-20 w-full gap-0.5 bg-black px-2">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                status === "OK" && (
                                    <ul className="absolute left-0 top-[68px] flex w-full flex-col rounded-md bg-black shadow-lg outline outline-1">
                                        {data.map((suggestion, i) => (
                                            <li
                                                tabIndex={0}
                                                onKeyDown={(e) =>
                                                    handleKeyboardChoice(e, suggestion)
                                                }
                                                className="cursor-pointer border-b-2 p-2 last-of-type:border-0 hover:bg-slate-200 hover:text-black focus:bg-slate-200 focus:text-black"
                                                key={i}
                                                onClick={(e) => handleChoice(suggestion)}
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
                            <div className="flex w-full flex-col gap-1 self-start sm:w-auto">
                                <label className="block p-1 text-xs" htmlFor="streetNumber">
                                    <strong className="uppercase">St. Number</strong>
                                </label>
                                <input
                                    style={{
                                        borderColor: errors.streetNumber
                                            ? "rgb(220 38 38)"
                                            : "rgb(107 114 128)",
                                    }}
                                    {...register("streetNumber")}
                                    name="streetNumber"
                                    id="streetNumber"
                                    className="h-10 w-full rounded-md border border-gray-500 bg-black p-2 text-sm"
                                    type="text"
                                    placeholder="Street Number"
                                    autoComplete="off"
                                    disabled={!ready}
                                />
                                {errors.streetNumber && (
                                    <span className="pl-1 text-xs font-semibold text-red-500">
                                        {errors.streetNumber.message}
                                    </span>
                                )}
                            </div>
                            <div className="flex w-full flex-col gap-1  self-start sm:w-auto">
                                <label className="block p-1 text-xs" htmlFor="subpremise">
                                    <strong className="uppercase">Subpremise</strong>
                                </label>
                                <input
                                    style={{
                                        borderColor: errors.subpremise
                                            ? "rgb(220 38 38)"
                                            : "rgb(107 114 128)",
                                    }}
                                    {...register("subpremise")}
                                    name="subpremise"
                                    id="subpremise"
                                    className="h-10 w-full rounded-md border border-gray-500 bg-black p-2 text-sm"
                                    type="text"
                                    placeholder="Apartment, Suite, etc."
                                    autoComplete="off"
                                    onChange={handleInput}
                                    disabled={!ready}
                                />
                                {errors.subpremise && (
                                    <span className="pl-1 text-xs font-semibold text-red-500">
                                        {errors.subpremise.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex w-full flex-col gap-1">
                            <label className="block p-1 text-xs" htmlFor="city">
                                <strong className="uppercase">City</strong>
                            </label>
                            <input
                                style={{
                                    borderColor: errors.city
                                        ? "rgb(220 38 38)"
                                        : "rgb(107 114 128)",
                                }}
                                {...register("city")}
                                name="city"
                                id="city"
                                className="h-10 w-full rounded-md border border-gray-500 bg-black  p-2 text-sm"
                                type="text"
                                placeholder="City"
                                autoComplete="off"
                                disabled={!ready}
                            />
                            {errors.city && (
                                <span
                                    className="pl-1 text-xs font-semibold text-red-500"
                                    role="error"
                                >
                                    {errors.city.message}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <div className="w-full">
                                    <label className="block p-1 text-xs" htmlFor="country">
                                        <strong className="uppercase">Country code</strong>
                                    </label>
                                    <input
                                        style={{
                                            borderColor: errors.country
                                                ? "rgb(220 38 38)"
                                                : "rgb(107 114 128)",
                                        }}
                                        {...register("country")}
                                        name="country"
                                        id="country"
                                        className="h-10 w-full rounded-md border border-gray-500 bg-black  p-2 text-sm"
                                        type="text"
                                        placeholder="Country"
                                        autoComplete="off"
                                        disabled={!ready}
                                    />
                                </div>

                                <div className="w-full">
                                    <label className="block p-1 text-xs" htmlFor="zip">
                                        <strong className="uppercase">Zip</strong>
                                    </label>
                                    <input
                                        style={{
                                            borderColor: errors.zip
                                                ? "rgb(220 38 38)"
                                                : "rgb(107 114 128)",
                                        }}
                                        {...register("zip")}
                                        name="zip"
                                        id="zip"
                                        className="h-10 w-full rounded-md border border-gray-500 bg-black p-2 text-sm"
                                        type="text"
                                        placeholder="Zip"
                                        autoComplete="off"
                                        disabled={!ready}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                {errors.country && (
                                    <div className="w-full">
                                        <p className="pl-1 text-sm font-semibold text-red-500">
                                            {errors.country.message}
                                        </p>
                                        <Link
                                            className="pl-1 text-sm font-semibold uppercase text-white underline hover:animate-hop focus:animate-hop"
                                            href="/static/returns-faq"
                                        >
                                            Check available countries
                                        </Link>
                                    </div>
                                )}
                                {errors.zip && (
                                    <span className="w-full self-start pl-1 text-xs font-semibold text-red-500">
                                        {errors.zip.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </fieldset>
            <div className="mb-2 mt-auto flex w-full items-center justify-between">
                <button
                    type="button"
                    onClick={() => setCheckoutStep((prev) => prev - 1)}
                    className="w-28 rounded-lg border border-gray-500 p-2 shadow-sm shadow-gray-500 hover:animate-hop hover:bg-slate-200 hover:text-black focus:bg-slate-200 focus:text-black disabled:opacity-30"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="w-28 rounded-lg border border-gray-500 p-2 shadow-sm shadow-gray-500 hover:animate-hop hover:bg-slate-200 hover:text-black focus:bg-slate-200 focus:text-black disabled:opacity-30"
                >
                    Next
                </button>
            </div>
        </form>
    );
};
