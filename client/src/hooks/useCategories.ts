import { useQuery } from '@tanstack/react-query';
import { getCategories, getTags } from '@/lib/strapi';

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
};

export const tagKeys = {
  all: ['tags'] as const,
};

// Fetch all categories
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30, // Categories change rarely, cache for 30 mins
  });
}

// Fetch all tags
export function useTags() {
  return useQuery({
    queryKey: tagKeys.all,
    queryFn: getTags,
    staleTime: 1000 * 60 * 30, // Tags change rarely, cache for 30 mins
  });
}
