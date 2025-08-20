import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  actionHref?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  actionHref,
  size = 'md',
  className
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  };

  const iconSizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} text-center ${className || ''}`}>
      {Icon && (
        <Icon className={`${iconSizeClasses[size]} text-muted-foreground mb-4`} />
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {actionLabel && actionHref && (
        <Button asChild>
          <Link to={actionHref}>
            {actionLabel}
          </Link>
        </Button>
      )}
    </div>
  );
};