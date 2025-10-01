"""
Zotero Web API Integration Service

Handles fetching collections and items from Zotero libraries,
downloading PDFs, and preparing them for knowledge base ingestion.
"""

import httpx
from typing import Any

from ..config.logfire_config import get_logger

logger = get_logger(__name__)


class ZoteroService:
    """Service for interacting with Zotero Web API v3"""

    BASE_URL = "https://api.zotero.org"
    API_VERSION = 3

    def __init__(self, api_key: str, user_id: str | None = None, group_id: str | None = None):
        """
        Initialize Zotero service.

        Args:
            api_key: Zotero API key
            user_id: User library ID (mutually exclusive with group_id)
            group_id: Group library ID (mutually exclusive with user_id)
        """
        if not api_key:
            raise ValueError("Zotero API key is required")

        if not user_id and not group_id:
            raise ValueError("Either user_id or group_id must be provided")

        if user_id and group_id:
            raise ValueError("Cannot specify both user_id and group_id")

        self.api_key = api_key
        self.user_id = user_id
        self.group_id = group_id
        self.library_type = "users" if user_id else "groups"
        self.library_id = user_id or group_id

    def _get_headers(self) -> dict[str, str]:
        """Get headers for Zotero API requests"""
        return {
            "Zotero-API-Version": str(self.API_VERSION),
            "Authorization": f"Bearer {self.api_key}",
        }

    async def get_collections(self) -> list[dict[str, Any]]:
        """
        Fetch all collections from the library.

        Returns:
            List of collection dicts with id, name, and metadata
        """
        url = f"{self.BASE_URL}/{self.library_type}/{self.library_id}/collections"
        logger.info(f"Fetching Zotero collections from {url}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self._get_headers(), timeout=30.0)
                response.raise_for_status()

                collections = response.json()
                logger.info(f"Retrieved {len(collections)} collections")

                # Extract relevant fields
                return [
                    {
                        "key": col["key"],
                        "name": col["data"]["name"],
                        "parent_collection": col["data"].get("parentCollection"),
                        "version": col["version"],
                    }
                    for col in collections
                ]

        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch Zotero collections: {e}")
            raise

    async def get_collection_items(
        self, collection_key: str, include_attachments: bool = True
    ) -> list[dict[str, Any]]:
        """
        Fetch all items from a specific collection.

        Args:
            collection_key: Zotero collection key
            include_attachments: Whether to include attachment metadata

        Returns:
            List of item dicts with metadata
        """
        url = f"{self.BASE_URL}/{self.library_type}/{self.library_id}/collections/{collection_key}/items"

        # Don't use top=false to get ALL items including child attachments
        params = {"format": "json", "top": "false"}
        if include_attachments:
            params["include"] = "data"

        logger.info(f"Fetching items from collection {collection_key} (including child items)")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url, headers=self._get_headers(), params=params, timeout=30.0
                )
                response.raise_for_status()

                items = response.json()
                logger.info(f"Retrieved {len(items)} items from collection")

                # Log sample item to understand structure
                if items:
                    import json
                    logger.info(f"Sample item structure (first item): {json.dumps(items[0], indent=2)[:1000]}")

                return items

        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch collection items: {e}")
            raise

    async def get_item(self, item_key: str) -> dict[str, Any] | None:
        """
        Fetch a single item by its key.

        Args:
            item_key: Zotero item key

        Returns:
            Item dict if found, None otherwise
        """
        url = f"{self.BASE_URL}/{self.library_type}/{self.library_id}/items/{item_key}"
        logger.info(f"Fetching item {item_key} from Zotero API")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self._get_headers(), timeout=30.0)
                response.raise_for_status()

                item = response.json()
                logger.info(f"Successfully fetched item {item_key}")
                return item

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning(f"Item {item_key} not found (404)")
                return None
            logger.error(f"Failed to fetch item {item_key}: {e}")
            raise
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch item {item_key}: {e}")
            raise

    async def get_item_attachments(self, item_key: str) -> list[dict[str, Any]]:
        """
        Get attachment metadata for a specific item.

        Args:
            item_key: Zotero item key

        Returns:
            List of attachment dicts
        """
        url = f"{self.BASE_URL}/{self.library_type}/{self.library_id}/items/{item_key}/children"
        logger.info(f"Fetching attachments for item {item_key} from URL: {url}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self._get_headers(), timeout=30.0)

                # Log response details
                logger.info(f"Response status: {response.status_code}")
                logger.info(f"Response headers: {dict(response.headers)}")

                response.raise_for_status()

                children = response.json()
                logger.info(f"API returned {len(children)} children for item {item_key}")

                # Log detailed info about each child
                for idx, child in enumerate(children):
                    item_type = child.get("data", {}).get("itemType", "unknown")
                    content_type = child.get("data", {}).get("contentType", "N/A")
                    link_mode = child.get("data", {}).get("linkMode", "N/A")
                    title = child.get("data", {}).get("title", "N/A")

                    # Log full child data for debugging
                    import json
                    logger.info(f"Full child {idx} data: {json.dumps(child, indent=2)}")

                    logger.info(
                        f"Child {idx}: itemType={item_type}, contentType={content_type}, "
                        f"linkMode={link_mode}, title={title}"
                    )

                attachments = [
                    child for child in children if child["data"]["itemType"] == "attachment"
                ]

                logger.info(f"Found {len(attachments)} attachments")
                return attachments

        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch item attachments: {e}")
            logger.error(f"Response text: {e.response.text if hasattr(e, 'response') else 'N/A'}")
            raise

    async def download_attachment(self, item_key: str) -> bytes | None:
        """
        Download a PDF attachment.

        Args:
            item_key: Zotero attachment item key

        Returns:
            PDF bytes if successful, None otherwise
        """
        url = f"{self.BASE_URL}/{self.library_type}/{self.library_id}/items/{item_key}/file"
        logger.info(f"Downloading attachment {item_key} from {url}")

        try:
            # Zotero redirects file downloads to AWS, so we must follow redirects
            async with httpx.AsyncClient(follow_redirects=True) as client:
                response = await client.get(url, headers=self._get_headers(), timeout=60.0)

                logger.info(f"Download response status: {response.status_code}")
                logger.info(f"Download response content-type: {response.headers.get('content-type', 'N/A')}")
                logger.info(f"Download response content-length: {len(response.content)} bytes")

                response.raise_for_status()

                content_type = response.headers.get("content-type", "")
                if "pdf" not in content_type.lower():
                    logger.warning(f"Attachment {item_key} is not a PDF: {content_type}")
                    return None

                logger.info(f"Successfully downloaded PDF ({len(response.content)} bytes)")
                return response.content

        except httpx.HTTPError as e:
            logger.error(f"Failed to download attachment: {e}")
            logger.error(f"Response status: {e.response.status_code if hasattr(e, 'response') else 'N/A'}")
            logger.error(f"Response text: {e.response.text if hasattr(e, 'response') else 'N/A'}")
            return None

    def extract_item_metadata(self, item: dict[str, Any]) -> dict[str, Any]:
        """
        Extract relevant metadata from a Zotero item.

        Args:
            item: Raw Zotero item dict

        Returns:
            Cleaned metadata dict
        """
        data = item.get("data", {})

        # Extract authors
        creators = data.get("creators", [])
        authors = [
            f"{c.get('firstName', '')} {c.get('lastName', '')}".strip()
            for c in creators
            if c.get("creatorType") in ["author", "editor"]
        ]

        return {
            "key": item.get("key"),
            "version": item.get("version"),
            "title": data.get("title", "Untitled"),
            "item_type": data.get("itemType"),
            "authors": authors,
            "abstract": data.get("abstractNote", ""),
            "publication": data.get("publicationTitle", ""),
            "year": data.get("date", "").split("-")[0] if data.get("date") else None,
            "doi": data.get("DOI", ""),
            "url": data.get("url", ""),
            "tags": [tag["tag"] for tag in data.get("tags", [])],
            "date_added": data.get("dateAdded"),
            "date_modified": data.get("dateModified"),
        }
