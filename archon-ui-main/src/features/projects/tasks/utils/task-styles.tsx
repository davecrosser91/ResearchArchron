import { Bot, User } from "lucide-react";
import type { Assignee } from "../types";

// Drag and drop constants
export const ItemTypes = {
  TASK: "task",
};

// Get icon for assignee
export const getAssigneeIcon = (assigneeName: Assignee) => {
  switch (assigneeName) {
    case "User":
      return <User className="w-4 h-4 text-blue-400" />;
    case "Coding Agent":
      return <Bot className="w-4 h-4 text-purple-400" />;
    case "Archon":
      return <img src="/re-light-master.png" alt="Archon" className="w-4 h-4 brightness-0 invert" />;
    default:
      return <User className="w-4 h-4 text-blue-400" />;
  }
};

// Get glow effect for assignee
export const getAssigneeGlow = (assigneeName: Assignee) => {
  switch (assigneeName) {
    case "User":
      return "";
    case "Coding Agent":
      return "";
    case "Archon":
      return "";
    default:
      return "";
  }
};

// Get color based on task priority/order
export const getOrderColor = (order: number) => {
  if (order <= 3) return "bg-rose-500";
  if (order <= 6) return "bg-orange-500";
  if (order <= 10) return "bg-blue-500";
  return "bg-emerald-500";
};

// Get glow effect based on task priority/order
export const getOrderGlow = (order: number) => {
  if (order <= 3) return "";
  if (order <= 6) return "";
  if (order <= 10) return "";
  return "";
};

// Get column header color based on status
export const getColumnColor = (status: "todo" | "doing" | "review" | "done") => {
  switch (status) {
    case "todo":
      return "text-gray-600 dark:text-gray-400";
    case "doing":
      return "text-blue-600 dark:text-blue-400";
    case "review":
      return "text-purple-600 dark:text-purple-400";
    case "done":
      return "text-green-600 dark:text-green-400";
  }
};

// Get column header glow based on status
export const getColumnGlow = (status: "todo" | "doing" | "review" | "done") => {
  switch (status) {
    case "todo":
      return "bg-gray-500/30";
    case "doing":
      return "bg-blue-500/30";
    case "review":
      return "bg-purple-500/30";
    case "done":
      return "bg-green-500/30";
  }
};
