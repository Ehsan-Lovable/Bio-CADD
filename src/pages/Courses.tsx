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
import { Search, Filter, BookOpen, Clock, Award, Users, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseFilters {
  search: string;
  type: string;
  sort: string;
  page: number;
}

const CourseCard = ({ course }: { course: any }) => {
  return (
    <Card className="group overflow-hidden hover:shadow-mustard transition-all duration-300">
      <Link to={`/courses/${course.slug}`}>
        <div className="aspect-video bg-muted relative overflow-hidden">
          {course.poster_url ? (
            <img 
              src={course.poster_url} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-primary/40" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge variant={course.course_type === 'live' ? 'destructive' : 'secondary'}>
              {course.course_type?.charAt(0).toUpperCase() + course.course_type?.slice(1) || 'Course'}
            </Badge>
          </div>
          {course.price_offer && course.price_regular && course.price_offer < course.price_regular && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-danger text-white">
                Save {Math.round(((course.price_regular - course.price_offer) / course.price_regular) * 100)}%
              </Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
              {course.title}
            </h3>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            {course.module_count && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {course.module_count} modules
              </span>
            )}
            {course.duration_text && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.duration_text}
              </span>
            )}
            {course.certificate && (
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Certificate
              </span>
            )}
            {course.difficulty && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {course.difficulty}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {course.price_regular && (
                <div className="flex items-center gap-2">
                  {course.price_offer && course.price_offer < course.price_regular ? (
                    <>
                      <span className="font-bold text-lg text-primary">৳{course.price_offer}</span>
                      <span className="text-sm text-muted-foreground line-through">৳{course.price_regular}</span>
                    </>
                  ) : (
                    <span className="font-bold text-lg text-primary">৳{course.price_regular}</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Available</span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

const CourseSkeleton = () => (
  <Card className="overflow-hidden">
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
          <div className="bg-card rounded-2xl p-6 mb-8 border shadow-soft">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={filters.search}
                  onChange={(e) => updateFilters('search', e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={filters.type} onValueChange={(value) => updateFilters('type', value)}>
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
              <Select value={filters.sort} onValueChange={(value) => updateFilters('sort', value)}>
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
                {isLoading ? 'Loading...' : `${coursesData?.total || 0} courses found`}
              </p>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Page {filters.page} of {totalPages || 1}
                </span>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <CourseSkeleton key={i} />
              ))}
            </div>
          ) : coursesData?.courses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
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