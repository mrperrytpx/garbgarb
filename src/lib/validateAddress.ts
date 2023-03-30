import { TAddress } from "../pages/checkout";
import { postgridApiKeyInstance } from "../utils/axiosClients";

export type TPostgridError = {
    status: string;
    message: string;
    data: TErrorData;
};

export type TErrorData = {
    error: string;
};

export type TPostgridValidationResult = {
    status: string;
    message: string;
    data: TPostgridValidatedAddress;
};

export type TPostgridValidatedAddress = {
    city: string;
    country: string;
    details: Details;
    formattedAddress: string;
    geoData: GeoData;
    line1: string;
    line2: string;
    line3: string;
    postalOrZip: string;
    provinceOrState: string;
    summary: Summary;
};

export type Details = {
    building: string;
    premise: string;
};

export type GeoData = {
    latitude: string;
    longitude: string;
    geoAccuracy: string;
};

export type Summary = {
    verificationStatus: string;
    postProcessedVerificationMatchLevel: string;
    preProcessedVerificationMatchLevel: string;
    parsingStatus: string;
    lexiconIdentificationMatchLevel: string;
    contextIdentificationMatchLevel: string;
    postCodeStatus: string;
    matchScore: number;
};

export const validateAddress = async (address: TAddress): Promise<TPostgridValidatedAddress> => {
    const postgridAddressFormat = {
        line1: address.address1,
        line2: address.address2,
        city: address.city,
        postalOrZip: address.zip.toString(),
        country: address.country_code,
    };

    const validateAddressResponse = await postgridApiKeyInstance.post<
        TPostgridValidationResult | TPostgridError
    >("/intl_addver/verifications?geoData=false&includeDetails=tru", {
        address: { ...postgridAddressFormat },
    });

    if (validateAddressResponse.status >= 400)
        throw new Error("Provide a valid address", { cause: validateAddressResponse.status });

    const validatedAddress = validateAddressResponse.data.data;

    if ("error" in validatedAddress) throw new Error(validatedAddress.error);
    if (
        validatedAddress.summary.verificationStatus !== "verified" &&
        validatedAddress.summary.verificationStatus !== "partially_verified"
    )
        throw new Error("Could not accurately verify your address. Change it");

    return validatedAddress;
};
