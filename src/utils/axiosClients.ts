import axios from "axios";

export const apiInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 7000,
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
    timeout: 7000,
    signal: new AbortController().signal,
});

export const printfulApiInstance = axios.create({
    baseURL: "https://api.printful.com",
    timeout: 7000,
    headers: {
        "Content-Type": "application/json",
    },
    signal: new AbortController().signal,
});

export const postgridApiKeyInstance = axios.create({
    baseURL: "https://api.postgrid.com/v1",
    timeout: 7000,
    headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.POSTGRID_API_KEY,
    },
    signal: new AbortController().signal,
});
