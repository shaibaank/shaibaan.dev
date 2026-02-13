import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { createCommentSchema } from "@shared/schema";
import { useCreateComment } from "@/hooks/useComments";

interface CommentFormProps {
  blogId: number;
}

type CommentFormData = {
  author: string;
  email: string;
  content: string;
};

export default function CommentForm({ blogId }: CommentFormProps) {
  const [success, setSuccess] = useState(false);
  const createComment = useCreateComment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(
      createCommentSchema.omit({ blog: true })
    ),
  });

  const onSubmit = async (data: CommentFormData) => {
    try {
      await createComment.mutateAsync({
        ...data,
        blog: blogId,
      });
      reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  return (
    <div className="border border-border p-6">
      <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>

      {success && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary text-primary text-sm">
          Your comment has been submitted and is awaiting approval.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium mb-2">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="author"
              type="text"
              {...register("author")}
              className="w-full px-4 py-2 bg-background border border-input focus:border-primary focus:outline-none transition-colors"
              placeholder="Your name"
            />
            {errors.author && (
              <p className="mt-1 text-sm text-destructive">{errors.author.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full px-4 py-2 bg-background border border-input focus:border-primary focus:outline-none transition-colors"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Comment <span className="text-destructive">*</span>
          </label>
          <textarea
            id="content"
            {...register("content")}
            rows={4}
            className="w-full px-4 py-3 bg-background border border-input focus:border-primary focus:outline-none transition-colors resize-none"
            placeholder="Write your comment..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-destructive">{errors.content.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={createComment.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {createComment.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {createComment.isPending ? "Submitting..." : "Submit Comment"}
        </button>
      </form>
    </div>
  );
}
