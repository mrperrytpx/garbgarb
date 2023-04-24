import axios from "axios";

export const apiInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    headers: {
        "Content-Type": "application/json",
    },
    signal: new AbortController().signal,
});

export const printfulApiKeyInstance = axios.create({
    baseURL: "https://api.printful.com",
    headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        "Content-Type": "application/json",
        "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID,
    },
    signal: new AbortController().signal,
});

export const printfulApiInstance = axios.create({
    baseURL: "https://api.printful.com",
    headers: {
        "Content-Type": "application/json",
    },
    signal: new AbortController().signal,
});
