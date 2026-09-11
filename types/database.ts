export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ListingCondition = 'New' | 'Like New' | 'Good' | 'Used' | 'Damaged';
export type ListingStatus = 'approved' | 'pending' | 'rejected' | 'sold' | 'expired';
export type ReportStatus = 'pending' | 'resolved_removed' | 'resolved_dismissed';
export type ApprovalMode = 'auto' | 'manual' | 'ai';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          branch: string | null;
          year: string | null;
          whatsapp_number: string | null;
          is_admin: boolean;
          is_banned: boolean;
          promoted_by: string | null;
          promoted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          branch?: string | null;
          year?: string | null;
          whatsapp_number?: string | null;
          is_admin?: boolean;
          is_banned?: boolean;
          promoted_by?: string | null;
          promoted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          branch?: string | null;
          year?: string | null;
          whatsapp_number?: string | null;
          is_admin?: boolean;
          is_banned?: boolean;
          promoted_by?: string | null;
          promoted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedSchema: "auth";
          },
          {
            foreignKeyName: "profiles_promoted_by_fkey";
            columns: ["promoted_by"];
            referencedRelation: "profiles";
            referencedSchema: "public";
          }
        ];
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          slug: string;
          seller_id: string;
          title: string;
          description: string;
          price: number;
          negotiable: boolean;
          category_id: number;
          condition: ListingCondition;
          images: string[];
          status: ListingStatus;
          rejection_reason: string | null;
          views: number;
          created_at: string;
          updated_at: string;
          sold_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          seller_id: string;
          title: string;
          description: string;
          price: number;
          negotiable?: boolean;
          category_id: number;
          condition: ListingCondition;
          images: string[];
          status?: ListingStatus;
          rejection_reason?: string | null;
          views?: number;
          created_at?: string;
          updated_at?: string;
          sold_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          seller_id?: string;
          title?: string;
          description?: string;
          price?: number;
          negotiable?: boolean;
          category_id?: number;
          condition?: ListingCondition;
          images?: string[];
          status?: ListingStatus;
          rejection_reason?: string | null;
          views?: number;
          created_at?: string;
          updated_at?: string;
          sold_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedSchema: "public";
          },
          {
            foreignKeyName: "listings_seller_id_fkey";
            columns: ["seller_id"];
            referencedRelation: "profiles";
            referencedSchema: "public";
          }
        ];
      };
      reports: {
        Row: {
          id: string;
          listing_id: string;
          reporter_id: string;
          reason: string;
          status: ReportStatus;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          reporter_id: string;
          reason: string;
          status?: ReportStatus;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          reporter_id?: string;
          reason?: string;
          status?: ReportStatus;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedSchema: "public";
          },
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            referencedRelation: "profiles";
            referencedSchema: "public";
          },
          {
            foreignKeyName: "reports_resolved_by_fkey";
            columns: ["resolved_by"];
            referencedRelation: "profiles";
            referencedSchema: "public";
          }
        ];
      };
      contact_reveals: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contact_reveals_listing_id_fkey";
            columns: ["listing_id"];
            referencedRelation: "listings";
            referencedSchema: "public";
          },
          {
            foreignKeyName: "contact_reveals_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedSchema: "public";
          }
        ];
      };
      admin_settings: {
        Row: {
          id: number;
          approval_mode: ApprovalMode;
        };
        Insert: {
          id?: number;
          approval_mode?: ApprovalMode;
        };
        Update: {
          id?: number;
          approval_mode?: ApprovalMode;
        };
        Relationships: [];
      };
    };
    Views: {
      public_profiles: {
        Row: {
          id: string;
          full_name: string;
          branch: string | null;
          year: string | null;
          is_admin: boolean;
          is_banned: boolean;
          promoted_by: string | null;
          promoted_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      increment_listing_views: {
        Args: {
          listing_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      listing_condition: ListingCondition;
      listing_status: ListingStatus;
      report_status: ReportStatus;
    };
  };
}
