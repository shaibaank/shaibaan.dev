import { useState } from "react";
import { motion } from "framer-motion";
import { useBlogs } from "@/hooks/useBlogs";
import { useCategories, useTags } from "@/hooks/useCategories";
import BlogList from "@/components/blog/BlogList";
import SearchBar from "@/components/blog/SearchBar";

export default function BlogsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data: blogsData, isLoading } = useBlogs({
    page,
    pageSize: 9,
    search: search || undefined,
    category: selectedCategory,
    tag: selectedTag,
    status: "published",
  });

  const { data: categoriesData } = useCategories();
  const { data: tagsData } = useTags();

  const blogs = blogsData?.data || [];
  const pagination = blogsData?.meta?.pagination;
  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(undefined);
    setSelectedTag(undefined);
    setPage(1);
  };

  const hasActiveFilters = search || selectedCategory || selectedTag;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Blogs</h1>
          <p className="text-muted-foreground text-lg">
            Explore thoughts, ideas, and learnings.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <SearchBar value={search} onChange={setSearch} />

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Categories:</span>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(
                      selectedCategory === category.slug
                        ? undefined
                        : category.slug
                    );
                    setPage(1);
                  }}
                  className={`px-3 py-1 text-sm border transition-colors ${
                    selectedCategory === category.slug
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Tags:</span>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setSelectedTag(
                      selectedTag === tag.slug
                        ? undefined
                        : tag.slug
                    );
                    setPage(1);
                  }}
                  className={`px-3 py-1 text-sm border transition-colors ${
                    selectedTag === tag.slug
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary"
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Clear all filters
            </button>
          )}
        </motion.div>

        {/* Blog List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BlogList blogs={blogs} loading={isLoading} />
        </motion.div>

        {/* Pagination */}
        {pagination && pagination.pageCount > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex justify-center gap-2"
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-muted-foreground">
              Page {page} of {pagination.pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pageCount, p + 1))}
              disabled={page === pagination.pageCount}
              className="px-4 py-2 border border-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
