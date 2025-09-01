import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Radio } from 'lucide-react';

export default function AdminUpcomingSessions() {
  // Mock upcoming sessions data since table doesn't exist
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['admin-upcoming-sessions'],
    queryFn: async () => {
      // Return empty array since upcoming_sessions table doesn't exist
      return [];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Upcoming Sessions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-8 w-8" />
                <Video className="h-8 w-8" />
                <Radio className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                <p className="text-muted-foreground">
                  Session management functionality is not yet implemented.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This feature will allow you to schedule and manage live course sessions.
                </p>
              </div>
              <Badge variant="secondary" className="mt-4">
                Coming Soon
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}