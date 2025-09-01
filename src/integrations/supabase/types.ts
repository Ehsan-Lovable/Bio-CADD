export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      career_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          email: string
          experience: string | null
          id: string
          name: string
          phone: string | null
          position: string
          resume_url: string | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          email: string
          experience?: string | null
          id?: string
          name: string
          phone?: string | null
          position: string
          resume_url?: string | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          id?: string
          name?: string
          phone?: string | null
          position?: string
          resume_url?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          audience: string | null
          certificate: boolean | null
          course_type: Database["public"]["Enums"]["course_type"]
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          duration_text: string | null
          id: string
          language: string | null
          module_count: number | null
          poster_url: string | null
          price_offer: number | null
          price_regular: number | null
          roadmap: Json | null
          seats_text: string | null
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["course_status"]
          time_24h: string | null
          title: string
          topics: string[] | null
          updated_at: string | null
          whats_included: string[] | null
          why_join: Json | null
        }
        Insert: {
          audience?: string | null
          certificate?: boolean | null
          course_type: Database["public"]["Enums"]["course_type"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_text?: string | null
          id?: string
          language?: string | null
          module_count?: number | null
          poster_url?: string | null
          price_offer?: number | null
          price_regular?: number | null
          roadmap?: Json | null
          seats_text?: string | null
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          time_24h?: string | null
          title: string
          topics?: string[] | null
          updated_at?: string | null
          whats_included?: string[] | null
          why_join?: Json | null
        }
        Update: {
          audience?: string | null
          certificate?: boolean | null
          course_type?: Database["public"]["Enums"]["course_type"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_text?: string | null
          id?: string
          language?: string | null
          module_count?: number | null
          poster_url?: string | null
          price_offer?: number | null
          price_regular?: number | null
          roadmap?: Json | null
          seats_text?: string | null
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["course_status"]
          time_24h?: string | null
          title?: string
          topics?: string[] | null
          updated_at?: string | null
          whats_included?: string[] | null
          why_join?: Json | null
        }
        Relationships: []
      }
      dft_submissions: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          link: string | null
          notes: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          notes?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          notes?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dft_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          payment_status: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          payment_status?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          payment_status?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean
          course_id: string
          created_at: string
          id: string
          last_watched_at: string
          lesson_id: string
          position_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          course_id: string
          created_at?: string
          id?: string
          last_watched_at?: string
          lesson_id: string
          position_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          course_id?: string
          created_at?: string
          id?: string
          last_watched_at?: string
          lesson_id?: string
          position_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          course_id: string
          duration_minutes: number | null
          id: string
          is_preview: boolean | null
          order: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          order?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          order?: number | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_files: {
        Row: {
          filename: string | null
          id: string
          order: number | null
          project_id: string
          size_bytes: number | null
          url: string
        }
        Insert: {
          filename?: string | null
          id?: string
          order?: number | null
          project_id: string
          size_bytes?: number | null
          url: string
        }
        Update: {
          filename?: string | null
          id?: string
          order?: number | null
          project_id?: string
          size_bytes?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_images: {
        Row: {
          alt: string | null
          id: string
          is_cover: boolean | null
          order: number | null
          project_id: string
          url: string
        }
        Insert: {
          alt?: string | null
          id?: string
          is_cover?: boolean | null
          order?: number | null
          project_id: string
          url: string
        }
        Update: {
          alt?: string | null
          id?: string
          is_cover?: boolean | null
          order?: number | null
          project_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          budget_text: string | null
          client_name: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description_md: string | null
          duration_text: string | null
          featured: boolean | null
          hero_image_url: string | null
          id: string
          services: string[] | null
          slug: string
          status: Database["public"]["Enums"]["portfolio_status"]
          summary: string | null
          technologies: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget_text?: string | null
          client_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description_md?: string | null
          duration_text?: string | null
          featured?: boolean | null
          hero_image_url?: string | null
          id?: string
          services?: string[] | null
          slug: string
          status?: Database["public"]["Enums"]["portfolio_status"]
          summary?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget_text?: string | null
          client_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description_md?: string | null
          duration_text?: string | null
          featured?: boolean | null
          hero_image_url?: string | null
          id?: string
          services?: string[] | null
          slug?: string
          status?: Database["public"]["Enums"]["portfolio_status"]
          summary?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      resources: {
        Row: {
          course_id: string | null
          id: string
          order: number | null
          resource_type: string | null
          title: string
          url: string
        }
        Insert: {
          course_id?: string | null
          id?: string
          order?: number | null
          resource_type?: string | null
          title: string
          url: string
        }
        Update: {
          course_id?: string | null
          id?: string
          order?: number | null
          resource_type?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          hero_cta_label: string | null
          hero_headline: string | null
          hero_subtitle: string | null
          id: number
          metrics: Json | null
          partners: Json | null
          updated_at: string | null
        }
        Insert: {
          hero_cta_label?: string | null
          hero_headline?: string | null
          hero_subtitle?: string | null
          id?: number
          metrics?: Json | null
          partners?: Json | null
          updated_at?: string | null
        }
        Update: {
          hero_cta_label?: string | null
          hero_headline?: string | null
          hero_subtitle?: string | null
          id?: number
          metrics?: Json | null
          partners?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string | null
          author_role: string | null
          avatar_url: string | null
          content: string
          id: string
          order: number | null
          rating: number | null
        }
        Insert: {
          author_name?: string | null
          author_role?: string | null
          avatar_url?: string | null
          content: string
          id?: string
          order?: number | null
          rating?: number | null
        }
        Update: {
          author_name?: string | null
          author_role?: string | null
          avatar_url?: string | null
          content?: string
          id?: string
          order?: number | null
          rating?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      course_status: "draft" | "published" | "archived"
      course_type: "live" | "recorded" | "workshop"
      portfolio_status: "draft" | "published" | "archived"
      user_role: "student" | "instructor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      course_status: ["draft", "published", "archived"],
      course_type: ["live", "recorded", "workshop"],
      portfolio_status: ["draft", "published", "archived"],
      user_role: ["student", "instructor", "admin"],
    },
  },
} as const
