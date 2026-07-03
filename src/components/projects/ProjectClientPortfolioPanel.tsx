import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Shield, FolderKanban } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { Project } from "@/hooks/useProjects";
import { getClientUrl, getClientRetentionCopilotUrl } from "@/lib/clientSlugUtils";
import { getProjectUrl } from "@/lib/projectSlugUtils";

type LinkedClient = Pick<Client, "id" | "name" | "company" | "slug" | "status">;

interface ProjectClientPortfolioPanelProps {
  client: LinkedClient;
  projects: Project[];
  currentProjectId?: string;
  loading?: boolean;
}

function isImportedProject(project: Project): boolean {
  return !!(project.activecollab_project_id || project.control_tower_project_id);
}

export function ProjectClientPortfolioPanel({
  client,
  projects,
  currentProjectId,
  loading = false,
}: ProjectClientPortfolioPanelProps) {
  const clientForUrl = client as Client;
  const portfolioProjects = projects.length > 0 ? projects : [];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Client & Portfolio
            </CardTitle>
            <CardDescription>
              {client.name}
              {client.company ? ` · ${client.company}` : ""}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link to={getClientUrl(clientForUrl)}>View Client</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={getClientRetentionCopilotUrl(client.id)}>
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Retention Portfolio
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {client.status && client.status !== "active" && (
          <Badge variant="secondary" className="mb-3 text-xs">
            {client.status}
          </Badge>
        )}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading client projects...</p>
        ) : portfolioProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other projects for this client.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <FolderKanban className="h-3.5 w-3.5" />
              {portfolioProjects.length} project{portfolioProjects.length === 1 ? "" : "s"}
            </p>
            <ul className="space-y-1.5">
              {portfolioProjects.map((portfolioProject) => {
                const isCurrent = portfolioProject.id === currentProjectId;
                return (
                  <li key={portfolioProject.id}>
                    {isCurrent ? (
                      <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                        <span className="font-medium truncate">{portfolioProject.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0 ml-2">
                          Current
                        </Badge>
                      </div>
                    ) : (
                      <Link
                        to={getProjectUrl(portfolioProject, isImportedProject(portfolioProject))}
                        className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <span className="truncate">{portfolioProject.name}</span>
                        <Badge variant="secondary" className="text-xs shrink-0 ml-2 capitalize">
                          {portfolioProject.status.replace("_", " ")}
                        </Badge>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
