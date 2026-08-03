/**
 * Site React Query Hooks (Sprint 11 Master Location)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siteService } from '../services/site.service';
import type { CreateSitePayload } from '../models/site.model';

export function useSites() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['spatial-sites'],
    queryFn: siteService.getSites,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSitePayload) => siteService.createSite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spatial-sites'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateSitePayload }) =>
      siteService.updateSite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spatial-sites'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => siteService.deleteSite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spatial-sites'] });
    },
  });

  return {
    sites: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createSite: createMutation.mutateAsync,
    updateSite: updateMutation.mutateAsync,
    deleteSite: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
