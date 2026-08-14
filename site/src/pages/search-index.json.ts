import type { APIRoute } from 'astro';
import { getAllServers } from '../lib/data';

export const GET: APIRoute = () => {
  // Compact index for client-side search: name + category + truncated description (200 chars)
  // + tags + stars. Full description lives on detail pages.
  const index = getAllServers().map(({ name, slug, description, category, stars, badges, compatible_clients }) => ({
    name,
    slug,
    description: description.slice(0, 200),
    category,
    stars,
    tags: Object.entries(badges || {}).filter(([, v]) => v).map(([k]) => k),
    clients: compatible_clients,
  }));
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
