import axios, { AxiosInstance } from 'axios';

const axiosClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosClient;