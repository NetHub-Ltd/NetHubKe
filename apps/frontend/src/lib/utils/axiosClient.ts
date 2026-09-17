import axios, { AxiosInstance } from "axios";

/**
 * @deprecated Prefer same-origin `/api/nethub/*` BFF routes.
 * Do not point this at the FastAPI origin via NEXT_PUBLIC_*.
 */
const axiosClient: AxiosInstance = axios.create({
  baseURL: "", // same-origin only
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
