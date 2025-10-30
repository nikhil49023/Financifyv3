
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  File,
  Presentation,
  Share2,
  ArrowLeft,
  Sparkles,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { generateDprAction } from '@/app/actions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


function GenerateDPRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<GenerateInvestmentIdeaAnalysisOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [amountOfText, setAmountOfText] = useState('Concise');

  useEffect(() => {
    const storedAnalysis = localStorage.getItem('dprAnalysis');
    if (storedAnalysis) {
      try {
        setAnalysis(JSON.parse(storedAnalysis));
      } catch (e) {
        console.error("Failed to parse DPR analysis from localStorage", e);
        router.push('/brainstorm');
      }
    } else {
      // If no analysis is found, redirect back to brainstorm
      toast({ variant: 'destructive', title: 'Error', description: 'No business idea analysis found. Please analyze an idea first.' });
      router.push('/brainstorm');
    }
  }, [router, toast]);

  const handleGenerateDPR = async () => {
    if (!analysis || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Missing user or idea information.' });
        router.push('/brainstorm');
        return;
    }
    
    setIsGenerating(true);
    toast({ title: 'Generating DPR', description: 'This may take a minute or two. Please wait...' });

    try {
        const dprResult = await generateDprAction({
            idea: analysis,
            promoterName: user.displayName || 'Entrepreneur',
        });
  
        if (!dprResult.success) {
            throw new Error(`Failed to generate the final DPR: ${dprResult.error}`);
        }
  
        localStorage.setItem('generatedDPR', JSON.stringify(dprResult.data));
        toast({
            title: 'DPR Generated Successfully!',
            description: 'Your full Detailed Project Report is ready.',
        });

        // Redirect directly to the final report page
        router.push(`/dpr-report?idea=${encodeURIComponent(analysis.title)}`);

    } catch (e: any) {
        console.error('DPR Generation failed:', e);
        toast({
            variant: 'destructive',
            title: `DPR Generation Failed`,
            description: e.message,
        });
        setIsGenerating(false);
    }
  };

  const amountOptions = ['Minimal', 'Concise', 'Detailed', 'Extensive'];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="flex items-center justify-between p-3 border-b bg-white dark:bg-gray-800">
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2" /> Back
            </Button>
            <h1 className="text-lg font-semibold">Prompt editor</h1>
            <div className="w-24"></div> {/* Spacer */}
        </header>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 overflow-y-auto">
            {/* Left Panel: Settings */}
            <div className="md:col-span-4 lg:col-span-3 space-y-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Text content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Amount of text</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {amountOptions.map(opt => (
                                    <Button 
                                        key={opt} 
                                        variant={amountOfText === opt ? 'default' : 'outline'}
                                        onClick={() => setAmountOfText(opt)}
                                    >
                                        {opt}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="write-for">Write for...</Label>
                            <Textarea id="write-for" rows={4} defaultValue="Indian small-to-medium business owners and potential investors evaluating a DPR for a digital marketing agency." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tone">Tone</Label>
                            <Textarea id="tone" rows={2} defaultValue="Professional, confident, clear" />
                        </div>
                        <div className="space-y-2">
                            <Label>Output language</Label>
                            <Button variant="outline" className="w-full justify-between">
                                English (India) <ChevronDown />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Center Panel: Content */}
            <div className="md:col-span-8 lg:col-span-6 flex flex-col">
                <Tabs defaultValue="freeform" className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="freeform">Freeform</TabsTrigger>
                        <TabsTrigger value="card-by-card" disabled>Card-by-card</TabsTrigger>
                    </TabsList>
                    <TabsContent value="freeform" className="flex-1 mt-4">
                        <Textarea 
                            className="w-full h-full resize-none text-base"
                            value={analysis?.summary || 'Loading...'}
                            readOnly
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Right Panel: Instructions & Tips */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
                 <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Additional instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea placeholder="Optional" />
                    </CardContent>
                </Card>
                <Alert>
                    <AlertTitle>Tips</AlertTitle>
                    <AlertDescription>
                        Freeform lets you scale or shrink your content into as many cards as you want. For example, you can turn a long document into a concise presentation.
                    </AlertDescription>
                </Alert>
            </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-center p-3 border-t bg-white dark:bg-gray-800">
            <Button size="lg" onClick={handleGenerateDPR} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
        </footer>
    </div>
  );
}


export default function GenerateDPRPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <GenerateDPRContent />
    </Suspense>
  );
}
