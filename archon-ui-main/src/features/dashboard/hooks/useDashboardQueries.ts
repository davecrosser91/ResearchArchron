import { useQuery } from "@tanstack/react-query";
import { STALE_TIMES } from "../../shared/config/queryPatterns";
import { dashboardService } from "../services/dashboardService";

export const dashboardKeys = {
	all: ["dashboard"] as const,
	stats: () => [...dashboardKeys.all, "stats"] as const,
};

export function useDashboardStats() {
	return useQuery({
		queryKey: dashboardKeys.stats(),
		queryFn: () => dashboardService.getStats(),
		staleTime: STALE_TIMES.frequent, // 5 seconds - relatively fresh data
	});
}
