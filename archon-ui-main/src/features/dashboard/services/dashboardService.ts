import { apiClient } from "../../shared/api/apiClient";
import type { DashboardStats } from "../types";

export const dashboardService = {
	async getStats(): Promise<DashboardStats> {
		const response = await apiClient.get<DashboardStats>("/api/dashboard/stats");
		return response;
	},
};
