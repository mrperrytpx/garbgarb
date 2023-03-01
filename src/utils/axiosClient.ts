import axios from "axios";

export const axiosClient = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 7000,
    signal: new AbortController().signal,
});
