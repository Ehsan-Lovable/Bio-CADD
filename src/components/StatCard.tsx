import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  borderColor?: string;
  change?: {
    value: number;
    period: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatCard = ({ icon: Icon, value, label, borderColor, change, className }: StatCardProps) => {
  return (
    <Card className={`p-6 border-t-4 ${borderColor || 'border-t-primary'} bg-background ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {change && (
            <p className={`text-xs mt-1 ${
              change.isPositive !== false ? 'text-success' : 'text-danger'
            }`}>
              {change.isPositive !== false ? '+' : ''}{change.value}% {change.period}
            </p>
          )}
        </div>
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};