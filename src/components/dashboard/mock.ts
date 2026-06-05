export type SourceType = "link" | "note" | "pdf" | "ppt" | "doc";
export type SourceStatus = "pending" | "processing" | "indexed" | "failed";

export interface MockCollection {
  id: string;
  name: string;
  itemCount: number;
  isFavorite?: boolean;
}

export interface MockSource {
  id: string;
  user_id: string;
  collection_id: string;
  type: SourceType;
  status: SourceStatus;
  title: string;
  original_url?: string;
  image_url?: string;
  preview_image_url?: string;
  created_at: string;
}

export const mockCollections: MockCollection[] = [
  { id: "col-1", name: "Research", itemCount: 9, isFavorite: true },
  { id: "col-2", name: "Reading list", itemCount: 9, isFavorite: true },
  { id: "col-3", name: "Work", itemCount: 9 },
];

export const mockSources: MockSource[] = [
  {
    id: "src-001",
    user_id: "usr-001",
    collection_id: "col-1",
    type: "link",
    status: "indexed",
    title: "How transformers work",
    original_url: "https://example.com/transformers",
    preview_image_url: "https://picsum.photos/seed/src-001/960/540",
    created_at: "2026-05-31T12:01:00Z",
  },
  {
    id: "src-002",
    user_id: "usr-001",
    collection_id: "col-1",
    type: "note",
    status: "indexed",
    title: "Product sync notes",
    created_at: "2026-05-31T11:45:00Z",
  },
  {
    id: "src-003",
    user_id: "usr-001",
    collection_id: "col-2",
    type: "link",
    status: "processing",
    title: "",
    original_url: "https://example.com/article",
    preview_image_url: "https://picsum.photos/seed/src-003/960/540",
    created_at: "2026-05-31T11:10:00Z",
  },
  {
    id: "src-004",
    user_id: "usr-001",
    collection_id: "col-2",
    type: "pdf",
    status: "indexed",
    title: "Q1 Report",
    created_at: "2026-05-31T10:42:00Z",
  },
  {
    id: "src-005",
    user_id: "usr-001",
    collection_id: "col-3",
    type: "link",
    status: "pending",
    title: "",
    original_url: "https://example.com/draft",
    preview_image_url: "https://picsum.photos/seed/src-005/960/540",
    created_at: "2026-05-31T10:01:00Z",
  },
  {
    id: "src-006",
    user_id: "usr-001",
    collection_id: "col-1",
    type: "note",
    status: "indexed",
    title: "Architecture review highlights",
    created_at: "2026-05-31T09:32:00Z",
  },
  {
    id: "src-007",
    user_id: "usr-001",
    collection_id: "col-2",
    type: "doc",
    status: "indexed",
    title: "Vendor agreement draft",
    created_at: "2026-05-31T08:59:00Z",
  },
  {
    id: "src-008",
    user_id: "usr-001",
    collection_id: "col-3",
    type: "ppt",
    status: "processing",
    title: "Launch deck v2",
    created_at: "2026-05-31T08:20:00Z",
  },
  {
    id: "src-009",
    user_id: "usr-001",
    collection_id: "col-1",
    type: "link",
    status: "failed",
    title: "",
    original_url: "https://invalid-site.invalid/post",
    preview_image_url: "https://picsum.photos/seed/src-009/960/540",
    created_at: "2026-05-31T07:45:00Z",
  },
  {
    id: "src-010",
    user_id: "usr-001",
    collection_id: "col-1",
    type: "pdf",
    status: "indexed",
    title: "State of AI 2026",
    created_at: "2026-05-31T07:03:00Z",
  },
  {
    id: "src-011",
    user_id: "usr-001",
    collection_id: "col-2",
    type: "link",
    status: "indexed",
    title: "Deep dive on retrieval systems",
    original_url: "https://example.org/retrieval-systems",
    preview_image_url: "https://picsum.photos/seed/src-011/960/540",
    created_at: "2026-05-31T06:30:00Z",
  },
  {
    id: "src-012",
    user_id: "usr-001",
    collection_id: "col-3",
    type: "note",
    status: "pending",
    title: "Friday retro prep",
    created_at: "2026-05-31T06:00:00Z",
  },
  {
    id: "src-013",
    user_id: "usr-001",
    collection_id: "col-3",
    type: "link",
    status: "indexed",
    title: "",
    original_url: "https://news.ycombinator.com/item?id=123",
    preview_image_url: "https://picsum.photos/seed/src-013/960/540",
    created_at: "2026-05-30T21:40:00Z",
  },
  {
    id: "src-014",
    user_id: "usr-001",
    collection_id: "col-2",
    type: "doc",
    status: "processing",
    title: "Interview loop notes",
    created_at: "2026-05-30T20:11:00Z",
  },
  {
    id: "src-015",
    user_id: "usr-001",
    collection_id: "col-1",
    type: "ppt",
    status: "indexed",
    title: "Quarterly roadmap",
    created_at: "2026-05-30T18:39:00Z",
  },
  {
    id: "src-016",
    user_id: "usr-001",
    collection_id: "col-1",
    type: "note",
    status: "indexed",
    title: "Cursor prompts that worked",
    created_at: "2026-05-30T17:20:00Z",
  },
  {
    id: "src-017",
    user_id: "usr-001",
    collection_id: "col-2",
    type: "pdf",
    status: "failed",
    title: "Budget worksheet",
    created_at: "2026-05-30T16:08:00Z",
  },
  {
    id: "src-018",
    user_id: "usr-001",
    collection_id: "col-3",
    type: "link",
    status: "indexed",
    title: "Design systems guide",
    original_url: "https://example.dev/design-systems",
    preview_image_url: "https://picsum.photos/seed/src-018/960/540",
    created_at: "2026-05-30T15:14:00Z",
  },
  {
    id: "src-019",
    user_id: "usr-001",
    collection_id: "col-2",
    type: "note",
    status: "indexed",
    title: "Books to read this month",
    created_at: "2026-05-30T13:46:00Z",
  },
  {
    id: "src-020",
    user_id: "usr-001",
    collection_id: "col-1",
    type: "doc",
    status: "pending",
    title: "Partnership memo",
    created_at: "2026-05-30T11:03:00Z",
  },
  {
    id: "src-021",
    user_id: "usr-001",
    collection_id: "col-3",
    type: "pdf",
    status: "indexed",
    title: "Reading notes archive",
    created_at: "2026-05-30T10:02:00Z",
  },
  {
    id: "src-022",
    user_id: "usr-001",
    collection_id: "col-2",
    type: "link",
    status: "processing",
    title: "",
    original_url: "https://openai.com/research",
    preview_image_url: "https://picsum.photos/seed/src-022/960/540",
    created_at: "2026-05-30T08:58:00Z",
  },
  {
    id: "src-023",
    user_id: "usr-001",
    collection_id: "col-1",
    type: "ppt",
    status: "indexed",
    title: "Demo day slides",
    created_at: "2026-05-30T08:12:00Z",
  },
  {
    id: "src-024",
    user_id: "usr-001",
    collection_id: "col-3",
    type: "doc",
    status: "indexed",
    title: "Weekly planning doc",
    created_at: "2026-05-30T07:05:00Z",
  },
  {
    id: "src-025",
    user_id: "usr-001",
    collection_id: "col-1",
    type: "link",
    status: "indexed",
    title: "",
    original_url: "https://tailwindcss.com/docs",
    preview_image_url: "https://picsum.photos/seed/src-025/960/540",
    created_at: "2026-05-29T22:14:00Z",
  },
  {
    id: "src-026",
    user_id: "usr-001",
    collection_id: "col-2",
    type: "note",
    status: "failed",
    title: "Corrupted imported note",
    created_at: "2026-05-29T20:27:00Z",
  },
  {
    id: "src-027",
    user_id: "usr-001",
    collection_id: "col-3",
    type: "pdf",
    status: "processing",
    title: "ML ops checklist",
    created_at: "2026-05-29T18:02:00Z",
  },
];

export function getMockCollectionName(collectionID: string): string {
  return (
    mockCollections.find((collection) => collection.id === collectionID)?.name ??
    "Collection"
  );
}
