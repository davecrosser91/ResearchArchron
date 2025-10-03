/**
 * Document Service
 * Handles document CRUD operations
 */

import { callAPIWithETag } from "../../../shared/api/apiClient";
import type { CreateDocumentRequest, ProjectDocument, UpdateDocumentRequest } from "../types";

export const documentService = {
  /**
   * Create a new document
   */
  async createDocument(
    projectId: string,
    request: CreateDocumentRequest
  ): Promise<{ message: string; document: ProjectDocument }> {
    try {
      const response = await callAPIWithETag<{ message: string; document: ProjectDocument }>(
        `/api/projects/${projectId}/docs`,
        {
          method: "POST",
          body: JSON.stringify(request),
        }
      );
      return response;
    } catch (error) {
      console.error(`Failed to create document:`, error);
      throw error;
    }
  },

  /**
   * Update a document
   */
  async updateDocument(
    projectId: string,
    docId: string,
    updates: UpdateDocumentRequest
  ): Promise<{ message: string; document: ProjectDocument }> {
    try {
      const response = await callAPIWithETag<{ message: string; document: ProjectDocument }>(
        `/api/projects/${projectId}/docs/${docId}`,
        {
          method: "PUT",
          body: JSON.stringify(updates),
        }
      );
      return response;
    } catch (error) {
      console.error(`Failed to update document ${docId}:`, error);
      throw error;
    }
  },
};
