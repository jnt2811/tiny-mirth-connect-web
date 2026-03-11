import { useQuery } from '@tanstack/react-query';
import { fetchChannelStatistics, fetchChannelStatuses } from '@/lib/api/channels';

export function useChannelStatistics() {
  return useQuery({
    queryKey: ['channel-statistics'],
    queryFn: fetchChannelStatistics,
    refetchInterval: 30_000,
  });
}

export function useChannelStatuses() {
  return useQuery({
    queryKey: ['channel-statuses'],
    queryFn: fetchChannelStatuses,
    refetchInterval: 30_000,
  });
}
