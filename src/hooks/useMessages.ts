import { useQuery } from '@tanstack/react-query';
import type { FetchMessagesParams } from '@/lib/api/channels';
import { fetchMessageCount, fetchMessages } from '@/lib/api/channels';

export type MessageQueryFilter = Omit<FetchMessagesParams, 'channelId' | 'offset' | 'includeContent'>;

export function useChannelMessages(
  channelId: string | null,
  filter: MessageQueryFilter,
  offset: number,
) {
  return useQuery({
    queryKey: ['messages', channelId, filter, offset],
    queryFn: () =>
      fetchMessages({
        channelId: channelId!,
        offset,
        limit: filter.limit ?? 50,
        statuses: filter.statuses,
        startDate: filter.startDate,
        endDate: filter.endDate,
        textSearch: filter.textSearch,
      }),
    enabled: Boolean(channelId),
    staleTime: 10_000,
  });
}

export function useMessageCount(channelId: string | null, filter: Omit<MessageQueryFilter, 'limit'>) {
  return useQuery({
    queryKey: ['message-count', channelId, filter],
    queryFn: () =>
      fetchMessageCount({
        channelId: channelId!,
        statuses: filter.statuses,
        startDate: filter.startDate,
        endDate: filter.endDate,
        textSearch: filter.textSearch,
      }),
    enabled: Boolean(channelId),
    staleTime: 10_000,
  });
}
