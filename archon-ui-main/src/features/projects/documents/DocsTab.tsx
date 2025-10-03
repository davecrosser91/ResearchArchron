import { FileText, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Input } from "../../ui/primitives";
import { cn } from "../../ui/primitives/styles";
import { DocumentCard } from "./components/DocumentCard";
import { DocumentViewer } from "./components/DocumentViewer";
import { NewDocumentModal } from "./components/NewDocumentModal";
import { useProjectDocuments } from "./hooks";
import type { ProjectDocument } from "./types";

interface DocsTabProps {
  project?: {
    id: string;
    title: string;
    created_at?: string;
    updated_at?: string;
  } | null;
}

/**
 * Read-only documents tab
 * Displays existing documents from the project's JSONB field
 */
export const DocsTab = ({ project }: DocsTabProps) => {
  const projectId = project?.id || "";

  // Fetch documents from project's docs field
  const { data: documents = [], isLoading } = useProjectDocuments(projectId);

  // Document state
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);

  // Auto-select first document when documents load
  useEffect(() => {
    if (documents.length > 0 && !selectedDocument) {
      setSelectedDocument(documents[0]);
    }
  }, [documents, selectedDocument]);

  // Update selected document if it was updated
  useEffect(() => {
    if (selectedDocument && documents.length > 0) {
      const updated = documents.find((d) => d.id === selectedDocument.id);
      if (updated && updated !== selectedDocument) {
        setSelectedDocument(updated);
      }
    }
  }, [documents, selectedDocument]);

  // Filter documents based on search
  const filteredDocuments = documents.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Document List */}
        <div
          className={cn(
            "w-80 flex flex-col flex-shrink-0",
            "border-r border-border",
            "bg-background",
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <FileText className="w-4 h-4" />
                Documents
              </h2>
              <Button onClick={() => setIsNewDocModalOpen(true)} size="sm" variant="cyan">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Info message */}
            <p className="text-xs text-muted-foreground mt-3">
              {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Document List - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">{searchQuery ? "No documents found" : "No documents in this project"}</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isActive={selectedDocument?.id === doc.id}
                  onSelect={setSelectedDocument}
                  onDelete={() => {}}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Content - Document Viewer */}
        <div className="flex-1 bg-background">
          {selectedDocument ? (
            <DocumentViewer document={selectedDocument} projectId={projectId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">
                  {documents.length > 0 ? "Select a document to view" : "No documents available"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Document Modal */}
      <NewDocumentModal projectId={projectId} open={isNewDocModalOpen} onOpenChange={setIsNewDocModalOpen} />
    </div>
  );
};
