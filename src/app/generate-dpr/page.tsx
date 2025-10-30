
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  File,
  Presentation,
  Share2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';


function GenerateDPRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idea = searchParams.get('idea');
  const [analysis, setAnalysis] = useState<GenerateInvestmentIdeaAnalysisOutput | null>(null);

  useEffect(() => {
    const storedAnalysis = localStorage.getItem('dprAnalysis');
    if (storedAnalysis) {
      try {
        setAnalysis(JSON.parse(storedAnalysis));
      } catch (e) {
        console.error("Failed to parse DPR analysis from localStorage", e);
        router.push('/brainstorm');
      }
    } else if (idea) {
      // Fallback if localStorage is empty but we have an idea
      setAnalysis({ title: idea } as GenerateInvestmentIdeaAnalysisOutput);
    } else {
      router.push('/brainstorm');
    }
  }, [idea, router]);


  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-gray-200">Generate</h1>
        <p className="mt-2 text-md md:text-lg text-gray-600 dark:text-gray-400">Your document is just a click away.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Presentation", icon: Presentation, disabled: true },
          { label: "Document", icon: File, disabled: false },
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
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Your Business Idea:</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <h3 className="font-bold text-foreground">{analysis?.title || 'Loading...'}</h3>
            <p className="text-sm mt-1">{analysis?.summary}</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center pt-4">
        <Button
          size="lg"
          disabled={!analysis}
          asChild
        >
          <Link href={`/customize-dpr?idea=${encodeURIComponent(analysis?.title || '')}`}>
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
