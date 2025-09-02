import { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Write your description...",
  minHeight = 200,
  className = ""
}: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const [editorHeight, setEditorHeight] = useState(minHeight);

  // Gmail-style toolbar configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'color', 'background',
    'align', 'code-block'
  ];

  // Auto-resize functionality
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const container = quillRef.current.getEditingArea();
      
      if (container) {
        // Auto-resize based on content
        const resizeObserver = new ResizeObserver(() => {
          const scrollHeight = quill.root.scrollHeight;
          const newHeight = Math.max(minHeight, scrollHeight + 50);
          if (newHeight !== editorHeight) {
            setEditorHeight(newHeight);
          }
        });
        
        resizeObserver.observe(quill.root);
        
        return () => resizeObserver.disconnect();
      }
    }
  }, [value, minHeight, editorHeight]);

  return (
    <div className={`rich-text-editor ${className}`}>
      <style>{`
        .rich-text-editor .ql-toolbar {
          border: 1px solid hsl(var(--border));
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          background: hsl(var(--background));
          padding: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 8px;
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .rich-text-editor .ql-container {
          border: 1px solid hsl(var(--border));
          border-radius: 0 0 8px 8px;
          font-family: inherit;
          font-size: 14px;
          background: hsl(var(--background));
        }
        
        .rich-text-editor .ql-editor {
          min-height: ${Math.max(minHeight - 60, 150)}px;
          height: auto;
          max-height: 500px;
          overflow-y: auto;
          color: hsl(var(--foreground));
          line-height: 1.6;
          padding: 16px;
          resize: vertical;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
          opacity: 0.7;
        }
        
        .rich-text-editor .ql-toolbar button {
          border-radius: 4px;
          padding: 6px;
          margin: 1px;
          border: none;
          background: transparent;
          color: hsl(var(--foreground));
          transition: all 0.2s;
        }
        
        .rich-text-editor .ql-toolbar button:hover {
          background: hsl(var(--muted));
        }
        
        .rich-text-editor .ql-toolbar button.ql-active {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: currentColor;
        }
        
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: currentColor;
        }
        
        .rich-text-editor .ql-tooltip {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .rich-text-editor .ql-picker {
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-picker-options {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .rich-text-editor .ql-picker-item:hover {
          background: hsl(var(--muted));
        }
        
        /* Make the editor resizable */
        .rich-text-editor .ql-container {
          resize: vertical;
          min-height: ${minHeight}px;
        }
        
        /* Custom scrollbar */
        .rich-text-editor .ql-editor::-webkit-scrollbar {
          width: 8px;
        }
        
        .rich-text-editor .ql-editor::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 4px;
        }
        
        .rich-text-editor .ql-editor::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground));
          border-radius: 4px;
        }
        
        .rich-text-editor .ql-editor::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--foreground));
        }
      `}</style>
      
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ 
          minHeight: `${minHeight}px`,
          height: 'auto'
        }}
      />
    </div>
  );
};
