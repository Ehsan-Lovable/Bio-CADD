import React from 'react';

interface RichTextViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = '' }: RichTextViewerProps) {
  // Clean and sanitize HTML content from the rich text editor
  const sanitizeHtml = (html: string): string => {
    if (!html) return '';
    
    // If it's plain text (no HTML tags), wrap in paragraph
    if (!html.includes('<') && !html.includes('>')) {
      return `<p class="mb-4 leading-relaxed">${html}</p>`;
    }
    
    return html;
  };

  return (
    <div 
      className={`rich-content prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: sanitizeHtml(content) 
      }}
      style={{
        // Custom styles for rich text content
        '--tw-prose-body': 'hsl(var(--muted-foreground))',
        '--tw-prose-headings': 'hsl(var(--foreground))',
        '--tw-prose-links': 'hsl(var(--primary))',
        '--tw-prose-bold': 'hsl(var(--foreground))',
        '--tw-prose-quotes': 'hsl(var(--muted-foreground))',
        '--tw-prose-quote-borders': 'hsl(var(--border))',
        '--tw-prose-code': 'hsl(var(--foreground))',
        '--tw-prose-pre-code': 'hsl(var(--muted-foreground))',
        '--tw-prose-pre-bg': 'hsl(var(--muted))',
      } as React.CSSProperties}
    />
  );
}