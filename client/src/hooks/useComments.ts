import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment } from '@/lib/strapi';

// Query keys
export const commentKeys = {
  all: ['comments'] as const,
  list: (blogId: number) => [...commentKeys.all, blogId] as const,
};

// Fetch comments for a blog
export function useComments(blogId: number) {
  return useQuery({
    queryKey: commentKeys.list(blogId),
    queryFn: () => getComments(blogId),
    enabled: !!blogId,
  });
}

// Create a new comment
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(variables.blog) });
    },
  });
}
