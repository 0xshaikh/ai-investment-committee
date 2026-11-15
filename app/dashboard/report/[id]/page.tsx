import { Suspense } from 'react';
import ReportPage from './client';

export const instant = false;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Suspense fallback={<div className="min-h-screen grid place-items-center muted">Loading report…</div>}><ReportPage id={id} /></Suspense>;
}
