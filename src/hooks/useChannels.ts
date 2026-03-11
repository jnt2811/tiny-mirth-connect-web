import { useQuery } from '@tanstack/react-query';
import { fetchChannel, fetchChannels } from '@/lib/api/channels';

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
  });
}

export function useChannel(id: string) {
  return useQuery({
    queryKey: ['channels', id],
    queryFn: () => fetchChannel(id),
    enabled: Boolean(id),
  });
}
