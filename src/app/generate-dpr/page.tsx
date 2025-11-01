
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  File,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { generateDprAction } from '@/app/actions';

function GenerateDPRContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<GenerateInvestmentIdeaAnalysisOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('Initializing generation...');


  useEffect(() => {
    const storedAnalysis = localStorage.getItem('dprAnalysis');
    if (storedAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(storedAnalysis);
        setAnalysis(parsedAnalysis);
      } catch (e) {
        console.error("Failed to parse DPR analysis from localStorage", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Corrupted analysis data. Please start over.' });
        router.push('/brainstorm');
      }
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No business idea analysis found. Please analyze an idea first.' });
      router.push('/brainstorm');
    }
  }, [router, toast]);

  useEffect(() => {
    if (!analysis || !user || isGenerating) {
        return;
    }
    
    const handleGenerateFullDPR = async () => {
        setIsGenerating(true);
        setStatusText('Warming up the AI engine...');
    
        try {
            const dprResult = await generateDprAction({
                idea: analysis,
                promoterName: user.displayName || 'Entrepreneur',
            });
            setStatusText('Compiling the final report...');
      
            if (!dprResult.success) {
                throw new Error(`Failed to generate the final DPR: ${dprResult.error}`);
            }
      
            localStorage.setItem('generatedDPR', JSON.stringify(dprResult.data));
            toast({
                title: 'DPR Generated Successfully!',
                description: 'Your full Detailed Project Report is ready.',
            });
    
            router.push(`/dpr-report?idea=${encodeURIComponent(analysis.title)}`);
    
        } catch (e: any) {
            console.error('DPR Generation failed:', e);
            toast({
                variant: 'destructive',
                title: `DPR Generation Failed`,
                description: e.message,
                duration: 9000,
            });
            // Redirect back to brainstorm on failure
            router.push('/brainstorm');
        } finally {
            setIsGenerating(false);
        }
    };

    handleGenerateFullDPR();

  }, [analysis, user, router, toast, isGenerating]);


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center p-4">
        <Card className="max-w-md w-full">
            <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                    <File className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Generating Your DPR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    The AI is crafting a complete Detailed Project Report for <strong className="text-primary">{analysis?.title || 'your idea'}</strong>. This might take a minute or two.
                </p>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p>{statusText}</p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-4">
                    <Sparkles className="h-4 w-4 text-amber-500"/>
                    <p className="text-sm font-semibold text-amber-600">Please do not navigate away from this page.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}


export default function GenerateDPRPage() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <GenerateDPRContent />
    </Suspense>
  );
}
