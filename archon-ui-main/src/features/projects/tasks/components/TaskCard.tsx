import { Tag } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import { isOptimistic } from "@/features/shared/utils/optimistic";
import { OptimisticIndicator } from "../../../ui/primitives/OptimisticIndicator";
import { useTaskActions } from "../hooks";
import type { Assignee, Task, TaskPriority } from "../types";
import { ItemTypes } from "../utils/task-styles";
import { TaskPriorityComponent } from ".";
import { TaskAssignee } from "./TaskAssignee";
import { TaskCardActions } from "./TaskCardActions";

export interface TaskCardProps {
  task: Task;
  index: number;
  projectId: string;
  onTaskReorder: (taskId: string, targetIndex: number, status: Task["status"]) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  hoveredTaskId?: string | null;
  onTaskHover?: (taskId: string | null) => void;
  selectedTasks?: Set<string>;
  onTaskSelect?: (taskId: string) => void;
}

// Removed colorful priority indicators - using minimal design

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  projectId,
  onTaskReorder,
  onEdit,
  onDelete,
  hoveredTaskId,
  onTaskHover,
  selectedTasks,
  onTaskSelect,
}) => {
  const optimistic = isOptimistic(task);
  const { changeAssignee, changePriority, isUpdating } = useTaskActions(projectId);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(task);
    }
  }, [onEdit, task]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(task);
    }
  }, [onDelete, task]);

  const handlePriorityChange = useCallback(
    (priority: TaskPriority) => {
      changePriority(task.id, priority);
    },
    [changePriority, task.id],
  );

  const handleAssigneeChange = useCallback(
    (newAssignee: Assignee) => {
      changeAssignee(task.id, newAssignee);
    },
    [changeAssignee, task.id],
  );

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: { id: task.id, status: task.status, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    hover: (draggedItem: { id: string; status: Task["status"]; index: number }, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      if (draggedItem.id === task.id) return;
      if (draggedItem.status !== task.status) return;

      const draggedIndex = draggedItem.index;
      const hoveredIndex = index;

      if (draggedIndex === hoveredIndex) return;

      onTaskReorder(draggedItem.id, hoveredIndex, task.status);
      draggedItem.index = hoveredIndex;
    },
  });

  const isHighlighted = hoveredTaskId === task.id;
  const isSelected = selectedTasks?.has(task.id) || false;

  const handleMouseEnter = () => {
    onTaskHover?.(task.id);
  };

  const handleMouseLeave = () => {
    onTaskHover?.(null);
  };

  const handleTaskClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.stopPropagation();
      onTaskSelect?.(task.id);
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: Drag-and-drop card with react-dnd
    <div
      ref={(node) => drag(drop(node))}
      role="button"
      tabIndex={0}
      className={`w-full cursor-move group ${isDragging ? "opacity-50" : "opacity-100"} transition-opacity`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTaskClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onEdit) {
            onEdit(task);
          }
        }
      }}
    >
      <div
        className={`
          relative bg-card border rounded-md p-3
          transition-colors duration-200
          ${isSelected ? "border-primary/60" : isHighlighted ? "border-primary/40" : "border-border hover:border-primary/20"}
          ${optimistic ? "opacity-70 border-primary/30" : ""}
        `}
      >
        {/* Header with feature tag and actions */}
        <div className="flex items-center gap-2 mb-2 pl-1.5">
          {task.feature && (
            <div className="px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 bg-muted text-muted-foreground">
              <Tag className="w-2.5 h-2.5" />
              {task.feature}
            </div>
          )}

          <OptimisticIndicator isOptimistic={optimistic} className="ml-auto" />

          <div className={`${optimistic ? "" : "ml-auto"} flex items-center gap-1`}>
            <TaskCardActions
              taskId={task.id}
              taskTitle={task.title}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={false}
            />
          </div>
        </div>

        {/* Title */}
        <h4 className="text-xs font-medium text-foreground mb-2 pl-1.5 line-clamp-2" title={task.title}>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <div className="pl-1.5 mb-2">
            <p className="text-[11px] text-muted-foreground line-clamp-2 break-words whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 pl-1.5 border-t border-border">
          <TaskAssignee assignee={task.assignee} onAssigneeChange={handleAssigneeChange} isLoading={isUpdating} />
          <TaskPriorityComponent
            priority={task.priority}
            onPriorityChange={handlePriorityChange}
            isLoading={isUpdating}
          />
        </div>
      </div>
    </div>
  );
};
