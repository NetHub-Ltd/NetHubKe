import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchData } from "../utils/api";

/**
 * A simple, reusable hook for any GET endpoint.
 * @template T The expected shape of the data (e.g., Service[] or User)
 */
export function useApi<T>(
  key: string,
  url: string,
  params?: Record<string, any>,
): UseQueryResult<T, Error> {
  return useQuery({
    queryKey: [key, params],
    queryFn: () => fetchData(url, params),
    staleTime: 1000 * 60 * 5,
  });
}
