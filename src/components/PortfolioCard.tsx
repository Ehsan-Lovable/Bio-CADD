import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Clock } from 'lucide-react';

interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  client_name?: string;
  country?: string;
  duration_text?: string;
  summary?: string;
  hero_image_url?: string;
  services: string[];
  featured: boolean;
}

interface PortfolioCardProps {
  project: PortfolioProject;
  className?: string;
}

export function PortfolioCard({ project, className }: PortfolioCardProps) {
  return (
    <Card className={`group overflow-hidden bg-card border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${className}`}>
      {/* Hero Image */}
      <div className="aspect-video overflow-hidden bg-muted">
        {project.hero_image_url ? (
          <img
            src={project.hero_image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <div className="text-muted-foreground text-sm">No image</div>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          {project.featured && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Featured
            </Badge>
          )}
        </div>

        {/* Services */}
        {project.services.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.services.slice(0, 3).map((service) => (
              <Badge
                key={service}
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                {service}
              </Badge>
            ))}
            {project.services.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.services.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {project.country && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{project.country}</span>
            </div>
          )}
          {project.duration_text && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{project.duration_text}</span>
            </div>
          )}
        </div>

        {/* Summary */}
        {project.summary && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {project.summary}
          </p>
        )}

        {/* CTA */}
        <Button
          asChild
          variant="ghost"
          className="w-full justify-between group/btn p-0 h-auto font-medium text-primary hover:text-primary hover:bg-primary/5"
        >
          <Link to={`/portfolio/${project.slug}`}>
            <span>View case study</span>
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}