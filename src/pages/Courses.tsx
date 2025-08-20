import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseCard } from '@/components/CourseCard';
import { CourseFilterBar } from '@/components/CourseFilterBar';
import { EmptyState } from '@/components/EmptyState';

interface CourseFilters {
  search: string;
  type: string;
  sort: string;
  page: number;
}

const CourseSkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="aspect-video w-full" />
        <div className="p-6">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const Courses = () => {
  const [filters, setFilters] = useState<CourseFilters>({
    search: '',
    type: 'all',
    sort: 'newest',
    page: 1
  });

  const ITEMS_PER_PAGE = 12;

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .eq('status', 'published');

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.type !== 'all') {
        query = query.eq('course_type', filters.type as any);
      }

      // Apply sorting
      switch (filters.sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_low':
          query = query.order('price_regular', { ascending: true, nullsFirst: false });
          break;
        case 'price_high':
          query = query.order('price_regular', { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (filters.page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return { courses: data || [], total: count || 0 };
    }
  });

  const totalPages = Math.ceil((coursesData?.total || 0) / ITEMS_PER_PAGE);

  const updateFilters = (key: keyof CourseFilters, value: string | number) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value, 
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : parseInt(value))
    }));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">All Courses</h1>
            <p className="text-lg text-muted-foreground">
              Discover our comprehensive collection of courses designed to advance your skills
            </p>
          </div>

          {/* Filters */}
          <CourseFilterBar
            filters={filters}
            onFiltersChange={updateFilters}
            totalResults={coursesData?.total}
            currentPage={filters.page}
            totalPages={totalPages}
            isLoading={isLoading}
            className="mb-8"
          />

          {/* Course Grid */}
          {isLoading ? (
            <CourseSkeleton />
          ) : coursesData?.courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description="Try adjusting your search or filters"
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {coursesData?.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() => updateFilters('page', filters.page - 1)}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = i + Math.max(1, filters.page - 2);
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === filters.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters('page', pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                disabled={filters.page === totalPages}
                onClick={() => updateFilters('page', filters.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Courses;