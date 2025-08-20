import * as React from "react";
import { Search, BookOpen, User, Home, MessageSquare, Briefcase, FileText, Settings } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Fetch courses for search
  const { data: courses } = useQuery({
    queryKey: ['search-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, slug, course_type')
        .eq('status', 'published')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const pages = [
    { name: "Home", path: "/", icon: Home },
    { name: "All Courses", path: "/courses", icon: BookOpen },
    { name: "Blog", path: "/blog", icon: FileText },
    { name: "Contact", path: "/contact", icon: MessageSquare },
    { name: "Career", path: "/career", icon: Briefcase },
    ...(user ? [
      { name: "Dashboard", path: "/dashboard", icon: User },
    ] : []),
    ...(userProfile?.role === 'admin' ? [
      { name: "Admin Panel", path: "/admin", icon: Settings },
    ] : []),
  ];

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages and courses..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem key={page.path} onSelect={() => handleSelect(page.path)}>
                <page.icon className="mr-2 h-4 w-4" />
                {page.name}
              </CommandItem>
            ))}
          </CommandGroup>

          {courses && courses.length > 0 && (
            <CommandGroup heading="Courses">
              {courses.slice(0, 8).map((course) => (
                <CommandItem key={course.id} onSelect={() => handleSelect(`/courses/${course.slug}`)}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{course.title}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {course.course_type || 'Course'}
                    </span>
                  </div>
                </CommandItem>
              ))}
              {courses.length > 8 && (
                <CommandItem onSelect={() => handleSelect('/courses')}>
                  <Search className="mr-2 h-4 w-4" />
                  View all {courses.length} courses...
                </CommandItem>
              )}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}