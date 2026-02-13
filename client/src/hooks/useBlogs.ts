import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  Blog,
} from '@/lib/strapi';

// Query keys
export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...blogKeys.lists(), filters] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (slug: string) => [...blogKeys.details(), slug] as const,
};

// Fetch all blogs with optional filters
export function useBlogs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  tag?: string;
  status?: 'draft' | 'published';
}) {
  return useQuery({
    queryKey: blogKeys.list(params || {}),
    queryFn: () => getBlogs(params),
  });
}

// Fetch single blog by slug
export function useBlog(slug: string) {
  return useQuery({
    queryKey: blogKeys.detail(slug),
    queryFn: () => getBlogBySlug(slug),
    enabled: !!slug,
  });
}

// Create a new blog
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}

// Update an existing blog
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: Parameters<typeof updateBlog>[1] }) =>
      updateBlog(documentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      // Also invalidate the specific blog detail if we knew the slug
    },
  });
}

// Delete a blog
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}

// Transform Strapi blog response to a cleaner format (Strapi v5 flat structure)
export function transformBlog(blog: Blog) {
  return {
    id: blog.id,
    documentId: blog.documentId,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    coverImage: blog.coverImage?.url,
    status: blog.status,
    publishedAt: blog.publishedAt,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    categories: blog.categories?.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    })) || [],
    tags: blog.tags?.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })) || [],
  };
}
