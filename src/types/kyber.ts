export type SourceType = "link" | "note" | "pdf" | "ppt" | "doc";
export type SourceStatus = "pending" | "processing" | "indexed" | "failed";

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  is_favorite: boolean;
  item_count: number;
  created_at: string;
  deleted_at?: string | null;
}

export interface Source {
  id: string;
  user_id: string;
  collection_id: string;
  type: SourceType;
  status: SourceStatus;
  title: string;
  original_url?: string;
  image_url?: string;
  created_at: string;
}
