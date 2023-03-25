import axios from "axios";

export const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 7000,
    signal: new AbortController().signal,
});
