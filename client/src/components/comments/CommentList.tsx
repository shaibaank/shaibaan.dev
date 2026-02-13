import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useComments } from "@/hooks/useComments";

interface CommentListProps {
  blogId: number;
}

export default function CommentList({ blogId }: CommentListProps) {
  const { data: commentsData, isLoading } = useComments(blogId);
  const comments = commentsData?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-border p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-secondary rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-secondary rounded w-32" />
                <div className="h-3 bg-secondary rounded w-24" />
              </div>
            </div>
            <div className="h-4 bg-secondary rounded w-full" />
            <div className="h-4 bg-secondary rounded w-3/4 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 border border-border">
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="border border-border p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-secondary flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{comment.attributes.author}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.attributes.createdAt)}
                </span>
              </div>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {comment.attributes.content}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
