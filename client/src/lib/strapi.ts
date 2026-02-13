import qs from 'qs';

// Strapi API configuration
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN || '';

// Types for Strapi responses
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: object;
}

export interface StrapiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: object;
  };
}

// Base fetch function with error handling
async function strapiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  useAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  // Add auth token if required
  if (useAuth) {
    const token = localStorage.getItem('strapi_jwt');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Add API token for public requests if available
  if (!useAuth && STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const response = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'An error occurred');
  }

  return response.json();
}

// Query builder for Strapi filters
export function buildQuery(params: {
  filters?: Record<string, unknown>;
  populate?: string | string[] | Record<string, unknown>;
  sort?: string | string[];
  pagination?: { page?: number; pageSize?: number };
  fields?: string[];
}) {
  return qs.stringify(params, { encodeValuesOnly: true });
}

// ==================== CATEGORIES ====================

export interface CategoryAttributes {
  name: string;
  slug: string;
  description?: string;
}

// ==================== TAGS ====================

export interface TagAttributes {
  name: string;
  slug: string;
}

// ==================== BLOGS ====================

// Strapi v5 returns data flat without attributes wrapper
export interface Blog {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: {
    id: number;
    documentId: string;
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
  status: 'draft' | 'published';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  categories?: Array<{
    id: number;
    documentId: string;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: number;
    documentId: string;
    name: string;
    slug: string;
  }>;
}

export async function getBlogs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  tag?: string;
  status?: 'draft' | 'published';
}) {
  const query = buildQuery({
    populate: ['coverImage', 'categories', 'tags'],
    sort: ['publishedAt:desc'],
    pagination: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
    },
    filters: {
      ...(params?.search && {
        $or: [
          { title: { $containsi: params.search } },
          { excerpt: { $containsi: params.search } },
          { content: { $containsi: params.search } },
        ],
      }),
      ...(params?.category && {
        categories: { slug: { $eq: params.category } },
      }),
      ...(params?.tag && {
        tags: { slug: { $eq: params.tag } },
      }),
      ...(params?.status && {
        status: { $eq: params.status },
      }),
    },
  });

  return strapiFetch<StrapiResponse<Blog[]>>(`/blogs?${query}`);
}

export async function getBlogBySlug(slug: string) {
  const query = buildQuery({
    filters: { slug: { $eq: slug } },
    populate: ['coverImage', 'categories', 'tags'],
  });

  const response = await strapiFetch<StrapiResponse<Blog[]>>(`/blogs?${query}`);
  return response.data[0] || null;
}

export async function createBlog(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: number;
  status: 'draft' | 'published';
  categories?: number[];
  tags?: number[];
}) {
  return strapiFetch<StrapiSingleResponse<Blog>>(
    '/blogs',
    {
      method: 'POST',
      body: JSON.stringify({ data }),
    },
    true
  );
}

export async function updateBlog(
  documentId: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: number;
    status: 'draft' | 'published';
    categories: number[];
    tags: number[];
  }>
) {
  return strapiFetch<StrapiSingleResponse<Blog>>(
    `/blogs/${documentId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ data }),
    },
    true
  );
}

export async function deleteBlog(documentId: string) {
  return strapiFetch<StrapiSingleResponse<Blog>>(
    `/blogs/${documentId}`,
    { method: 'DELETE' },
    false
  );
}

// ==================== CATEGORIES ====================

export interface Category {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  description?: string;
}

export async function getCategories() {
  const query = buildQuery({
    sort: ['name:asc'],
  });

  return strapiFetch<StrapiResponse<Category[]>>(`/categories?${query}`);
}

// ==================== TAGS ====================

export interface Tag {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
}

export async function getTags() {
  const query = buildQuery({
    sort: ['name:asc'],
  });

  return strapiFetch<StrapiResponse<Tag[]>>(`/tags?${query}`);
}

// ==================== COMMENTS ====================

export interface CommentAttributes {
  author: string;
  email: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

export interface Comment {
  id: number;
  attributes: CommentAttributes;
}

export async function getComments(blogId: number) {
  const query = buildQuery({
    filters: {
      blog: { id: { $eq: blogId } },
      approved: { $eq: true },
    },
    sort: ['createdAt:desc'],
  });

  return strapiFetch<StrapiResponse<Comment[]>>(`/comments?${query}`);
}

export async function createComment(data: {
  author: string;
  email: string;
  content: string;
  blog: number;
}) {
  return strapiFetch<StrapiSingleResponse<Comment>>('/comments', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        ...data,
        approved: false, // Comments need approval
      },
    }),
  });
}

// ==================== MEDIA ====================

export async function uploadMedia(file: File) {
  const formData = new FormData();
  formData.append('files', file);

  const token = localStorage.getItem('strapi_jwt');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  return response.json();
}

// ==================== AUTH ====================

export async function login(identifier: string, password: string) {
  const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem('strapi_jwt', data.jwt);
  localStorage.setItem('strapi_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('strapi_jwt');
  localStorage.removeItem('strapi_user');
}

export function isAuthenticated() {
  return !!localStorage.getItem('strapi_jwt');
}

export function getUser() {
  const user = localStorage.getItem('strapi_user');
  return user ? JSON.parse(user) : null;
}

// Get full media URL
export function getMediaUrl(url: string) {
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}
