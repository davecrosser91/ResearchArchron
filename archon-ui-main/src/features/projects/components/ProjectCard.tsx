import { Activity, CheckCircle2, ListTodo } from "lucide-react";
import type React from "react";
import { isOptimistic } from "@/features/shared/utils/optimistic";
import { OptimisticIndicator } from "../../ui/primitives/OptimisticIndicator";
import { cn } from "../../ui/primitives/styles";
import type { Project } from "../types";
import { ProjectCardActions } from "./ProjectCardActions";

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  taskCounts: {
    todo: number;
    doing: number;
    review: number;
    done: number;
  };
  onSelect: (project: Project) => void;
  onPin: (e: React.MouseEvent, projectId: string) => void;
  onDelete: (e: React.MouseEvent, projectId: string, title: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSelected,
  taskCounts,
  onSelect,
  onPin,
  onDelete,
}) => {
  const optimistic = isOptimistic(project);

  return (
    <div
      tabIndex={0}
      aria-label={`Select project ${project.title}`}
      aria-current={isSelected ? "true" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(project);
        }
      }}
      onClick={() => onSelect(project)}
      className={cn(
        "relative w-56 min-h-[140px] cursor-pointer group flex flex-col",
        "transition-colors duration-200",
        "bg-card border rounded-lg",
        isSelected
          ? "border-primary/40"
          : "border-border hover:border-primary/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        optimistic && "opacity-70 border-primary/30",
      )}
    >
      {/* Left accent bar for selected state */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
      )}

      {/* Main content */}
      <div className="flex-1 p-4">
        {/* Title */}
        <div className="flex flex-col items-center justify-center mb-4 min-h-[48px]">
          <h3
            className={cn(
              "font-medium text-center leading-tight line-clamp-2",
              isSelected
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            {project.title}
          </h3>
          <OptimisticIndicator isOptimistic={optimistic} className="mt-1" />
        </div>

        {/* Task counts */}
        <div className="flex items-center gap-3 justify-center">
          {/* Todo */}
          <div className="flex flex-col items-center gap-1">
            <ListTodo className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {taskCounts.todo || 0}
            </span>
            <span className="text-[10px] text-muted-foreground">Todo</span>
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-border" />

          {/* Doing */}
          <div className="flex flex-col items-center gap-1">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {(taskCounts.doing || 0) + (taskCounts.review || 0)}
            </span>
            <span className="text-[10px] text-muted-foreground">Active</span>
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-border" />

          {/* Done */}
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {taskCounts.done || 0}
            </span>
            <span className="text-[10px] text-muted-foreground">Done</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-3 py-2 mt-auto border-t border-border">
        {/* Pinned indicator */}
        {project.pinned ? (
          <div className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded border border-primary/20">
            DEFAULT
          </div>
        ) : (
          <div />
        )}

        {/* Actions */}
        <ProjectCardActions
          projectId={project.id}
          projectTitle={project.title}
          isPinned={project.pinned}
          onPin={(e) => {
            e.stopPropagation();
            onPin(e, project.id);
          }}
          onDelete={(e) => {
            e.stopPropagation();
            onDelete(e, project.id, project.title);
          }}
        />
      </div>
    </div>
  );
};
