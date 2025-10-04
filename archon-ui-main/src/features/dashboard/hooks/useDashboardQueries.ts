import { useQuery } from "@tanstack/react-query";
import { STALE_TIMES } from "../../shared/config/queryPatterns";
import { dashboardService } from "../services/dashboardService";

export const dashboardKeys = {
	all: ["dashboard"] as const,
	stats: (projectId?: string) => [...dashboardKeys.all, "stats", projectId] as const,
};

export function useDashboardStats(projectId?: string) {
	return useQuery({
		queryKey: dashboardKeys.stats(projectId),
		queryFn: () => dashboardService.getStats(projectId),
		staleTime: STALE_TIMES.frequent, // 5 seconds - relatively fresh data
	});
}
