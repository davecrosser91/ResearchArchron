export interface DashboardStats {
	projects: {
		total: number;
		active: number;
	};
	tasks: {
		todo: number;
		doing: number;
		review: number;
		done: number;
		archived: number;
		total: number;
	};
	knowledge: {
		sources: number;
		documents: number;
		code_examples: number;
	};
	projects_enabled: boolean;
}
