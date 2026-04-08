import { useInfiniteQuery, type InfiniteData, type UseInfiniteQueryOptions } from "@tanstack/react-query"
import { getNotificationsQueryKey } from "@/api/hooks/useGetNotifications"
import { getNotifications } from "@/api/clients/getNotifications"
import type { GetNotificationsQueryResponse, GetNotificationsQueryParams, GetNotifications400, GetNotifications401, GetNotifications500 } from "@/api/models/GetNotifications"
import type { ResponseErrorConfig } from "@kubb/plugin-client/clients/axios"

export function useGetNotificationsInfinite(
  params?: GetNotificationsQueryParams,
  options?: Omit<
    UseInfiniteQueryOptions<
      GetNotificationsQueryResponse,
      // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
      ResponseErrorConfig<GetNotifications400 | GetNotifications401 | GetNotifications500>,
      InfiniteData<GetNotificationsQueryResponse>,
      ReturnType<typeof getNotificationsQueryKey>,
      string | undefined
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >
) {
  const queryKey = getNotificationsQueryKey(params)

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam, signal }) => {
      const mergedParams = { ...params, ...(pageParam ? { cursor: pageParam } : {}) }
      return getNotifications(mergedParams, { signal })
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor || undefined,
    ...options,
  })
}
