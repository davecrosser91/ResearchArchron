import {
  BookOpen,
  Briefcase,
  Clipboard,
  Code,
  Database,
  FileCode,
  FileText,
  Info,
  Rocket,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { memo, useCallback, useState } from "react";
import { copyToClipboard } from "../../../shared/utils/clipboard";
import { Button } from "../../../ui/primitives";
import type { DocumentCardProps, DocumentType } from "../types";

const getDocumentIcon = (type?: DocumentType) => {
  switch (type) {
    case "prp":
      return <Rocket className="w-3.5 h-3.5" />;
    case "technical":
      return <Code className="w-3.5 h-3.5" />;
    case "business":
      return <Briefcase className="w-3.5 h-3.5" />;
    case "meeting_notes":
      return <Users className="w-3.5 h-3.5" />;
    case "spec":
      return <FileText className="w-3.5 h-3.5" />;
    case "design":
      return <Database className="w-3.5 h-3.5" />;
    case "api":
      return <FileCode className="w-3.5 h-3.5" />;
    case "guide":
      return <BookOpen className="w-3.5 h-3.5" />;
    default:
      return <Info className="w-3.5 h-3.5" />;
  }
};

export const DocumentCard = memo(({ document, isActive, onSelect, onDelete }: DocumentCardProps) => {
  const [showDelete, setShowDelete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyId = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const result = await copyToClipboard(document.id);
      if (result.success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    },
    [document.id],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(document);
    },
    [document, onDelete],
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: Complex card with nested interactive elements
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(document);
        }
      }}
      className={`
        relative w-full p-3 rounded-md cursor-pointer group
        transition-colors duration-200
        ${
          isActive
            ? "bg-card border border-primary/40"
            : "bg-card/50 border border-border hover:border-primary/20"
        }
      `}
      onClick={() => onSelect(document)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Left accent bar for active state */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
      )}

      {/* Top Row: Type + Delete */}
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          {getDocumentIcon(document.document_type as DocumentType)}
          <span className="capitalize">{document.document_type || "document"}</span>
        </div>

        {/* Delete Button */}
        {showDelete && !isActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="p-1 h-auto min-h-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Delete ${document.title}`}
            title="Delete document"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm leading-snug mb-2 line-clamp-2 text-foreground">
        {document.title}
      </h4>

      {/* Bottom Row: Date + Copy ID */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
        <time className="text-muted-foreground">
          {new Date(document.updated_at || document.created_at || Date.now()).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>

        {/* Copy ID Button */}
        <div
          className={`flex items-center gap-1 ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } transition-opacity`}
        >
          <span className="text-muted-foreground font-mono text-[10px]" title={document.id}>
            {document.id.slice(0, 8)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyId}
            className="p-0.5 h-auto min-h-0"
            title="Copy Document ID"
            aria-label="Copy Document ID"
          >
            {isCopied ? (
              <span className="text-green-500 text-xs">✓</span>
            ) : (
              <Clipboard className="w-3 h-3" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

DocumentCard.displayName = "DocumentCard";
