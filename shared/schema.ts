import { z } from 'zod';

// ==================== BLOG SCHEMAS ====================

export const blogStatusSchema = z.enum(['draft', 'published']);

export const blogSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(300, 'Excerpt must be less than 300 characters'),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().url().optional(),
  status: blogStatusSchema,
  publishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  })).optional(),
  tags: z.array(z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  })).optional(),
});

export const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  excerpt: z.string().min(1, 'Excerpt is required').max(300, 'Excerpt must be less than 300 characters'),
  content: z.string().optional().default(''),
  coverImage: z.number().optional(),
  status: blogStatusSchema.default('draft'),
  categories: z.array(z.number()).optional(),
  tags: z.array(z.number()).optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

// ==================== CATEGORY SCHEMAS ====================

export const categorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
});

// ==================== TAG SCHEMAS ====================

export const tagSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
});

// ==================== COMMENT SCHEMAS ====================

export const commentSchema = z.object({
  id: z.number(),
  author: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be less than 1000 characters'),
  approved: z.boolean(),
  createdAt: z.string().datetime(),
});

export const createCommentSchema = z.object({
  author: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be less than 1000 characters'),
  blog: z.number(),
});

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ==================== TYPE EXPORTS ====================

export type Blog = z.infer<typeof blogSchema>;
export type CreateBlog = z.infer<typeof createBlogSchema>;
export type UpdateBlog = z.infer<typeof updateBlogSchema>;
export type BlogStatus = z.infer<typeof blogStatusSchema>;

export type Category = z.infer<typeof categorySchema>;
export type Tag = z.infer<typeof tagSchema>;

export type Comment = z.infer<typeof commentSchema>;
export type CreateComment = z.infer<typeof createCommentSchema>;

export type LoginCredentials = z.infer<typeof loginSchema>;

// ==================== UTILITY FUNCTIONS ====================

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
