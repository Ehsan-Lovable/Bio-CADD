import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Select value={filters.sort} onValueChange={(sort: FilterState['sort']) => updateFilters({ sort })}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="a-z">A to Z</SelectItem>
            <SelectItem value="z-a">Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Country Filter */}
        <Select value={filters.country || "all"} onValueChange={(country) => updateFilters({ country: country === "all" ? "" : country })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countryOptions.map((country) => (
              <SelectItem key={country} value={country || 'unknown'}>
                {country || 'Unknown'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Service Chips */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Services</h4>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((service) => {
            const isActive = filters.services.includes(service);
            return (
              <Badge
                key={service}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-primary/10 hover:border-primary/30'
                }`}
                onClick={() => toggleService(service)}
              >
                {service}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {filters.search && <span>Search: "{filters.search}" • </span>}
          {filters.services.length > 0 && <span>{filters.services.length} service(s) • </span>}
          {filters.country && <span>Country: {filters.country} • </span>}
          <span className="text-primary">
            {/* This will be filled by the parent component */}
          </span>
        </div>
      )}
    </div>
  );
}