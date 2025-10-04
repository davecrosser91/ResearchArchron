"""Dashboard API routes for overview statistics."""

import os
from fastapi import APIRouter, Response
from logfire import instrument
from ..services.client_manager import get_supabase_client
from ..config.logfire_config import api_logger, safe_set_attribute, safe_span

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
@instrument("api_get_dashboard_stats")
async def get_dashboard_stats(response: Response, project_id: str = None):
    """Get dashboard statistics overview.

    Args:
        project_id: Optional project ID to filter tasks by project
    """
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
                    projects_result = client.table("archon_projects").select("*").execute()
                    projects_data = projects_result.data or []
                    projects_stats["total"] = len(projects_data)
                    projects_stats["active"] = len([p for p in projects_data if p.get("status") not in ["archived", "completed"]])
                    api_logger.info(f"Projects found: {len(projects_data)} total, {projects_stats['active']} active")
                except Exception as e:
                    api_logger.error(f"Failed to get projects stats: {e}", exc_info=True)

            # Get tasks count by status
            tasks_stats = {"todo": 0, "doing": 0, "review": 0, "done": 0, "archived": 0, "total": 0}

            if projects_enabled:
                try:
                    # Build tasks query with optional project filter
                    tasks_query = client.table("archon_tasks").select("id, status, project_id, archived")
                    if project_id:
                        tasks_query = tasks_query.eq("project_id", project_id)
                        api_logger.info(f"Filtering tasks by project_id: {project_id}")

                    tasks_result = tasks_query.execute()
                    tasks_data = tasks_result.data or []
                    tasks_stats["total"] = len(tasks_data)

                    # Count unique status values for debugging
                    status_counts = {}
                    archived_count = 0
                    for task in tasks_data:
                        # Check if task is archived first
                        if task.get("archived"):
                            tasks_stats["archived"] += 1
                            archived_count += 1
                            continue

                        raw_status = task.get("status")
                        status_counts[str(raw_status)] = status_counts.get(str(raw_status), 0) + 1

                        # Handle null status as "todo" (default)
                        status = raw_status or "todo"
                        if status in tasks_stats:
                            tasks_stats[status] += 1

                    api_logger.info(f"Raw status distribution: {status_counts}, archived: {archived_count}")
                    api_logger.info(f"Tasks: {tasks_stats['todo']} todo, {tasks_stats['doing']} doing, {tasks_stats['review']} review, {tasks_stats['done']} done, {tasks_stats['archived']} archived")
                except Exception as e:
                    api_logger.error(f"Failed to get tasks stats: {e}", exc_info=True)

            # Get knowledge base statistics
            knowledge_stats = {
                "sources": 0,
                "documents": 0,
                "code_examples": 0
            }

            try:
                # Count sources (archon_sources uses source_id as primary key)
                sources_result = client.table("archon_sources").select("source_id").execute()
                knowledge_stats["sources"] = len(sources_result.data) if sources_result.data else 0

                # Count documents (stored in archon_crawled_pages)
                documents_result = client.table("archon_crawled_pages").select("id").execute()
                knowledge_stats["documents"] = len(documents_result.data) if documents_result.data else 0

                # Count code examples
                code_result = client.table("archon_code_examples").select("id").execute()
                knowledge_stats["code_examples"] = len(code_result.data) if code_result.data else 0

                api_logger.info(f"Knowledge: {knowledge_stats['sources']} sources, {knowledge_stats['documents']} documents, {knowledge_stats['code_examples']} code examples")
            except Exception as e:
                api_logger.error(f"Failed to get knowledge stats: {e}", exc_info=True)

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
