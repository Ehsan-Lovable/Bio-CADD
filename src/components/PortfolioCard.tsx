import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Clock, Star, ExternalLink } from 'lucide-react';

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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className={`group overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl ${className}`}>
        {/* Hero Image */}
        <div className="aspect-video overflow-hidden relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
          {project.hero_image_url ? (
            <>
              <img
                src={project.hero_image_url}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-purple-800/30 flex items-center justify-center">
              <div className="text-slate-400 dark:text-slate-500 text-sm font-medium">Portfolio Image</div>
            </div>
          )}
          
          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold border-0 shadow-lg">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
            <Button
              asChild
              size="sm"
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white hover:text-slate-900 transition-all duration-300"
            >
              <Link to={`/portfolio/${project.slug}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Case Study
              </Link>
            </Button>
          </div>
        </div>

        <CardHeader className="pb-4 pt-6">
          <div className="space-y-3">
            <h3 className="font-bold text-xl leading-tight text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
              {project.title}
            </h3>

            {/* Client Info */}
            {project.client_name && (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Client: {project.client_name}
              </p>
            )}

            {/* Services Pills */}
            {project.services.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.services.slice(0, 3).map((service, index) => {
                  const colors = [
                    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", 
                    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  ];
                  return (
                    <Badge
                      key={service}
                      className={`${colors[index % colors.length]} border-0 font-medium rounded-full px-3 py-1 text-xs hover:scale-105 transition-transform duration-200`}
                    >
                      {service}
                    </Badge>
                  );
                })}
                {project.services.length > 3 && (
                  <Badge variant="outline" className="text-xs rounded-full border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    +{project.services.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-6">
          {/* Meta Information */}
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-4">
            {project.country && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{project.country}</span>
              </div>
            )}
            {project.duration_text && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{project.duration_text}</span>
              </div>
            )}
          </div>

          {/* Summary */}
          {project.summary && (
            <p className="text-slate-600 dark:text-slate-300 mb-6 line-clamp-3 leading-relaxed">
              {project.summary}
            </p>
          )}

          {/* CTA */}
          <Button
            asChild
            className="w-full group/btn bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            <Link to={`/portfolio/${project.slug}`}>
              <span>View Case Study</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}