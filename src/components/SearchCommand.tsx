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
    { name: "Portfolio", path: "/portfolio", icon: Briefcase },
    { name: "Contact", path: "/contact", icon: MessageSquare },
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
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 border-violet-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-300 group"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2 text-violet-600 group-hover:text-violet-700 transition-colors duration-300" />
        <span className="hidden xl:inline-flex text-violet-700 group-hover:text-violet-800 transition-colors duration-300">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-violet-50 border-violet-200 px-1.5 font-mono text-[10px] font-medium text-violet-700 opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages and courses..." className="border-violet-200 focus:border-violet-400" />
        <CommandList className="bg-white">
          <CommandEmpty className="text-violet-600">No results found.</CommandEmpty>
          
          <CommandGroup heading="Pages" className="text-violet-700">
            {pages.map((page) => (
              <CommandItem 
                key={page.path} 
                onSelect={() => handleSelect(page.path)}
                className="hover:bg-violet-50 text-violet-700 hover:text-violet-800 transition-colors duration-200"
              >
                <page.icon className="mr-2 h-4 w-4 text-violet-600" />
                {page.name}
              </CommandItem>
            ))}
          </CommandGroup>

          {courses && courses.length > 0 && (
            <CommandGroup heading="Courses" className="text-violet-700">
              {courses.slice(0, 8).map((course) => (
                <CommandItem 
                  key={course.id} 
                  onSelect={() => handleSelect(`/courses/${course.slug}`)}
                  className="hover:bg-violet-50 text-violet-700 hover:text-violet-800 transition-colors duration-200"
                >
                  <BookOpen className="mr-2 h-4 w-4 text-violet-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">{course.title}</span>
                    <span className="text-xs text-violet-500 capitalize">{course.course_type}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}