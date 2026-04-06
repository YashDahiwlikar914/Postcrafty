import { redirect } from 'next/navigation';
import DraftsPageClient from '@/components/DraftsPageClient';
import { getSessionUserId } from '@/lib/server-auth';
import { getStyleProfile, isKvConfigured } from '@/lib/kv';

export default async function HistoryPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  const styleProfile = await getStyleProfile(userId);
  if (isKvConfigured() && !styleProfile) {
    redirect('/style-setup');
  }

  return <DraftsPageClient />;
}
