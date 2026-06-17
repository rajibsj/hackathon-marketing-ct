/**
 * Map app routes to canonical module names for adoption reporting.
 * Aligned with CONTROL-TOWER-ADOPTION-STATS-EXPORT-API.md §8.
 */
export function getModuleFromPath(path: string): string | null {
  if (path === "/" || path === "/dashboard") return "Dashboard";
  if (path.startsWith("/tasks")) return "Actions";
  if (path.startsWith("/clients")) return "Clients";
  if (path.startsWith("/projects")) return "Projects";
  if (path.startsWith("/knowledge")) return "Knowledge";
  if (path.startsWith("/workspace") || path.startsWith("/my-agents")) return "CollabAI";
  if (path.startsWith("/content")) return "Marketing:LinkedIn Content";
  if (path.startsWith("/image-ai") || path.startsWith("/adminpanel/image-analytics")) {
    return "Marketing:Image AI";
  }
  if (path.startsWith("/video")) return "Marketing:Video";
  if (path.startsWith("/brands")) return "Brands";
  if (path.startsWith("/reports")) return "Dashboard";
  if (path.startsWith("/adminpanel/control-tower/meetings")) return "Meetings";
  if (path.startsWith("/adminpanel")) return "Admin";
  if (path.startsWith("/quotes")) return "Clients";
  if (path.startsWith("/hackathon")) return "Dashboard";
  return null;
}

export const ActivityActions = {
  TASK_CREATED: "task_created",
  TASK_UPDATED: "task_updated",
  TASK_COMPLETED: "task_completed",
  CONTENT_GENERATED: "content_generated",
  AGENT_RUN: "agent_run",
  IMAGE_GENERATED: "image_generated",
  VIDEO_GENERATED: "video_generated",
} as const;
