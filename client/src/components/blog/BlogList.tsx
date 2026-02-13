import { Blog } from "@/lib/strapi";
import BlogCard from "./BlogCard";

interface BlogListProps {
  blogs: Blog[];
  loading?: boolean;
}

export default function BlogList({ blogs, loading }: BlogListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-border bg-card animate-pulse">
            <div className="aspect-video bg-secondary" />
            <div className="p-6 space-y-3">
              <div className="h-4 bg-secondary rounded w-1/4" />
              <div className="h-6 bg-secondary rounded w-3/4" />
              <div className="h-4 bg-secondary rounded w-full" />
              <div className="h-4 bg-secondary rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-16 border border-border">
        <p className="text-muted-foreground">No blogs found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog, index) => (
        <BlogCard key={blog.id} blog={blog} index={index} />
      ))}
    </div>
  );
}
