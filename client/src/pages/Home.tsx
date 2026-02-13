import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, PenSquare } from "lucide-react";
import { SentientSphere } from "@/components/SentientSphere";
import { useAuth } from "@/lib/auth";
import { useBlogs } from "@/hooks/useBlogs";
import BlogCard from "@/components/blog/BlogCard";

function TypingAnimation({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function Home() {
  const { isAdmin } = useAuth();
  const { data: blogsData, isLoading } = useBlogs({ pageSize: 3, status: "published" });
  const blogs = blogsData?.data || [];

  return (
    <div className="bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Hero Section */}
      <header className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0 opacity-60">
          <SentientSphere />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-none overflow-hidden border-2 border-primary rotate-3 transition-transform hover:rotate-0 duration-500">
              <img
                src="/avatar.png"
                alt="Profile"
                className="w-full h-full object-cover pixelated"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="font-mono text-xl md:text-2xl lg:text-3xl font-medium tracking-tight mb-6"
          >
            <TypingAnimation text="sup, I'm shaibaan, i tinker around with software until i break or make something :)" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-xl text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-8"
          >
            welcome to my digital garden
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/blogs"
              className="px-6 py-3 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Browse Blogs
              <ArrowRight className="w-4 h-4" />
            </Link>
            {isAdmin && (
              <Link
                href="/admin/blogs/new"
                className="px-6 py-3 border border-border hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <PenSquare className="w-4 h-4" />
                New Blog
              </Link>
            )}
          </motion.div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />
      </header>

      {/* Recent Blogs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-serif font-bold">Recent Posts</h2>
            <Link
              href="/blogs"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-border bg-card animate-pulse">
                  <div className="aspect-video bg-secondary" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-secondary rounded w-1/4" />
                    <div className="h-6 bg-secondary rounded w-3/4" />
                    <div className="h-4 bg-secondary rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, index) => (
                <BlogCard key={blog.id} blog={blog} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-border">
              <p className="text-muted-foreground mb-4">No blogs yet</p>
              {isAdmin && (
                <Link
                  href="/admin/blogs/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  <PenSquare className="w-4 h-4" />
                  Create your first blog
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
