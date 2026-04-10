import axiosClient from "./axiosClient";
export const fetchData = async (url: string, params?: Record<string, any>) => {
  const res = await axiosClient.get(url, { params });

  if (res.status !== 200) {
    throw new Error(
      `Failed to fetch: ${res.statusText} (Status: ${res.status})`,
    );
  }

  return res.data;
};
