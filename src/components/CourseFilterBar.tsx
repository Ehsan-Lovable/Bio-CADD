import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';

interface CourseFilters {
  search: string;
  type: string;
  sort: string;
}

interface CourseFilterBarProps {
  filters: CourseFilters;
  onFiltersChange: (key: keyof CourseFilters, value: string) => void;
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  isLoading?: boolean;
  className?: string;
}

export const CourseFilterBar = ({ 
  filters, 
  onFiltersChange, 
  totalResults, 
  currentPage, 
  totalPages,
  isLoading = false,
  className 
}: CourseFilterBarProps) => {
  return (
    <Card className={`p-6 border shadow-soft ${className || ''}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => onFiltersChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <Select value={filters.type} onValueChange={(value) => onFiltersChange('type', value)}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Course Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="recorded">Recorded</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={filters.sort} onValueChange={(value) => onFiltersChange('sort', value)}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : `${totalResults || 0} courses found`}
        </p>
        {currentPage && totalPages && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};