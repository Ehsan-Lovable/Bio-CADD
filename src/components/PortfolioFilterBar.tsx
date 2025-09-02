import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter, SortAsc } from 'lucide-react';

interface FilterState {
  search: string;
  services: string[];
  country: string;
  sort: 'newest' | 'oldest' | 'a-z' | 'z-a';
}

interface PortfolioFilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  serviceOptions: string[];
  countryOptions: string[];
}

export function PortfolioFilterBar({
  filters,
  onFiltersChange,
  serviceOptions,
  countryOptions,
}: PortfolioFilterBarProps) {
  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleService = (service: string) => {
    const services = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service];
    updateFilters({ services });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      services: [],
      country: '',
      sort: 'newest',
    });
  };

  const hasActiveFilters = filters.search || filters.services.length > 0 || filters.country;

  return (
    <div className="space-y-8">
      {/* Search and Sort Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input
            placeholder="Search projects by title, client, or description..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-12 pr-4 py-3 text-lg border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 focus:border-purple-400 dark:focus:border-purple-500 transition-all duration-300 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <SortAsc className="h-4 w-4" />
            <span className="text-sm font-medium">Sort:</span>
          </div>
          <Select value={filters.sort} onValueChange={(sort: FilterState['sort']) => updateFilters({ sort })}>
            <SelectTrigger className="w-48 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:border-purple-400 dark:focus:border-purple-500">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700">
              <SelectItem value="newest" className="rounded-lg">Newest first</SelectItem>
              <SelectItem value="oldest" className="rounded-lg">Oldest first</SelectItem>
              <SelectItem value="a-z" className="rounded-lg">A to Z</SelectItem>
              <SelectItem value="z-a" className="rounded-lg">Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          {/* Country Filter */}
          <Select value={filters.country || "all"} onValueChange={(country) => updateFilters({ country: country === "all" ? "" : country })}>
            <SelectTrigger className="w-48 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:border-blue-400 dark:focus:border-blue-500">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-slate-200 dark:border-slate-700">
              <SelectItem value="all" className="rounded-lg">All countries</SelectItem>
              {countryOptions.map((country) => (
                <SelectItem key={country} value={country || 'unknown'} className="rounded-lg">
                  {country || 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Service Pills */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Services</h4>
          <div className="flex flex-wrap gap-3">
            {serviceOptions.map((service) => {
              const isActive = filters.services.includes(service);
              return (
                <motion.div
                  key={service}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className={`cursor-pointer font-medium px-4 py-2 text-sm rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300'
                    }`}
                    onClick={() => toggleService(service)}
                  >
                    {service}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Active Filters Summary */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">Active filters:</span>
                {filters.search && (
                  <Badge variant="outline" className="bg-white dark:bg-slate-800 border-purple-300 dark:border-purple-700">
                    Search: "{filters.search}"
                  </Badge>
                )}
                {filters.services.length > 0 && (
                  <Badge variant="outline" className="bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700">
                    {filters.services.length} service{filters.services.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                {filters.country && (
                  <Badge variant="outline" className="bg-white dark:bg-slate-800 border-green-300 dark:border-green-700">
                    Country: {filters.country}
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}