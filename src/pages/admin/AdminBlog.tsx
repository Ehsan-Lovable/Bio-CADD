// Blog functionality is disabled until blog tables are created in the database
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminBlog() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <p className="text-muted-foreground">
          Blog functionality is currently disabled until the necessary database tables are created.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Features Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Blog management features will be available once the blog tables (blog_posts, blog_categories, blog_series) 
            are added to the database schema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}