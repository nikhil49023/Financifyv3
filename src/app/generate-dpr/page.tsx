
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  File,
  Loader2,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronsRight,
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
import type { GenerateDprOutput } from '@/ai/schemas/dpr';
import { Input } from '@/components/ui/input';

const dprSections: (keyof GenerateDprOutput)[] = [
    'executiveSummary',
    'projectIntroduction',
    'promoterDetails',
    'businessModel',
    'marketAnalysis',
    'locationAndSite',
    'technicalFeasibility',
    'implementationSchedule',
    'financialProjections',
    'swotAnalysis',
    'regulatoryCompliance',
    'riskAssessment',
    'annexures'
];

const formatSectionTitle = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function GenerateDPRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<GenerateInvestmentIdeaAnalysisOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('freeform');

  // State for card-by-card generation
  const [dprContent, setDprContent] = useState<Partial<GenerateDprOutput>>({});
  const [sectionPrompts, setSectionPrompts] = useState<Record<string, string>>({});
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);


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
      toast({ variant: 'destructive', title: 'Error', description: 'No business idea analysis found. Please analyze an idea first.' });
      router.push('/brainstorm');
    }
  }, [router, toast]);

  const handleGenerateFreeform = async () => {
    if (!analysis || !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Missing user or idea information.' });
        router.push('/brainstorm');
        return;
    }
    
    setIsGenerating(true);
    toast({ title: 'Generating Full DPR', description: 'This may take a minute or two. Please wait...' });

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

        router.push(`/dpr-report?idea=${encodeURIComponent(analysis.title)}`);

    } catch (e: any) {
        console.error('DPR Generation failed:', e);
        toast({
            variant: 'destructive',
            title: `DPR Generation Failed`,
            description: e.message,
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleGenerateSection = async (sectionKey: keyof GenerateDprOutput) => {
    if (!analysis || !user) return;
    
    setGeneratingSection(sectionKey);
    toast({ title: `Generating ${formatSectionTitle(sectionKey)}...` });
    
    try {
      const result = await generateDprAction({
        idea: analysis,
        promoterName: user.displayName || 'Entrepreneur',
        sectionContext: {
            sectionToUpdate: formatSectionTitle(sectionKey),
            currentContent: 'N/A', // Not needed for initial section generation
            userRequest: sectionPrompts[sectionKey] || `Generate the ${formatSectionTitle(sectionKey)} section.`
        }
      });
      
      if (result.success && result.data[sectionKey]) {
        setDprContent(prev => ({ ...prev, [sectionKey]: result.data[sectionKey] }));
        toast({ title: `${formatSectionTitle(sectionKey)} Generated!` });
      } else {
        throw new Error(result.error || `Could not generate section: ${formatSectionTitle(sectionKey)}`);
      }
    } catch(e: any) {
        toast({ variant: 'destructive', title: 'Generation Failed', description: e.message });
    } finally {
        setGeneratingSection(null);
    }
  };

  const handleAssembleDPR = () => {
    if (!analysis) return;
    
    const assembledDPR = dprSections.reduce((acc, key) => {
        acc[key] = dprContent[key] || `[Content for ${formatSectionTitle(key)} not generated yet]`;
        return acc;
    }, {} as Record<keyof GenerateDprOutput, any>);

    localStorage.setItem('generatedDPR', JSON.stringify(assembledDPR));
    toast({ title: 'DPR Assembled!', description: 'Your report is ready for final review.' });
    router.push(`/dpr-report?idea=${encodeURIComponent(analysis.title)}`);
  };

  const isCardByCardComplete = dprSections.every(key => dprContent[key]);


  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
        <header className="flex items-center justify-between p-3 border-b bg-white dark:bg-gray-800">
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2" /> Back
            </Button>
            <h1 className="text-lg font-semibold">DPR Prompt Editor</h1>
            <div className="w-24"></div>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 overflow-y-auto">
            <div className="md:col-span-4 lg:col-span-3 space-y-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Text Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Amount of text</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Minimal', 'Concise', 'Detailed', 'Extensive'].map(opt => (
                                    <Button key={opt} variant={'outline'}>
                                        {opt}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="write-for">Write for...</Label>
                            <Textarea id="write-for" rows={2} defaultValue="Bank managers and investors" />
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

            <div className="md:col-span-8 lg:col-span-6 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="freeform">Freeform</TabsTrigger>
                        <TabsTrigger value="card-by-card">Card-by-Card</TabsTrigger>
                    </TabsList>
                    <TabsContent value="freeform" className="flex-1 mt-4">
                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>Core Business Idea</CardTitle>
                                <CardDescription>This summary will be used to generate the entire DPR in one go.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <Textarea 
                                    className="w-full h-full resize-none text-base"
                                    value={analysis?.summary || 'Loading...'}
                                    readOnly
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="card-by-card" className="flex-1 mt-4 space-y-4 overflow-y-auto">
                        {dprSections.map(key => (
                             <Card key={key} className={cn(dprContent[key] && 'border-green-500')}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{formatSectionTitle(key)}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor={`prompt-${key}`}>Prompt for this section</Label>
                                        <Input 
                                            id={`prompt-${key}`}
                                            placeholder={`Optional: e.g., "Emphasize the market gap for this section"`}
                                            value={sectionPrompts[key] || ''}
                                            onChange={(e) => setSectionPrompts(prev => ({...prev, [key]: e.target.value}))}
                                            disabled={generatingSection === key}
                                        />
                                        <Button onClick={() => handleGenerateSection(key)} disabled={generatingSection === key}>
                                            {generatingSection === key ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                                            Generate Section
                                        </Button>
                                    </div>
                                    {dprContent[key] && (
                                        <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground line-clamp-2">
                                            {typeof dprContent[key] === 'string' ? dprContent[key] : 'Financial data generated.'}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
            
            <div className="hidden lg:block lg:col-span-3 space-y-6">
                 <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Additional instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea placeholder="Optional instructions for the AI" />
                    </CardContent>
                </Card>
                <Alert>
                    <AlertTitle>Tips</AlertTitle>
                    <AlertDescription>
                        Use 'Freeform' for a quick draft, or 'Card-by-card' for detailed control over each section of your report.
                    </AlertDescription>
                </Alert>
            </div>
        </div>

        <footer className="flex items-center justify-center p-3 border-t bg-white dark:bg-gray-800">
             {activeTab === 'freeform' ? (
                <Button size="lg" onClick={handleGenerateFreeform} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                    {isGenerating ? 'Generating...' : 'Generate Full Report'}
                </Button>
             ) : (
                <Button size="lg" onClick={handleAssembleDPR} disabled={!isCardByCardComplete}>
                    <ChevronsRight className="mr-2"/>
                    Assemble & View DPR
                </Button>
             )}
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

    