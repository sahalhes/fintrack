'use client';

import ClientOnly from '@/components/ClientOnly';
import { InsightView } from '@/components/InsightView';

export default function InsightPage() {
  return (
    <ClientOnly
      fallback={
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg dark:shadow-neutral-900/50 p-6">
            <div className="text-center py-12 text-gray-500 dark:text-neutral-400">Loading...</div>
          </div>
        </div>
      }
    >
      <InsightView />
    </ClientOnly>
  );
}
