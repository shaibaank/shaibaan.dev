import { getMediaUrl } from "@/lib/strapi";

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  // Process the content to handle Strapi's rich text format
  // Strapi returns markdown or HTML depending on configuration
  const processContent = (rawContent: string) => {
    // Handle image URLs from Strapi
    let processed = rawContent;
    
    // Replace relative image URLs with full Strapi URLs
    processed = processed.replace(
      /!\[([^\]]*)\]\(\/uploads\/([^)]+)\)/g,
      (_, alt, path) => `![${alt}](${getMediaUrl(`/uploads/${path}`)})`
    );

    // Replace src="/uploads/..." with full URL
    processed = processed.replace(
      /src="\/uploads\/([^"]+)"/g,
      (_, path) => `src="${getMediaUrl(`/uploads/${path}`)}"`
    );

    return processed;
  };

  // For HTML content (Strapi rich text)
  if (content.includes("<") && content.includes(">")) {
    return (
      <div
        className="prose prose-invert prose-lg max-w-none
          prose-headings:font-serif prose-headings:font-bold
          prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-semibold
          prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-secondary prose-pre:border prose-pre:border-border
          prose-img:border prose-img:border-border
          prose-blockquote:border-l-primary prose-blockquote:bg-secondary/50 prose-blockquote:pl-6 prose-blockquote:py-2
          prose-ul:list-disc prose-ol:list-decimal
          prose-li:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: processContent(content) }}
      />
    );
  }

  // For markdown content, we'd need a markdown parser
  // For now, render as paragraphs
  return (
    <div className="prose prose-invert prose-lg max-w-none">
      {content.split("\n\n").map((paragraph, i) => (
        <p key={i} className="text-muted-foreground leading-relaxed mb-4">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
