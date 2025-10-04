import { type LucideIcon } from "lucide-react";
import type React from "react";
import { glassmorphism } from "../../ui/primitives/styles";
import { cn } from "../../ui/primitives";

interface StatCardProps {
	title: string;
	value: number | string;
	icon: LucideIcon;
	subtitle?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	iconColor?: string;
	className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	icon: Icon,
	subtitle,
	trend,
	iconColor = "text-cyan-500",
	className,
}) => {
	return (
		<div
			className={cn(
				"p-6 rounded-lg",
				glassmorphism.background.subtle,
				glassmorphism.border.default,
				"hover:shadow-lg transition-shadow duration-200",
				className,
			)}
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<p className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-1">{title}</p>
					<p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
					{subtitle && <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{subtitle}</p>}
					{trend && (
						<div className="flex items-center gap-1 mt-2">
							<span
								className={cn(
									"text-xs font-medium",
									trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
								)}
							>
								{trend.isPositive ? "+" : ""}
								{trend.value}%
							</span>
							<span className="text-xs text-gray-500 dark:text-zinc-500">vs last week</span>
						</div>
					)}
				</div>
				<div className={cn("p-3 rounded-lg", glassmorphism.background.blue)}>
					<Icon className={cn("w-6 h-6", iconColor)} />
				</div>
			</div>
		</div>
	);
};
