/**
 * Document Type Definitions
 *
 * Core types for document management within projects.
 */

// Document content can be structured in various ways
export type DocumentContent =
  | string // Plain text or markdown
  | { markdown: string } // Markdown content
  | { text: string } // Text content
  | {
      markdown?: string;
      text?: string;
      [key: string]: unknown; // Allow other fields but with known type
    } // Mixed content
  | Record<string, unknown>; // Generic object content

export interface ProjectDocument {
  id: string;
  project_id: string;
  title: string;
  content?: DocumentContent;
  document_type?: DocumentType | string;
  tags?: string[];
  updated_at: string;
  created_at?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: DocumentContent;
  tags?: string[];
  author?: string;
}

export interface CreateDocumentRequest {
  document_type: string;
  title: string;
  content?: DocumentContent;
  tags?: string[];
  author?: string;
}

export type DocumentType =
  | "prp"
  | "technical"
  | "business"
  | "meeting_notes"
  | "spec"
  | "design"
  | "note"
  | "api"
  | "guide";

export interface DocumentCardProps {
  document: ProjectDocument;
  isActive: boolean;
  onSelect: (doc: ProjectDocument) => void;
  onDelete: (doc: ProjectDocument) => void;
}
