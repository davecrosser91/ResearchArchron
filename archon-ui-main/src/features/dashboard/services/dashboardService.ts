import { callAPIWithETag } from "../../shared/api/apiClient";
import type { DashboardStats } from "../types";

export const dashboardService = {
	async getStats(projectId?: string): Promise<DashboardStats> {
		const params = projectId ? `?project_id=${projectId}` : "";
		const response = await callAPIWithETag<DashboardStats>(`/api/dashboard/stats${params}`);
		return response;
	},
};
