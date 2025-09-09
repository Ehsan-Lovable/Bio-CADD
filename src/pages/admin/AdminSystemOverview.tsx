import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const MermaidDiagram = ({ children }: { children: string }) => (
  <div className="bg-muted/30 p-6 rounded-lg overflow-x-auto">
    <pre className="text-sm">
      <code>{children}</code>
    </pre>
  </div>
);

export default function AdminSystemOverview() {
  const siteMapDiagram = `graph TD
    A["/"] --> A1["Homepage"]
    A1 --> A2["Hero Section"]
    A1 --> A3["Services"]
    A1 --> A4["Featured Courses"]
    A1 --> A5["Portfolio Showcase"]
    A1 --> A6["Testimonials"]
    
    B["/courses"] --> B1["Course List"]
    B1 --> B2["/courses/:slug - Course Detail"]
    B2 --> B3["Course Info"]
    B2 --> B4["Enrollment Form"]
    B2 --> B5["Lessons (Gated)"]
    
    C["/portfolio"] --> C1["Portfolio List"]
    C1 --> C2["/portfolio/:slug - Portfolio Detail"]
    C2 --> C3["Project Info"]
    C2 --> C4["Images/Files"]
    C2 --> C5["Technologies Used"]
    
    D["/blog"] --> D1["Blog List (Placeholder)"]
    E["/contact"] --> E1["Contact Form"]
    F["/career"] --> F1["Career Form"]
    G["/privacy"] --> G1["Privacy Policy"]
    H["/terms"] --> H1["Terms & Conditions"]
    
    I["/auth"] --> I1["Login/Register"]
    J["/dashboard"] --> J1["Student Dashboard"]
    J1 --> J2["Enrolled Courses"]
    J1 --> J3["Progress Tracking"]
    
    K["/admin"] --> K1["Admin Dashboard"]
    K --> K2["/admin/courses"]
    K --> K3["/admin/portfolio"]
    K --> K4["/admin/lessons"]
    K --> K5["/admin/resources"]
    K --> K6["/admin/submissions"]
    K --> K7["/admin/enrollment-forms"]
    K --> K8["/admin/users"]
    K --> K9["/admin/settings"]
    K --> K10["/admin/blog"]`;

  const navigationFlowDiagram = `graph TD
    A["Header/Navigation"] --> B["Logo → Homepage"]
    A --> C["Courses → /courses"]
    A --> D["Portfolio → /portfolio"]
    A --> E["Blog → /blog"]
    A --> F["Contact → /contact"]
    A --> G["Career → /career"]
    A --> H["Auth Button → /auth or /dashboard"]
    
    I["Homepage"] --> J["View Courses → /courses"]
    I --> K["View Portfolio → /portfolio"]
    I --> L["Course Cards → /courses/:slug"]
    I --> M["Portfolio Cards → /portfolio/:slug"]
    
    N["Course List"] --> O["Filter by Type/Difficulty"]
    N --> P["Course Card → /courses/:slug"]
    
    Q["Portfolio List"] --> R["Filter by Service/Tech"]
    Q --> S["Portfolio Card → /portfolio/:slug"]
    
    T["Course Detail"] --> U["Enroll Button → Enrollment Form"]
    T --> V["View Lessons (if enrolled)"]
    
    W["Admin Panel"] --> X["Sidebar Navigation"]
    X --> Y["Dashboard"]
    X --> Z["Content Management"]
    X --> AA["User Management"]
    X --> BB["Settings"]`;

  const userFlowDiagram = `graph TD
    A["Visitor"] --> B["Browse Homepage"]
    B --> C["View Courses/Portfolio"]
    C --> D{"Want to Enroll?"}
    D -->|Yes| E["Register/Login"]
    D -->|No| F["Continue Browsing"]
    
    E --> G["Student User"]
    G --> H["View Course Details"]
    H --> I["Submit Enrollment Form"]
    I --> J["Admin Reviews Submission"]
    J --> K{"Approved?"}
    K -->|Yes| L["Access Course Content"]
    K -->|No| M["Rejection Notice"]
    
    L --> N["Watch Lessons"]
    L --> O["Download Resources"]
    L --> P["Track Progress"]
    
    Q["Admin User"] --> R["Admin Dashboard"]
    R --> S["Manage Courses"]
    R --> T["Review Submissions"]
    R --> U["Manage Users"]
    R --> V["Update Site Settings"]
    R --> W["Manage Portfolio"]
    
    S --> X["Create/Edit Courses"]
    S --> Y["Add Lessons"]
    S --> Z["Upload Resources"]
    
    T --> AA["Approve/Reject Enrollments"]
    T --> BB["Add Admin Notes"]
    
    U --> CC["View User Profiles"]
    U --> DD["Update User Roles"]`;

  const databaseSchemaDiagram = `erDiagram
    profiles ||--o{ enrollments : "has"
    profiles ||--o{ enrollment_submissions : "submits"
    profiles ||--o{ lesson_progress : "tracks"
    profiles ||--o{ contact_messages : "sends"
    profiles ||--o{ career_applications : "submits"
    profiles ||--o{ dft_submissions : "submits"
    
    courses ||--o{ enrollments : "enrolled_in"
    courses ||--o{ enrollment_submissions : "for"
    courses ||--o{ lessons : "contains"
    courses ||--o{ resources : "has"
    courses ||--o{ enrollment_form_fields : "customizes"
    courses ||--o{ lesson_progress : "tracks"
    courses ||--o{ dft_submissions : "submits_to"
    
    lessons ||--o{ lesson_progress : "tracks"
    
    portfolio_projects ||--o{ portfolio_images : "contains"
    portfolio_projects ||--o{ portfolio_files : "contains"
    
    profiles {
        uuid id PK
        text full_name
        text phone
        text avatar_url
        user_role role
        timestamp created_at
    }
    
    courses {
        uuid id PK
        text title
        text description
        text slug
        course_type course_type
        course_status status
        boolean featured
        boolean upcoming
        date start_date
        numeric price_regular
        numeric price_offer
        jsonb roadmap
        jsonb why_join
        text[] topics
        text[] whats_included
        uuid created_by FK
    }
    
    lessons {
        uuid id PK
        uuid course_id FK
        text title
        text video_url
        integer order
        boolean is_preview
        integer duration_minutes
    }
    
    enrollments {
        uuid id PK
        uuid user_id FK
        uuid course_id FK
        text status
        text payment_status
        timestamp created_at
    }
    
    enrollment_submissions {
        uuid id PK
        uuid user_id FK
        uuid course_id FK
        jsonb form_data
        text status
        text payment_screenshot_url
        text admin_notes
        uuid reviewed_by FK
        timestamp reviewed_at
        timestamp submitted_at
    }
    
    lesson_progress {
        uuid id PK
        uuid user_id FK
        uuid course_id FK
        uuid lesson_id FK
        integer position_seconds
        boolean completed
        timestamp last_watched_at
    }
    
    portfolio_projects {
        uuid id PK
        text title
        text slug
        text summary
        text description_md
        text client_name
        text country
        text duration_text
        text budget_text
        text hero_image_url
        text[] services
        text[] technologies
        portfolio_status status
        boolean featured
        uuid created_by FK
    }`;

  const features = [
    { name: "Course Management", status: "Implemented", color: "bg-green-500" },
    { name: "User Authentication", status: "Implemented", color: "bg-green-500" },
    { name: "Portfolio System", status: "Implemented", color: "bg-green-500" },
    { name: "Admin Panel", status: "Implemented", color: "bg-green-500" },
    { name: "Enrollment System", status: "Implemented", color: "bg-green-500" },
    { name: "Progress Tracking", status: "Implemented", color: "bg-green-500" },
    { name: "Content Management", status: "Implemented", color: "bg-green-500" },
    { name: "Blog System", status: "Placeholder", color: "bg-yellow-500" },
    { name: "Certificate System", status: "Planned", color: "bg-blue-500" },
    { name: "Batch Management", status: "Planned", color: "bg-blue-500" },
  ];

  const tables = [
    { name: "profiles", purpose: "User accounts and roles", records: "User data", rls: "Role-based access" },
    { name: "courses", purpose: "Course catalog", records: "Course information", rls: "Public published, admin all" },
    { name: "lessons", purpose: "Course content", records: "Video lessons", rls: "Enrolled users only" },
    { name: "enrollments", purpose: "Course registrations", records: "User-course relationships", rls: "Own data + admin" },
    { name: "enrollment_submissions", purpose: "Enrollment applications", records: "Form submissions", rls: "Own submissions + admin" },
    { name: "lesson_progress", purpose: "Learning progress", records: "Video progress tracking", rls: "Own progress + admin view" },
    { name: "portfolio_projects", purpose: "Portfolio showcase", records: "Project information", rls: "Public published, admin all" },
    { name: "portfolio_images", purpose: "Project visuals", records: "Project images", rls: "Public for published projects" },
    { name: "portfolio_files", purpose: "Project downloads", records: "Project files", rls: "Private access only" },
    { name: "resources", purpose: "Course materials", records: "Downloadable resources", rls: "Enrolled users only" },
    { name: "contact_messages", purpose: "Contact inquiries", records: "Contact form submissions", rls: "Admin read only" },
    { name: "career_applications", purpose: "Job applications", records: "Career form submissions", rls: "Admin read only" },
    { name: "enrollment_form_fields", purpose: "Dynamic forms", records: "Custom form configurations", rls: "Public read, admin manage" },
    { name: "dft_submissions", purpose: "Assignment submissions", records: "Student work submissions", rls: "Own submissions + admin" },
    { name: "site_settings", purpose: "Site configuration", records: "Homepage content", rls: "Public read, admin manage" },
    { name: "testimonials", purpose: "Social proof", records: "Customer testimonials", rls: "Public read, admin manage" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground">
            Complete documentation of the current system architecture
          </p>
        </div>
      </div>

      <Tabs defaultValue="sitemap" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sitemap">Site Map</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="userflow">User Flows</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="sitemap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Structure</CardTitle>
              <CardDescription>
                Complete page hierarchy and routing structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MermaidDiagram>{siteMapDiagram}</MermaidDiagram>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Flow</CardTitle>
              <CardDescription>
                How users navigate between different sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MermaidDiagram>{navigationFlowDiagram}</MermaidDiagram>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="userflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Flows</CardTitle>
              <CardDescription>
                Role-based user experiences and workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MermaidDiagram>{userFlowDiagram}</MermaidDiagram>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Schema</CardTitle>
              <CardDescription>
                Supabase tables, relationships, and data structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MermaidDiagram>{databaseSchemaDiagram}</MermaidDiagram>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Table Details</CardTitle>
              <CardDescription>
                Purpose and access control for each database table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {tables.map((table) => (
                    <div key={table.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-mono text-sm font-semibold">{table.name}</div>
                        <div className="text-sm text-muted-foreground">{table.purpose}</div>
                        <div className="text-xs text-muted-foreground">RLS: {table.rls}</div>
                      </div>
                      <Badge variant="outline">{table.records}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feature Status</CardTitle>
                <CardDescription>
                  Current implementation status of major features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features.map((feature) => (
                    <div key={feature.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{feature.name}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-white ${feature.color}`}
                      >
                        {feature.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
                <CardDescription>
                  Core technologies and integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Frontend</span>
                    <Badge variant="outline">React + Vite</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Styling</span>
                    <Badge variant="outline">Tailwind CSS</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">UI Components</span>
                    <Badge variant="outline">shadcn/ui</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backend</span>
                    <Badge variant="outline">Supabase</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database</span>
                    <Badge variant="outline">PostgreSQL</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Authentication</span>
                    <Badge variant="outline">Supabase Auth</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage</span>
                    <Badge variant="outline">Supabase Storage</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">State Management</span>
                    <Badge variant="outline">React Query</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>
                Important observations about the current system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">✅ Well-Implemented Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Robust user authentication and role-based access control</li>
                    <li>• Comprehensive course management with dynamic enrollment forms</li>
                    <li>• Progress tracking with video position saving</li>
                    <li>• Professional portfolio showcase system</li>
                    <li>• Complete admin panel for content management</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">⚠️ Areas for Enhancement</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Blog system is currently placeholder (needs implementation)</li>
                    <li>• No explicit foreign key relationships in database</li>
                    <li>• Certificate system planned but not implemented</li>
                    <li>• Batch management for live courses in planning phase</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">🎯 Next Development Priorities</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Implement batch management for live courses</li>
                    <li>• Build certificate generation and verification system</li>
                    <li>• Complete blog functionality</li>
                    <li>• Add foreign key constraints for data integrity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}