
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  File,
  Globe,
  Presentation,
  Share2,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function GenerateDPRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idea = searchParams.get('idea');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200">Generate</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Your document is just a click away.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Presentation", icon: Presentation, disabled: true },
          { label: "Webpage", icon: Globe, disabled: true },
          { label: "Document", icon: File, disabled: false },
          { label: "Social", icon: Share2, disabled: true },
        ].map(({ label, icon: Icon, disabled }) => (
          <Card
            key={label}
            className={cn(
              "p-4 flex flex-col items-center justify-center gap-2 transition-all",
              !disabled && "ring-2 ring-primary border-primary bg-primary/10",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-default"
            )}
          >
            <Icon className={cn("h-6 w-6", !disabled ? "text-primary" : "text-gray-500")} />
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{label}</span>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Your Business Idea:</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            {idea || "No idea provided. Please go back and specify one."}
          </p>
        </CardContent>
      </Card>
      
      <div className="text-center pt-4">
        <Button
          size="lg"
          disabled={!idea}
          asChild
        >
          <Link href={`/customize-dpr?idea=${encodeURIComponent(idea || '')}`}>
              Continue
          </Link>
        </Button>
      </div>
    </div>
  );
}


export default function GenerateDPRPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 background-gradient">
        <GenerateDPRContent />
      </div>
    </Suspense>
  );
}

