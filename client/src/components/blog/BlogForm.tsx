import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import { createBlogSchema, CreateBlog, generateSlug } from "@shared/schema";
import { useCategories, useTags } from "@/hooks/useCategories";
import { uploadMedia, getMediaUrl } from "@/lib/strapi";

interface BlogFormProps {
  initialData?: Partial<CreateBlog> & { coverImageUrl?: string };
  onSubmit: (data: CreateBlog) => Promise<void>;
  submitLabel?: string;
}

export default function BlogForm({
  initialData,
  onSubmit,
  submitLabel = "Create Blog",
}: BlogFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "");
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: categoriesData } = useCategories();
  const { data: tagsData } = useTags();

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBlog>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      status: initialData?.status || "draft",
      categories: initialData?.categories || [],
      tags: initialData?.tags || [],
      coverImage: initialData?.coverImage,
    },
  });

  const title = watch("title");
  const selectedCategories = watch("categories") || [];
  const selectedTags = watch("tags") || [];

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !initialData?.slug) {
      setValue("slug", generateSlug(title));
    }
  }, [title, setValue, initialData?.slug]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await uploadMedia(file);
      if (response && response[0]) {
        setValue("coverImage", response[0].id);
        setCoverImageUrl(getMediaUrl(response[0].url));
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeCoverImage = () => {
    setValue("coverImage", undefined);
    setCoverImageUrl("");
  };

  const toggleCategory = (categoryId: number) => {
    const current = selectedCategories;
    if (current.includes(categoryId)) {
      setValue(
        "categories",
        current.filter((id) => id !== categoryId)
      );
    } else {
      setValue("categories", [...current, categoryId]);
    }
  };

  const toggleTag = (tagId: number) => {
    const current = selectedTags;
    if (current.includes(tagId)) {
      setValue(
        "tags",
        current.filter((id) => id !== tagId)
      );
    } else {
      setValue("tags", [...current, tagId]);
    }
  };

  const handleFormSubmit = async (data: CreateBlog) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          className="w-full px-4 py-3 bg-background border border-input focus:border-primary focus:outline-none transition-colors text-lg"
          placeholder="Enter blog title..."
        />
        {errors.title && (
          <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          Slug <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">/blogs/</span>
          <input
            id="slug"
            type="text"
            {...register("slug")}
            className="flex-1 px-4 py-2 bg-background border border-input focus:border-primary focus:outline-none transition-colors text-sm font-mono"
            placeholder="my-blog-post"
          />
        </div>
        {errors.slug && (
          <p className="mt-1 text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
          Excerpt <span className="text-destructive">*</span>
        </label>
        <textarea
          id="excerpt"
          {...register("excerpt")}
          rows={3}
          className="w-full px-4 py-3 bg-background border border-input focus:border-primary focus:outline-none transition-colors resize-none"
          placeholder="A brief description of your blog post..."
        />
        {errors.excerpt && (
          <p className="mt-1 text-sm text-destructive">{errors.excerpt.message}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {watch("excerpt")?.length || 0}/300 characters
        </p>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Cover Image</label>
        {coverImageUrl ? (
          <div className="relative border border-border">
            <img
              src={coverImageUrl}
              alt="Cover"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={removeCoverImage}
              className="absolute top-2 right-2 p-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border border-dashed border-border hover:border-primary cursor-pointer transition-colors">
            {uploadingImage ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload cover image
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
          </label>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={`px-3 py-1 text-sm border transition-colors ${
                  selectedCategories.includes(category.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 text-sm border transition-colors ${
                  selectedTags.includes(tag.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register("status")}
              value="draft"
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm">Draft</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register("status")}
              value="published"
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm">Published</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
