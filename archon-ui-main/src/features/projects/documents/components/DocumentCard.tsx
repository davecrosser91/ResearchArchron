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
      return <Rocket className="w-4 h-4" />;
    case "technical":
      return <Code className="w-4 h-4" />;
    case "business":
      return <Briefcase className="w-4 h-4" />;
    case "meeting_notes":
      return <Users className="w-4 h-4" />;
    case "spec":
      return <FileText className="w-4 h-4" />;
    case "design":
      return <Database className="w-4 h-4" />;
    case "api":
      return <FileCode className="w-4 h-4" />;
    case "guide":
      return <BookOpen className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
};

const getTypeColor = (type?: DocumentType) => {
  switch (type) {
    case "prp":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "technical":
      return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30";
    case "business":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
    case "meeting_notes":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30";
    case "spec":
      return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
    case "design":
      return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30";
    case "api":
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    case "guide":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30";
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
    // biome-ignore lint/a11y/useSemanticElements: Complex card with nested interactive elements - semantic button would break layout
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
        relative w-full p-3.5 rounded-xl cursor-pointer
        transition-all duration-300 group
        ${
          isActive
            ? "bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-purple-500/10 border-2 border-cyan-400/60 shadow-xl shadow-cyan-500/20 scale-[1.02]"
            : "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/80 dark:to-gray-900/50 border border-gray-300/30 dark:border-gray-700/50 hover:border-cyan-400/50 hover:shadow-lg hover:scale-[1.01]"
        }
      `}
      onClick={() => onSelect(document)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-500 rounded-l-xl shadow-lg shadow-cyan-500/50" />
      )}

      {/* Top Row: Type Badge + Delete */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm ${getTypeColor(
            document.document_type as DocumentType,
          )}`}
        >
          {getDocumentIcon(document.document_type as DocumentType)}
          <span className="capitalize tracking-wide">{document.document_type || "document"}</span>
        </div>

        {/* Delete Button */}
        {showDelete && !isActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="p-1.5 h-auto min-h-0 text-red-500 dark:text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label={`Delete ${document.title}`}
            title="Delete document"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Title */}
      <h4 className={`font-bold text-sm leading-tight mb-3 line-clamp-2 ${
        isActive ? "text-gray-900 dark:text-white" : "text-gray-800 dark:text-gray-100"
      }`}>
        {document.title}
      </h4>

      {/* Bottom Row: Date + Copy ID */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
        <time className="text-gray-600 dark:text-gray-400 font-medium">
          {new Date(document.updated_at || document.created_at || Date.now()).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>

        {/* Copy ID Button - Show on active or hover */}
        <div
          className={`flex items-center gap-1.5 ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } transition-opacity duration-200`}
        >
          <span className="text-gray-500 dark:text-gray-400 font-mono text-[10px]" title={document.id}>
            {document.id.slice(0, 8)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyId}
            className="p-1 h-auto min-h-0 hover:bg-cyan-500/20 rounded transition-colors"
            title="Copy Document ID to clipboard"
            aria-label="Copy Document ID to clipboard"
          >
            {isCopied ? (
              <span className="text-green-500 text-xs font-bold">✓</span>
            ) : (
              <Clipboard className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

DocumentCard.displayName = "DocumentCard";
