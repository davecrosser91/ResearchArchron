import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextArea,
} from "../../../ui/primitives";
import { useCreateDocument } from "../hooks";
import type { DocumentType } from "../types";

interface NewDocumentModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewDocumentModal = ({ projectId, open, onOpenChange }: NewDocumentModalProps) => {
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("note");
  const [content, setContent] = useState("");
  const createDocumentMutation = useCreateDocument();

  const handleCreate = () => {
    if (!title.trim()) return;

    createDocumentMutation.mutate(
      {
        projectId,
        request: {
          title: title.trim(),
          document_type: documentType,
          content: { markdown: content },
        },
      },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setDocumentType("note");
          onOpenChange(false);
        },
      }
    );
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setDocumentType("note");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <FormField>
            <Label required>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              autoFocus
            />
          </FormField>

          <FormField>
            <Label>Document Type</Label>
            <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="spec">Specification</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="api">API Documentation</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="prp">PRP</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="meeting_notes">Meeting Notes</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField>
            <Label>Content (Markdown supported)</Label>
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              placeholder="Enter document content in markdown format..."
              className="font-mono text-sm"
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline" disabled={createDocumentMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="cyan"
            loading={createDocumentMutation.isPending}
            disabled={createDocumentMutation.isPending || !title.trim()}
          >
            Create Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
