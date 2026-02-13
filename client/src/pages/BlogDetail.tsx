import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Edit, Tag, Trash2 } from "lucide-react";
import { useBlog, useDeleteBlog } from "@/hooks/useBlogs";
import { useAuth } from "@/lib/auth";
import { calculateReadingTime } from "@shared/schema";
import { getMediaUrl } from "@/lib/strapi";
import BlogContent from "@/components/blog/BlogContent";
import CommentForm from "@/components/comments/CommentForm";
import CommentList from "@/components/comments/CommentList";

export default function BlogDetail() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { isAdmin } = useAuth();
  const { data: blog, isLoading, error } = useBlog(slug || "");
  const deleteBlogMutation = useDeleteBlog();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!blog?.documentId) return;
    
    try {
      await deleteBlogMutation.mutateAsync(blog.documentId);
      navigate("/blogs");
    } catch (err) {
      console.error("Failed to delete blog:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/4 mb-4" />
          <div className="h-12 bg-secondary rounded w-3/4 mb-6" />
          <div className="h-64 bg-secondary mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-secondary rounded w-full" />
            <div className="h-4 bg-secondary rounded w-full" />
            <div className="h-4 bg-secondary rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold mb-4">Blog Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The blog you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/blogs"
          className="px-4 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blogs
        </Link>
      </div>
    );
  }

  const coverImage = blog.coverImage?.url;
  const readingTime = calculateReadingTime(blog.content || "");
  const categories = blog.categories || [];
  const tags = blog.tags || [];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-4xl mx-auto">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/blogs"
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readingTime} min read
            </span>
          </div>

          {/* Admin Edit & Delete Buttons */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/blogs/${slug}/edit`}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-border hover:border-primary hover:text-primary transition-colors"
              >
                <Edit className="w-3 h-3" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteBlogMutation.isPending}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-border hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                {deleteBlogMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background border border-border p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-2">Delete Blog?</h3>
                <p className="text-muted-foreground mb-4">
                  Are you sure you want to delete "{blog.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      handleDelete();
                    }}
                    className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.header>

        {/* Cover Image */}
        {coverImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <img
              src={getMediaUrl(coverImage)}
              alt={blog.title}
              className="w-full aspect-[2/1] object-cover border border-border"
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <BlogContent content={blog.content} />
        </motion.div>

        {/* Tags */}
        {tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-2 mb-12 pb-12 border-b border-border"
          >
            <Tag className="w-4 h-4 text-muted-foreground" />
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="text-sm px-2 py-1 border border-border hover:border-primary transition-colors"
              >
                #{tag.name}
              </span>
            ))}
          </motion.div>
        )}

        {/* Comments Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-serif font-bold">Comments</h2>
          <CommentList blogId={blog.id} />
          <CommentForm blogId={blog.id} />
        </motion.section>
      </article>
    </div>
  );
}
