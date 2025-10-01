/**
 * Zotero Sync Dialog Component
 * Allows users to sync Zotero collections to the knowledge base
 */

import { useState } from "react";
import { Button } from "@/features/ui/primitives/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/features/ui/primitives/dialog";
import { Input, Label } from "@/features/ui/primitives/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/features/ui/primitives/select";
import { useToast } from "@/features/shared/hooks/useToast";
import { knowledgeService } from "../services";
import type { ZoteroCollection } from "../types";

interface ZoteroSyncDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSyncStarted?: (progressId: string) => void;
}

export function ZoteroSyncDialog({
	open,
	onOpenChange,
	onSyncStarted,
}: ZoteroSyncDialogProps) {
	console.log("ZoteroSyncDialog rendered, open:", open);

	const { showToast } = useToast();
	const [collections, setCollections] = useState<ZoteroCollection[]>([]);
	const [selectedCollection, setSelectedCollection] = useState<string>("");
	const [loading, setLoading] = useState(false);

	const handleFetchCollections = async () => {
		setLoading(true);
		try {
			const response = await knowledgeService.getZoteroCollections();

			setCollections(response.collections);

			if (response.collections.length === 0) {
				showToast("No collections found in your Zotero library", "warning");
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to fetch collections";

			if (errorMessage.includes("not configured")) {
				showToast("Please configure Zotero credentials in Settings first", "error");
			} else {
				showToast(errorMessage, "error");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleSync = async () => {
		console.log("handleSync called");

		if (!selectedCollection) {
			showToast("Please select a collection to sync", "error");
			return;
		}

		const collection = collections.find((c) => c.key === selectedCollection);
		if (!collection) {
			console.log("Collection not found");
			return;
		}

		console.log("Starting sync for collection:", collection.name);
		setLoading(true);

		try {
			const response = await knowledgeService.syncZoteroCollection({
				collection_key: collection.key,
				collection_name: collection.name,
			});

			console.log("Sync response:", response);

			showToast(response.message, "success");

			if (onSyncStarted) {
				console.log("Calling onSyncStarted with:", response.progressId);
				onSyncStarted(response.progressId);
			}

			handleClose();
		} catch (error) {
			console.error("Sync error:", error);
			showToast(
				error instanceof Error ? error.message : "Sync failed",
				"error"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setCollections([]);
		setSelectedCollection("");
		onOpenChange(false);
	};

	// Automatically fetch collections when dialog opens
	if (open && collections.length === 0 && !loading) {
		handleFetchCollections();
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Sync Zotero Collection</DialogTitle>
					<DialogDescription>
						Select a collection to sync to the knowledge base
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="collection">Collection</Label>
						<Select
							value={selectedCollection}
							onValueChange={setSelectedCollection}
						>
							<SelectTrigger id="collection">
								<SelectValue placeholder={loading ? "Loading collections..." : "Select a collection"} />
							</SelectTrigger>
							<SelectContent>
								{collections.map((collection) => (
									<SelectItem key={collection.key} value={collection.key}>
										{collection.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="text-sm text-muted-foreground">
						The collection name will be added as a tag to all imported papers.
						<br />
						Configure your Zotero credentials in Settings first.
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleSync} disabled={loading || !selectedCollection}>
						{loading ? "Syncing..." : "Sync Collection"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
