import { slugify } from "./slugify";
import { Client } from "@/hooks/useClients";

/**
 * Generates a URL-friendly slug for a client
 * Uses company name if available, otherwise falls back to client name
 */
export function getClientSlug(client: Client): string {
  if (client.slug) return client.slug;
  return slugify(client.company || client.name);
}

/**
 * Generates a client detail URL with the appropriate slug
 */
export function getClientUrl(client: Client): string {
  return `/clients/${getClientSlug(client)}`;
}

/**
 * Opens the retention copilot portfolio, optionally focused on one client.
 */
export function getClientRetentionCopilotUrl(clientId?: string): string {
  if (!clientId) return "/client-retention-copilot";
  return `/client-retention-copilot?client=${clientId}`;
}
