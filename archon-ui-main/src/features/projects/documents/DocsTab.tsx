import { FileText, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../../ui/primitives";
import { cn } from "../../ui/primitives/styles";
import { DocumentCard } from "./components/DocumentCard";
import { DocumentViewer } from "./components/DocumentViewer";
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
            "border-r border-gray-300/50 dark:border-gray-700/70",
            "bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950",
          )}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-300/50 dark:border-gray-700/70 flex-shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2.5 text-gray-900 dark:text-white">
              <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-cyan-500" />
              </div>
              Documents
            </h2>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
            </div>

            {/* Info message */}
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-3">
              {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Document List - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit mx-auto mb-4">
                  <FileText className="w-12 h-12 opacity-40" />
                </div>
                <p className="text-sm font-medium">{searchQuery ? "No documents found" : "No documents in this project"}</p>
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
        <div className="flex-1 bg-white dark:bg-gray-900">
          {selectedDocument ? (
            <DocumentViewer document={selectedDocument} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {documents.length > 0 ? "Select a document to view" : "No documents available"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
