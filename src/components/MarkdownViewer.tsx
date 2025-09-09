import React from 'react';
import DOMPurify from 'dompurify';

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
    
    // Sanitize HTML to prevent XSS attacks
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote'],
      ALLOWED_ATTR: ['href', 'class'],
      ALLOW_DATA_ATTR: false,
      FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload']
    });
    
    // Post-process to make links safe
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('target', '_blank');
    });
    
    return tempDiv.innerHTML;
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