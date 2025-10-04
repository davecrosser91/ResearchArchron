import type React from "react";
import { useMemo } from "react";
import { cn, glassmorphism } from "../../ui/primitives";

interface TaskCompletionChartProps {
	completed: number;
	open: number;
	archived?: number;
	className?: string;
}

export const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ completed, open, archived = 0, className }) => {
	const total = completed + open;
	const completedPercent = total > 0 ? (completed / total) * 100 : 0;
	const openPercent = total > 0 ? (open / total) * 100 : 0;

	// SVG circle math: circumference = 2 * PI * radius
	const radius = 70;
	const circumference = 2 * Math.PI * radius;
	const completedOffset = circumference - (completedPercent / 100) * circumference;

	return (
		<div className={cn("p-6 rounded-lg", glassmorphism.background.subtle, glassmorphism.border.default, className)}>
			<h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Task Completion</h3>

			<div className="flex items-center justify-center gap-8">
				{/* Pie Chart */}
				<div className="relative w-48 h-48">
					<svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
						{/* Background circle */}
						<circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor" strokeWidth="20" className="text-gray-200 dark:text-zinc-700" />

						{/* Completed segment */}
						<circle
							cx="80"
							cy="80"
							r={radius}
							fill="none"
							stroke="currentColor"
							strokeWidth="20"
							strokeDasharray={circumference}
							strokeDashoffset={completedOffset}
							className="text-green-500 transition-all duration-1000 ease-out"
							strokeLinecap="round"
						/>
					</svg>

					{/* Center text */}
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-3xl font-bold text-gray-900 dark:text-white">{completedPercent.toFixed(0)}%</span>
						<span className="text-sm text-gray-500 dark:text-zinc-400">Complete</span>
					</div>
				</div>

				{/* Legend */}
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="w-4 h-4 rounded-full bg-green-500" />
						<div>
							<p className="text-sm font-medium text-gray-900 dark:text-white">Completed</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{completed}</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-zinc-700" />
						<div>
							<p className="text-sm font-medium text-gray-900 dark:text-white">Open</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{open}</p>
						</div>
					</div>
					{archived > 0 && (
						<div className="flex items-center gap-3">
							<div className="w-4 h-4 rounded-full bg-red-500" />
							<div>
								<p className="text-sm font-medium text-gray-900 dark:text-white">Archived</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">{archived}</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
