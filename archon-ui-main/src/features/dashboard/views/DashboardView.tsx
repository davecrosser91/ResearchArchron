import { motion } from "framer-motion";
import {
	Archive,
	BarChart3,
	Book,
	CheckCircle2,
	Clock,
	Code2,
	FileText,
	FolderKanban,
	Layers,
	ListTodo,
	Loader,
	Pause,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useDashboardStats } from "../hooks/useDashboardQueries";
import { StatCard } from "../components/StatCard";
import { TaskCompletionChart } from "../components/TaskCompletionChart";
import { useProjects } from "../../projects/hooks/useProjectQueries";

export const DashboardView: React.FC = () => {
	const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
	const { data: stats, isLoading } = useDashboardStats(selectedProjectId);
	const { data: projects } = useProjects();

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.4,
				ease: "easeOut",
			},
		},
	};

	if (isLoading || !stats) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader className="animate-spin text-gray-500" size={32} />
			</div>
		);
	}

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			className="space-y-8 p-6"
		>
			{/* Header */}
			<motion.div variants={itemVariants}>
				<h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
					<BarChart3 className="w-8 h-8 text-cyan-500" />
					Dashboard
				</h1>
				<p className="text-gray-600 dark:text-zinc-400">
					Overview of your projects, tasks, and knowledge base
				</p>
			</motion.div>

			{/* Projects Stats (if enabled) */}
			{stats.projects_enabled && (
				<motion.div variants={itemVariants}>
					<h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
						<FolderKanban className="w-5 h-5 text-cyan-500" />
						Projects
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<StatCard
							title="Total Projects"
							value={stats.projects.total}
							icon={Layers}
							subtitle="All projects in the system"
							iconColor="text-blue-500"
						/>
						<StatCard
							title="Active Projects"
							value={stats.projects.active}
							icon={FolderKanban}
							subtitle="Currently in progress"
							iconColor="text-green-500"
						/>
					</div>
				</motion.div>
			)}

			{/* Tasks Stats (if projects enabled) */}
			{stats.projects_enabled && (
				<motion.div variants={itemVariants}>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
							<ListTodo className="w-5 h-5 text-cyan-500" />
							Tasks
						</h2>
						{/* Project Filter Dropdown */}
						<select
							value={selectedProjectId || ""}
							onChange={(e) => setSelectedProjectId(e.target.value || undefined)}
							className="px-4 py-2 rounded-lg bg-white/10 dark:bg-zinc-800/50 border border-gray-300/30 dark:border-zinc-700/50 text-gray-800 dark:text-white backdrop-blur-sm hover:bg-white/20 dark:hover:bg-zinc-800/70 transition-colors"
						>
							<option value="">All Projects</option>
							{projects?.map((project) => (
								<option key={project.id} value={project.id}>
									{project.title}
								</option>
							))}
						</select>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
						<StatCard
							title="Backlog"
							value={stats.tasks.todo}
							icon={ListTodo}
							subtitle="Waiting to start"
							iconColor="text-gray-500"
						/>
						<StatCard
							title="In Progress"
							value={stats.tasks.doing}
							icon={Clock}
							subtitle="Currently working on"
							iconColor="text-yellow-500"
						/>
						<StatCard
							title="In Review"
							value={stats.tasks.review}
							icon={Pause}
							subtitle="Awaiting review"
							iconColor="text-orange-500"
						/>
						<StatCard
							title="Completed"
							value={stats.tasks.done}
							icon={CheckCircle2}
							subtitle="Finished tasks"
							iconColor="text-green-500"
						/>
						<StatCard
							title="Archived"
							value={stats.tasks.archived}
							icon={Archive}
							subtitle="Deleted tasks"
							iconColor="text-red-500"
						/>
					</div>

					{/* Task Completion Chart */}
					<div className="mt-6">
						<TaskCompletionChart
							completed={stats.tasks.done}
							open={stats.tasks.todo + stats.tasks.doing + stats.tasks.review}
							archived={stats.tasks.archived}
						/>
					</div>
				</motion.div>
			)}

			{/* Knowledge Base Stats */}
			<motion.div variants={itemVariants}>
				<h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
					<Book className="w-5 h-5 text-cyan-500" />
					Knowledge Base
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<StatCard
						title="Sources"
						value={stats.knowledge.sources}
						icon={Layers}
						subtitle="Crawled websites & documents"
						iconColor="text-purple-500"
					/>
					<StatCard
						title="Documents"
						value={stats.knowledge.documents}
						icon={FileText}
						subtitle="Processed chunks"
						iconColor="text-indigo-500"
					/>
					<StatCard
						title="Code Examples"
						value={stats.knowledge.code_examples}
						icon={Code2}
						subtitle="Extracted snippets"
						iconColor="text-pink-500"
					/>
				</div>
			</motion.div>
		</motion.div>
	);
};
