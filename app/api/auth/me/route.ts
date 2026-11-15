// app/api/auth/me/route.ts
import { auth } from '@/lib/auth';
import { isLocalMode } from '@/lib/db';
import { activeProvider } from '@/lib/env';

export async function GET() {
  const { user } = await auth();
  return Response.json({
    user,
    mode: isLocalMode() ? 'local' : 'supabase',
    ai: activeProvider(),
  });
}
