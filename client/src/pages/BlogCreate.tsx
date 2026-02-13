import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCreateBlog, useUpdateBlog } from "@/hooks/useBlogs";
import { CreateBlog } from "@shared/schema";
import BlogForm from "@/components/blog/BlogForm";
import BlogEditor from "@/components/blog/BlogEditor";

export default function BlogCreate() {
  const [, navigate] = useLocation();
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const [step, setStep] = useState<"details" | "editor">("details");
  const [blogData, setBlogData] = useState<CreateBlog | null>(null);
  const [blogDocumentId, setBlogDocumentId] = useState<string | null>(null);
  const [content, setContent] = useState("");

  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();

  // Debug: Log auth state
  console.log('BlogCreate auth state:', { isAdmin, authLoading, user });

  // Redirect if not admin
  if (!authLoading && !isAdmin) {
    console.log('Redirecting to home - not admin');
    navigate("/");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleDetailsSubmit = async (data: CreateBlog) => {
    try {
      const response = await createBlog.mutateAsync(data);
      setBlogData(data);
      setBlogDocumentId(response.data.documentId);
      setContent(data.content || "");
      setStep("editor");
    } catch (error) {
      console.error("Failed to create blog:", error);
    }
  };

  const handleSaveContent = async () => {
    if (!blogDocumentId) return;
    try {
      await updateBlog.mutateAsync({
        documentId: blogDocumentId,
        data: { content, status: "published" },
      });
      navigate(`/blogs/${blogData?.slug}`);
    } catch (error) {
      console.error("Failed to save content:", error);
    }
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
          <button
            onClick={() => {
              if (step === "editor") {
                setStep("details");
              } else {
                navigate("/blogs");
              }
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === "editor" ? "Back to details" : "Back to Blogs"}
          </button>

          <h1 className="text-3xl md:text-4xl font-serif font-bold">
            {step === "details" ? "Create New Blog" : "Write Content"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === "details"
              ? "Fill in the blog details to get started."
              : `Writing content for "${blogData?.title}"`}
          </p>
        </motion.div>

        {/* Steps Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 mb-8"
        >
          <div
            className={`flex items-center gap-2 ${
              step === "details" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center border ${
                step === "details" ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              1
            </div>
            <span className="text-sm font-medium">Details</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div
            className={`flex items-center gap-2 ${
              step === "editor" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center border ${
                step === "editor" ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">Write</span>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === "details" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {step === "details" ? (
            <div className="border border-border p-6 bg-card">
              <BlogForm onSubmit={handleDetailsSubmit} submitLabel="Create & Continue" />
            </div>
          ) : (
            <div className="space-y-6">
              <BlogEditor
                content={content}
                onChange={setContent}
                placeholder="Start writing your amazing blog post..."
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => navigate(`/blogs/${blogData?.slug}`)}
                  className="px-4 py-2 border border-border hover:border-primary transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleSaveContent}
                  disabled={updateBlog.isPending}
                  className="px-6 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {updateBlog.isPending ? "Saving..." : "Save & Publish"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
