import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DISABLED_QUERY_KEY, STALE_TIMES } from "../../../shared/config/queryPatterns";
import { useToast } from "../../../shared/hooks/useToast";
import { documentService } from "../services/documentService";
import { projectService } from "../../services";
import type { CreateDocumentRequest, ProjectDocument, UpdateDocumentRequest } from "../types";

// Query keys factory for documents
export const documentKeys = {
  all: ["documents"] as const,
  byProject: (projectId: string) => ["projects", projectId, "documents"] as const,
  detail: (projectId: string, docId: string) => ["projects", projectId, "documents", "detail", docId] as const,
  versions: (projectId: string) => ["projects", projectId, "versions"] as const,
  version: (projectId: string, fieldName: string, version: number) =>
    ["projects", projectId, "versions", fieldName, version] as const,
};

/**
 * Get documents from project's docs JSONB field
 */
export function useProjectDocuments(projectId: string | undefined) {
  return useQuery({
    queryKey: projectId ? documentKeys.byProject(projectId) : DISABLED_QUERY_KEY,
    queryFn: async () => {
      if (!projectId) return [];
      const project = await projectService.getProject(projectId);
      return (project.docs || []) as ProjectDocument[];
    },
    enabled: !!projectId,
    staleTime: STALE_TIMES.normal,
  });
}

/**
 * Create a new document
 */
export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, request }: { projectId: string; request: CreateDocumentRequest }) =>
      documentService.createDocument(projectId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.byProject(variables.projectId) });
      toast({
        title: "Document created",
        description: "Document has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create document: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

/**
 * Update a document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, docId, updates }: { projectId: string; docId: string; updates: UpdateDocumentRequest }) =>
      documentService.updateDocument(projectId, docId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.byProject(variables.projectId) });
      toast({
        title: "Document updated",
        description: "Document has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update document: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
