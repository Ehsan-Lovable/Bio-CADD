import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, X, GripVertical } from 'lucide-react';

interface RepeatableItem {
  id: string;
  [key: string]: any;
}

interface RepeatableListProps {
  items: RepeatableItem[];
  onItemsChange: (items: RepeatableItem[]) => void;
  renderItem: (item: RepeatableItem, index: number, onChange: (field: string, value: any) => void) => React.ReactNode;
  addButtonText?: string;
  emptyMessage?: string;
  className?: string;
  maxItems?: number;
}

export const RepeatableList = ({
  items,
  onItemsChange,
  renderItem,
  addButtonText = "Add Item",
  emptyMessage = "No items added yet",
  className,
  maxItems
}: RepeatableListProps) => {
  const addItem = () => {
    const newItem: RepeatableItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2)}`
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    onItemsChange(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onItemsChange(newItems);
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">{emptyMessage}</p>
          <Button onClick={addItem} disabled={maxItems && items.length >= maxItems}>
            <Plus className="h-4 w-4 mr-2" />
            {addButtonText}
          </Button>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 cursor-grab"
                      onMouseDown={(e) => {
                        // Basic drag functionality - can be enhanced with react-beautiful-dnd
                        e.preventDefault();
                      }}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    {renderItem(item, index, (field, value) => updateItem(item.id, field, value))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <Button 
            onClick={addItem} 
            variant="outline" 
            className="w-full"
            disabled={maxItems && items.length >= maxItems}
          >
            <Plus className="h-4 w-4 mr-2" />
            {addButtonText}
          </Button>
        </>
      )}
    </div>
  );
};

// Convenience components for common use cases
export const StringRepeatableList = ({
  items,
  onItemsChange,
  placeholder = "Enter text...",
  ...props
}: Omit<RepeatableListProps, 'items' | 'renderItem'> & {
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder?: string;
}) => {
  const repeatableItems: RepeatableItem[] = items.map((item, index) => ({
    id: `string-${index}`,
    value: item
  }));

  const handleItemsChange = (newItems: RepeatableItem[]) => {
    onItemsChange(newItems.map(item => item.value || ''));
  };

  return (
    <RepeatableList
      {...props}
      items={repeatableItems}
      onItemsChange={handleItemsChange}
      renderItem={(item, index, onChange) => (
        <Input
          value={item.value || ''}
          onChange={(e) => onChange('value', e.target.value)}
          placeholder={placeholder}
        />
      )}
    />
  );
};

export const RoadmapRepeatableList = ({
  items,
  onItemsChange,
  ...props
}: Omit<RepeatableListProps, 'items' | 'renderItem'> & {
  items: Array<{ title: string; description?: string; }>;
  onItemsChange: (items: Array<{ title: string; description?: string; }>) => void;
}) => {
  const repeatableItems: RepeatableItem[] = items.map((item, index) => ({
    id: `roadmap-${index}`,
    ...item
  }));

  const handleItemsChange = (newItems: RepeatableItem[]) => {
    onItemsChange(newItems.map(item => ({
      title: item.title || '',
      description: item.description || ''
    })));
  };

  return (
    <RepeatableList
      {...props}
      items={repeatableItems}
      onItemsChange={handleItemsChange}
      renderItem={(item, index, onChange) => (
        <div className="space-y-3">
          <Input
            value={item.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Step title..."
          />
          <Textarea
            value={item.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Step description (optional)..."
            rows={2}
          />
        </div>
      )}
    />
  );
};