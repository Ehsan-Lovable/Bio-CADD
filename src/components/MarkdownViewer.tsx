import React from 'react';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  // Simple markdown to HTML conversion for basic formatting
  const convertMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';

    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-8 mb-4 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-10 mb-6 text-foreground">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-8 text-foreground">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-semibold text-foreground"><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Unordered lists
      .replace(/^\s*[\*\-\+]\s+(.*)$/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul class="list-disc list-inside mb-4 space-y-1">$1</ul>')
      
      // Ordered lists
      .replace(/^\s*\d+\.\s+(.*)$/gim, '<li class="ml-4 mb-1">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ol class="list-decimal list-inside mb-4 space-y-1">$1</ol>')
      
      // Paragraphs
      .replace(/^(?!<[hul]|<p|<pre|<code)(.+)$/gim, '<p class="mb-4 text-muted-foreground leading-relaxed">$1</p>')
      
      // Line breaks
      .replace(/\n/g, '<br>');
  };

  return (
    <div 
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: convertMarkdownToHtml(content) 
      }}
    />
  );
}