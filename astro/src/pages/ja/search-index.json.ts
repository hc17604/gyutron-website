import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../../lib/searchIndex';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildSearchIndex('ja')), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
