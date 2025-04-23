'use client';

import { useParams, useRouter } from 'next/navigation';
import { WorkshopSummary } from '@/components/workshop-summary';
import { Button } from '@/components/ui/button';
import NextLink from 'next/link';

export default function WorkshopSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.id as string;
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6 flex space-x-2">
        <NextLink href={`/workshop/${workshopId}`} passHref>
          <Button variant="outline">← Back to Workshop</Button>
        </NextLink>
        <Button variant="outline" onClick={() => router.push('/')}>
          Back to frontpage
        </Button>
      </div>
      
      <WorkshopSummary workshopId={workshopId} />
    </div>
  );
} 