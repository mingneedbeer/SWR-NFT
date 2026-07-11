import type { APIRoute } from 'astro';
import { fetchNftMints } from '../../lib/alchemy';

export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const pageKey = url.searchParams.get('pageKey') ?? undefined;

    const result = await fetchNftMints(limit, pageKey);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
