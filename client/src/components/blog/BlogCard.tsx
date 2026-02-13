import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Blog, getMediaUrl } from "@/lib/strapi";
import { calculateReadingTime } from "@shared/schema";

interface BlogCardProps {
  blog: Blog;
  index?: number;
}

export default function BlogCard({ blog, index = 0 }: BlogCardProps) {
  const coverImage = blog.coverImage?.url;
  const readingTime = calculateReadingTime(blog.content || "");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group border border-border bg-card hover:border-primary transition-colors"
    >
      <Link href={`/blogs/${blog.slug}`}>
        {/* Cover Image */}
        {coverImage && (
          <div className="aspect-video overflow-hidden border-b border-border">
            <img
              src={getMediaUrl(coverImage)}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Categories */}
          {blog.categories && blog.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {blog.categories.map((cat) => (
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
          <h2 className="text-xl font-serif font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h2>

          {/* Excerpt */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {blog.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(blog.publishedAt || blog.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime} min read
              </span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
