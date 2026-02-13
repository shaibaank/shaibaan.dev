import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useBlog, useUpdateBlog } from "@/hooks/useBlogs";
import { CreateBlog } from "@shared/schema";
import { getMediaUrl } from "@/lib/strapi";
import BlogForm from "@/components/blog/BlogForm";
import BlogEditor from "@/components/blog/BlogEditor";

export default function BlogEdit() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: blog, isLoading: blogLoading } = useBlog(slug || "");
  const updateBlog = useUpdateBlog();

  const [activeTab, setActiveTab] = useState<"details" | "content">("details");
  const [content, setContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize content when blog loads
  useEffect(() => {
    if (blog?.content) {
      setContent(blog.content);
    }
  }, [blog]);

  // Redirect if not admin
  if (!authLoading && !isAdmin) {
    navigate("/");
    return null;
  }

  if (authLoading || blogLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Blog Not Found</h1>
        <button
          onClick={() => navigate("/blogs")}
          className="px-4 py-2 bg-primary text-primary-foreground"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  const coverImageUrl = blog.coverImage?.url
    ? getMediaUrl(blog.coverImage.url)
    : undefined;

  const handleDetailsSubmit = async (data: CreateBlog) => {
    try {
      await updateBlog.mutateAsync({
        documentId: blog.documentId,
        data: {
          ...data,
          content, // Include current content
        },
      });
      navigate(`/blogs/${data.slug}`);
    } catch (error) {
      console.error("Failed to update blog:", error);
    }
  };

  const handleSaveContent = async () => {
    try {
      await updateBlog.mutateAsync({
        documentId: blog.documentId,
        data: { content },
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save content:", error);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/blogs/${slug}`)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to blog
            </button>
            <a
              href={`/blogs/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Preview
            </a>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            Edit Blog
          </h1>
          <p className="text-muted-foreground mt-2">
            Editing "{blog.title}"
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex border-b border-border mb-8"
        >
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "content"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Content
            {hasUnsavedChanges && (
              <span className="w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "details" ? (
            <div className="border border-border p-6 bg-card">
              <BlogForm
                initialData={{
                  title: blog.title,
                  slug: blog.slug,
                  excerpt: blog.excerpt,
                  content: blog.content,
                  status: blog.status,
                  coverImageUrl,
                  categories: blog.categories?.map((c) => c.id) || [],
                  tags: blog.tags?.map((t) => t.id) || [],
                }}
                onSubmit={handleDetailsSubmit}
                submitLabel="Save Changes"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <BlogEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Continue writing your blog post..."
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {hasUnsavedChanges ? (
                    <span className="text-destructive">You have unsaved changes</span>
                  ) : (
                    "All changes saved"
                  )}
                </p>
                <button
                  onClick={handleSaveContent}
                  disabled={!hasUnsavedChanges || updateBlog.isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updateBlog.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {updateBlog.isPending ? "Saving..." : "Save Content"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
