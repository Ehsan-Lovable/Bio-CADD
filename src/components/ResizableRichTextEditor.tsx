import { useState, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Move } from 'lucide-react';

interface ResizableRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

export const ResizableRichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Write your description...",
  minHeight = 200,
  className = ""
}: ResizableRichTextEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customHeight, setCustomHeight] = useState(minHeight);
  const quillRef = useRef<ReactQuill>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Gmail-style toolbar configuration with more options
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
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

  const currentHeight = isExpanded ? Math.max(customHeight, 400) : customHeight;

  return (
    <div className={`resizable-rich-text-editor group ${className}`} ref={containerRef}>
      <style>{`
        .resizable-rich-text-editor {
          position: relative;
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          background: hsl(var(--background));
        }
        
        .resizable-rich-text-editor .ql-toolbar {
          border: none;
          border-bottom: 1px solid hsl(var(--border));
          border-radius: 8px 8px 0 0;
          background: hsl(var(--muted/30));
          padding: 8px 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          min-height: 44px;
        }
        
        .resizable-rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 8px;
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .resizable-rich-text-editor .ql-container {
          border: none;
          border-radius: 0 0 8px 8px;
          font-family: inherit;
          font-size: 14px;
          background: hsl(var(--background));
          height: ${currentHeight - 44}px;
        }
        
        .resizable-rich-text-editor .ql-editor {
          height: ${currentHeight - 44}px;
          color: hsl(var(--foreground));
          line-height: 1.6;
          padding: 16px;
          font-size: 14px;
          overflow-y: auto;
        }
        
        .resizable-rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
          opacity: 0.6;
          font-size: 14px;
        }
        
        .resizable-rich-text-editor .ql-toolbar button {
          border-radius: 4px;
          padding: 6px 8px;
          margin: 1px;
          border: none;
          background: transparent;
          color: hsl(var(--foreground));
          transition: all 0.2s;
          height: 28px;
          width: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .resizable-rich-text-editor .ql-toolbar button:hover {
          background: hsl(var(--muted));
        }
        
        .resizable-rich-text-editor .ql-toolbar button.ql-active {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        
        .resizable-rich-text-editor .ql-toolbar .ql-stroke {
          stroke: currentColor;
        }
        
        .resizable-rich-text-editor .ql-toolbar .ql-fill {
          fill: currentColor;
        }
        
        .resizable-rich-text-editor .ql-picker {
          color: hsl(var(--foreground));
        }
        
        .resizable-rich-text-editor .ql-picker-label {
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .resizable-rich-text-editor .ql-picker-label:hover {
          background: hsl(var(--muted));
        }
        
        .resizable-rich-text-editor .ql-picker-options {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          margin-top: 4px;
        }
        
        .resizable-rich-text-editor .ql-picker-item {
          padding: 8px 12px;
        }
        
        .resizable-rich-text-editor .ql-picker-item:hover {
          background: hsl(var(--muted));
        }
        
        .resizable-rich-text-editor .ql-tooltip {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        /* Custom scrollbar */
        .resizable-rich-text-editor .ql-editor::-webkit-scrollbar {
          width: 6px;
        }
        
        .resizable-rich-text-editor .ql-editor::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .resizable-rich-text-editor .ql-editor::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground/30));
          border-radius: 3px;
        }
        
        .resizable-rich-text-editor .ql-editor::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground/50));
        }
      `}</style>
      
      {/* Resize Controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {customHeight}px
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
          title={isExpanded ? "Minimize editor" : "Expand editor"}
        >
          {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
        </Button>
      </div>
      
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      
      {/* Resize Handle */}
      <div className="absolute bottom-0 right-0 flex">
        {/* Corner resize handle */}
        <div 
          className="w-5 h-5 cursor-se-resize bg-muted-foreground/10 hover:bg-muted-foreground/30 transition-colors flex items-center justify-center group"
          style={{ borderRadius: '0 0 8px 0' }}
          onMouseDown={(e) => {
            e.preventDefault();
            const startY = e.clientY;
            const startHeight = customHeight;
            
            const handleMouseMove = (e: MouseEvent) => {
              const deltaY = e.clientY - startY;
              const newHeight = Math.max(minHeight, Math.min(600, startHeight + deltaY));
              setCustomHeight(newHeight);
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
              document.body.style.cursor = 'default';
              document.body.style.userSelect = 'auto';
            };
            
            document.body.style.cursor = 'se-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
          title="Drag to resize"
        >
          <Move className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground/80 rotate-45" />
        </div>
      </div>
      
      {/* Quick Size Buttons */}
      <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCustomHeight(200)}
          className="h-6 px-2 text-xs bg-background/80 hover:bg-background"
          title="Small size"
        >
          S
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCustomHeight(300)}
          className="h-6 px-2 text-xs bg-background/80 hover:bg-background"
          title="Medium size"
        >
          M
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCustomHeight(450)}
          className="h-6 px-2 text-xs bg-background/80 hover:bg-background"
          title="Large size"
        >
          L
        </Button>
      </div>
    </div>
  );
};
