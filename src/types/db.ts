export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          settings: Json;
          plan: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          settings?: Json;
          plan?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          settings?: Json;
          plan?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      domains: {
        Row: {
          id: string;
          tenant_id: string;
          hostname: string;
          is_primary: boolean;
          verified: boolean;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          hostname: string;
          is_primary?: boolean;
          verified?: boolean;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          hostname?: string;
          is_primary?: boolean;
          verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "domains_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_members: {
        Row: {
          tenant_id: string;
          user_id: string;
          role: "owner" | "editor" | "author";
        };
        Insert: {
          tenant_id: string;
          user_id: string;
          role?: "owner" | "editor" | "author";
        };
        Update: {
          tenant_id?: string;
          user_id?: string;
          role?: "owner" | "editor" | "author";
        };
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          sort_order: number;
          meta_title: string | null;
          meta_description: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          sort_order?: number;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "categories_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      authors: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          logo_url: string | null;
          bio: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          logo_url?: string | null;
          bio?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          logo_url?: string | null;
          bio?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "authors_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      sources: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          logo_url: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          logo_url?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          logo_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sources_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      articles: {
        Row: {
          id: string;
          tenant_id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content_html: string | null;
          cover_url: string | null;
          cover_alt: string | null;
          category_id: string | null;
          author_id: string | null;
          source_id: string | null;
          type: "news" | "guide";
          status: "draft" | "review" | "published";
          published_at: string | null;
          meta_title: string | null;
          meta_description: string | null;
          canonical_url: string | null;
          view_count: number;
          is_breaking: boolean;
          is_manset: boolean;
          evergreen: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          slug: string;
          title: string;
          excerpt?: string | null;
          content_html?: string | null;
          cover_url?: string | null;
          cover_alt?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          source_id?: string | null;
          type?: "news" | "guide";
          status?: "draft" | "review" | "published";
          published_at?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          canonical_url?: string | null;
          view_count?: number;
          is_breaking?: boolean;
          is_manset?: boolean;
          evergreen?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          slug?: string;
          title?: string;
          excerpt?: string | null;
          content_html?: string | null;
          cover_url?: string | null;
          cover_alt?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          source_id?: string | null;
          type?: "news" | "guide";
          status?: "draft" | "review" | "published";
          published_at?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          canonical_url?: string | null;
          view_count?: number;
          is_breaking?: boolean;
          is_manset?: boolean;
          evergreen?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "articles_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "authors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      hesap_parametreleri: {
        Row: {
          id: string;
          anahtar: string;
          etiket: string;
          deger: Json;
          birim: string | null;
          grup: string;
          aciklama: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          anahtar: string;
          etiket: string;
          deger: Json;
          birim?: string | null;
          grup: string;
          aciklama?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          anahtar?: string;
          etiket?: string;
          deger?: Json;
          birim?: string | null;
          grup?: string;
          aciklama?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      site_kunye: {
        Row: {
          id: number;
          veri: Json;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          veri: Json;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          veri?: Json;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      yasal_sayfalar: {
        Row: {
          slug: string;
          baslik: string;
          icerik_md: string;
          guncelleme_tarihi: string;
          yayinda: boolean;
        };
        Insert: {
          slug: string;
          baslik: string;
          icerik_md: string;
          guncelleme_tarihi?: string;
          yayinda?: boolean;
        };
        Update: {
          slug?: string;
          baslik?: string;
          icerik_md?: string;
          guncelleme_tarihi?: string;
          yayinda?: boolean;
        };
        Relationships: [];
      };
      redirects: {
        Row: {
          id: string;
          tenant_id: string;
          from_path: string;
          to_path: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          from_path: string;
          to_path: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          from_path?: string;
          to_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "redirects_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_tenant_member: {
        Args: { tenant_id: string };
        Returns: boolean;
      };
      is_tenant_publisher: {
        Args: { tenant_id: string };
        Returns: boolean;
      };
      is_tenant_owner: {
        Args: { tenant_id: string };
        Returns: boolean;
      };
      increment_article_view: {
        Args: { p_tenant_id: string; p_slug: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
