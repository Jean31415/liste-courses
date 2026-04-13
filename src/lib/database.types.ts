export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      aisles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          store_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          store_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aisles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string | null
          id: string
          name: string
          token: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          token?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          token?: string
        }
        Relationships: []
      }
      list_items: {
        Row: {
          aisle_id: string | null
          barcode: string
          checked: boolean | null
          checked_at: string | null
          created_at: string | null
          family_id: string
          id: string
          module: string | null
          qty: number | null
          store_id: string | null
        }
        Insert: {
          aisle_id?: string | null
          barcode: string
          checked?: boolean | null
          checked_at?: string | null
          created_at?: string | null
          family_id: string
          id?: string
          module?: string | null
          qty?: number | null
          store_id?: string | null
        }
        Update: {
          aisle_id?: string | null
          barcode?: string
          checked?: boolean | null
          checked_at?: string | null
          created_at?: string | null
          family_id?: string
          id?: string
          module?: string | null
          qty?: number | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_items_aisle_id_fkey"
            columns: ["aisle_id"]
            isOneToOne: false
            referencedRelation: "aisles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_barcode_fkey"
            columns: ["barcode"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["barcode"]
          },
          {
            foreignKeyName: "list_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string
          brand: string | null
          category: string | null
          created_at: string | null
          image_url: string | null
          name: string | null
          nova_group: number | null
          nutriscore: string | null
          origin: string | null
          quantity: string | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          barcode: string
          brand?: string | null
          category?: string | null
          created_at?: string | null
          image_url?: string | null
          name?: string | null
          nova_group?: number | null
          nutriscore?: string | null
          origin?: string | null
          quantity?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string
          brand?: string | null
          category?: string | null
          created_at?: string | null
          image_url?: string | null
          name?: string | null
          nova_group?: number | null
          nutriscore?: string | null
          origin?: string | null
          quantity?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          created_at: string | null
          family_id: string
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          family_id: string
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          family_id?: string
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_family: {
        Args: { p_name: string }
        Returns: {
          id: string
          token: string
        }[]
      }
      get_family_id: { Args: never; Returns: string }
      upsert_list_item: {
        Args: { p_barcode: string; p_family_id: string; p_module?: string }
        Returns: {
          aisle_id: string | null
          barcode: string
          checked: boolean | null
          checked_at: string | null
          created_at: string | null
          family_id: string
          id: string
          module: string | null
          qty: number | null
          store_id: string | null
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenient type aliases
export type Family = Database['public']['Tables']['families']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ListItem = Database['public']['Tables']['list_items']['Row']
export type Store = Database['public']['Tables']['stores']['Row']
export type Aisle = Database['public']['Tables']['aisles']['Row']

// List item with joined product data
export type ListItemWithProduct = ListItem & {
  products: Pick<Product, 'name' | 'brand' | 'quantity' | 'image_url' | 'category'> | null
}