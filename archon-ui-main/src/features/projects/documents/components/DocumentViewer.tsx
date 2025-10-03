import { Edit2, FileText, Save, X } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button, TextArea } from "../../../ui/primitives";
import { cn } from "../../../ui/primitives/styles";
import { useUpdateDocument } from "../hooks";
import type { ProjectDocument } from "../types";

interface DocumentViewerProps {
  document: ProjectDocument;
  projectId: string;
}

/**
 * Document viewer with edit capability
 * Displays document content and allows editing
 */
export const DocumentViewer = ({ document, projectId }: DocumentViewerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const updateDocumentMutation = useUpdateDocument();

  const handleEditClick = () => {
    // Extract current content as string for editing
    let contentStr = "";
    if (!document.content) {
      contentStr = "";
    } else if (typeof document.content === "string") {
      contentStr = document.content;
    } else if (typeof document.content === "object") {
      // Check for markdown field
      if ("markdown" in document.content && typeof document.content.markdown === "string") {
        contentStr = document.content.markdown;
      }
      // Check for text field
      else if ("text" in document.content && typeof document.content.text === "string") {
        contentStr = document.content.text;
      }
      // Fallback to JSON stringify
      else {
        contentStr = JSON.stringify(document.content, null, 2);
      }
    }
    setEditedContent(contentStr);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // Determine the content structure and update accordingly
    let updatedContent: any;
    if (typeof document.content === "string") {
      updatedContent = editedContent;
    } else if ("markdown" in document.content) {
      updatedContent = { ...document.content, markdown: editedContent };
    } else if ("text" in document.content) {
      updatedContent = { ...document.content, text: editedContent };
    } else {
      updatedContent = { text: editedContent };
    }

    updateDocumentMutation.mutate(
      {
        projectId: projectId,
        docId: document.id,
        updates: { content: updatedContent },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedContent("");
  };
  // Extract content for display
  const renderContent = () => {
    if (!document.content) {
      return <p className="text-gray-500 italic">No content available</p>;
    }

    // Debug: log the content structure
    console.log("Document content:", document.content);
    console.log("Content type:", typeof document.content);

    // Extract markdown content from various formats
    let markdownText = "";

    if (typeof document.content === "string") {
      markdownText = document.content;
    } else if (typeof document.content === "object" && document.content !== null) {
      if ("markdown" in document.content && typeof document.content.markdown === "string") {
        markdownText = document.content.markdown;
      } else if ("text" in document.content && typeof document.content.text === "string") {
        markdownText = document.content.text;
      }
    }

    console.log("Extracted markdown text:", markdownText);

    if (markdownText) {
      return (
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-cyan-500 dark:text-cyan-400 mb-4" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-cyan-500 dark:text-cyan-400 mb-3" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 mb-2" {...props} />,
              p: ({ node, ...props }) => <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-4" {...props} />,
              code: ({ node, inline, ...props }) => (
                inline ?
                  <code className="text-cyan-600 dark:text-cyan-400 bg-gray-100 dark:bg-gray-800 px-1 rounded" {...props} /> :
                  <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded" {...props} />
              ),
            }}
          >
            {markdownText}
          </ReactMarkdown>
        </article>
      );
    }

    // Handle structured content (JSON)
    return (
      <div className="space-y-4">
        {Object.entries(document.content).map(([key, value]) => (
          <div key={key} className="border-l-2 border-gray-300 dark:border-gray-700 pl-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {key.replace(/_/g, " ").charAt(0).toUpperCase() + key.replace(/_/g, " ").slice(1)}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {typeof value === "string" ? (
                <p>{value}</p>
              ) : Array.isArray(value) ? (
                <ul className="list-disc pl-5">
                  {value.map((item, i) => (
                    <li key={`${key}-${typeof item === "object" ? JSON.stringify(item) : String(item)}-${i}`}>
                      {typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{document.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Type: {document.document_type || "document"} • Last updated:{" "}
              {new Date(document.updated_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleCancelClick}
                  variant="outline"
                  size="sm"
                  disabled={updateDocumentMutation.isPending}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveClick}
                  variant="cyan"
                  size="sm"
                  loading={updateDocumentMutation.isPending}
                  disabled={updateDocumentMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <Button onClick={handleEditClick} variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
        {document.tags && document.tags.length > 0 && (
          <div className="flex gap-2 mt-3">
            {document.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "px-2 py-1 text-xs rounded",
                  "bg-gray-100 dark:bg-gray-800",
                  "text-gray-700 dark:text-gray-300",
                  "border border-gray-300 dark:border-gray-600",
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-white dark:bg-gray-950">
        {isEditing ? (
          <TextArea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={30}
            className="w-full h-full min-h-[600px] font-sans text-base leading-7"
            placeholder="Enter document content..."
          />
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};
