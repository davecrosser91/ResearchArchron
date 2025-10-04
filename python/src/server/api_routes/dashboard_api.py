"""Dashboard API routes for overview statistics."""

import os
from fastapi import APIRouter, Response
from logfire import instrument
from ..services.client_manager import get_supabase_client
from ..utils.logfire_helpers import safe_set_attribute, safe_span
from ..utils.logging_config import api_logger

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
@instrument("api_get_dashboard_stats")
async def get_dashboard_stats(response: Response):
    """Get dashboard statistics overview."""
    with safe_span("api_get_dashboard_stats") as span:
        safe_set_attribute(span, "endpoint", "/api/dashboard/stats")
        safe_set_attribute(span, "method", "GET")

        try:
            api_logger.info("Getting dashboard statistics")
            client = get_supabase_client()

            # Get projects count and active projects
            projects_enabled = os.getenv("PROJECTS_ENABLED", "true").lower() == "true"
            projects_stats = {"total": 0, "active": 0}

            if projects_enabled:
                try:
                    projects_result = client.table("archon_projects").select("id, status").execute()
                    projects_data = projects_result.data or []
                    projects_stats["total"] = len(projects_data)
                    projects_stats["active"] = len([p for p in projects_data if p.get("status") != "archived"])
                except Exception as e:
                    api_logger.warning(f"Failed to get projects stats: {e}")

            # Get tasks count by status
            tasks_stats = {"todo": 0, "doing": 0, "review": 0, "done": 0, "total": 0}

            if projects_enabled:
                try:
                    tasks_result = client.table("archon_tasks").select("id, status").execute()
                    tasks_data = tasks_result.data or []
                    tasks_stats["total"] = len(tasks_data)

                    for task in tasks_data:
                        status = task.get("status", "todo")
                        if status in tasks_stats:
                            tasks_stats[status] += 1
                except Exception as e:
                    api_logger.warning(f"Failed to get tasks stats: {e}")

            # Get knowledge base statistics
            knowledge_stats = {
                "sources": 0,
                "documents": 0,
                "code_examples": 0
            }

            try:
                # Count sources
                sources_result = client.table("archon_sources").select("id", count="exact").execute()
                knowledge_stats["sources"] = sources_result.count or 0

                # Count documents
                documents_result = client.table("archon_documents").select("id", count="exact").execute()
                knowledge_stats["documents"] = documents_result.count or 0

                # Count code examples
                code_result = client.table("archon_code_examples").select("id", count="exact").execute()
                knowledge_stats["code_examples"] = code_result.count or 0
            except Exception as e:
                api_logger.warning(f"Failed to get knowledge stats: {e}")

            stats = {
                "projects": projects_stats,
                "tasks": tasks_stats,
                "knowledge": knowledge_stats,
                "projects_enabled": projects_enabled
            }

            api_logger.info(
                "Dashboard statistics retrieved",
                extra={
                    "projects_total": projects_stats["total"],
                    "tasks_total": tasks_stats["total"],
                    "knowledge_sources": knowledge_stats["sources"]
                }
            )

            return stats

        except Exception as e:
            api_logger.error(f"Error getting dashboard stats: {str(e)}", exc_info=True)
            response.status_code = 500
            return {
                "error": "Failed to get dashboard statistics",
                "details": str(e)
            }
