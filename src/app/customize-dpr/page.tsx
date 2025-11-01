
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';
import { generateDprAction } from '@/app/actions';

const dprChapters = [
    { key: 'executiveSummary', title: 'Executive Summary', prompt: 'Summarize the entire business project, including its mission, product/service, target market, and financial highlights. This should be a concise overview.' },
    { key: 'projectIntroduction', title: 'Project Introduction', prompt: 'Provide a detailed background of the project. Explain the problem it solves, its objectives, and its scope.' },
    { key: 'promoterDetails', title: 'Promoter Details', prompt: 'Describe the background of the promoter(s), including their experience, qualifications, and role in the project. Use the promoter\'s name provided.' },
    { key: 'businessModel', title: 'Business Model', prompt: 'Explain how the business will operate. Detail the revenue streams, value proposition, and key activities.' },
    { key: 'marketAnalysis', title: 'Market Analysis', prompt: 'Analyze the industry, market size, trends, and the target audience. Include an assessment of the competition.' },
    { key: 'locationAndSite', title: 'Location and Site', prompt: 'Describe the proposed location for the business, justifying its suitability in terms of infrastructure, accessibility, and market proximity.' },
    { key: 'technicalFeasibility', title: 'Technical Feasibility', prompt: 'Detail the technology, machinery, and processes required for production or service delivery. Include raw material sourcing.' },
    { key: 'implementationSchedule', title: 'Implementation Schedule', prompt: 'Outline a timeline for key project milestones, from setup to launch and full operation.' },
    { key: 'financialProjections', title: 'Financial Projections', prompt: 'Generate realistic financial projections including project cost, means of finance, cost breakdown, yearly sales and profit, profitability analysis, cash flow, loan repayment, and break-even analysis. This must be a detailed, multi-part section.' },
    { key: 'swotAnalysis', title: 'SWOT Analysis', prompt: 'Conduct a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the business.' },
    { key: 'regulatoryCompliance', title: 'Regulatory & Legal Compliance', prompt: 'List the licenses, permits, and other legal requirements applicable to the business in India.' },
    { key: 'riskAssessment', title: 'Risk Assessment', prompt: 'Identify potential risks (market, operational, financial) and propose mitigation strategies.' },
    { key: 'annexures', title: 'Annexures', prompt: 'List any supporting documents that would be attached, such as market research data, promoter CVs, or quotations for machinery.' }
];


type DprReport = {
    [key: string]: string | object;
};

function CustomizeDPRContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [step, setStep] = useState(0); // 0 = purpose, 1 = section-by-section
  const [currentChapter, setCurrentChapter] = useState(0);
  const [analysis, setAnalysis] = useState<GenerateInvestmentIdeaAnalysisOutput | null>(null);
  const [promoterName, setPromoterName] = useState('');

  const [report, setReport] = useState<DprReport>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const ideaTitle = searchParams.get('idea');
    const name = searchParams.get('name');
    const storedAnalysis = localStorage.getItem('dprAnalysis');

    if (storedAnalysis) {
      try {
        const parsed = JSON.parse(storedAnalysis);
        if (parsed.title === ideaTitle) {
          setAnalysis(parsed);
        } else {
             throw new Error("Analysis data mismatch.");
        }
      } catch (e) {
        setError('Failed to load business analysis data. Please start over.');
        toast({ variant: 'destructive', description: 'Corrupted analysis data.' });
      }
    } else {
      setError('No business analysis found. Please analyze an idea first.');
      toast({ variant: 'destructive', description: 'No analysis data found.' });
    }
    
    if (name) {
      setPromoterName(name);
    }

  }, [searchParams, toast]);

  const handleAutoGenerate = async () => {
    if (!analysis || !promoterName) return;

    setIsGenerating(true);
    const chapter = dprChapters[currentChapter];

    try {
        const result = await generateDprAction({
            idea: analysis,
            promoterName: promoterName,
            section: chapter.key,
            prompt: chapter.prompt,
        });

        if (result.success) {
            const content = result.data.content;
            setReport(prev => ({...prev, [chapter.key]: content}));
        } else {
            throw new Error(result.error || `Failed to generate ${chapter.title}`);
        }

    } catch (e: any) {
        toast({
            variant: 'destructive',
            title: `Error Generating ${chapter.title}`,
            description: e.message
        });
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<Textarea>) => {
      const chapterKey = dprChapters[currentChapter].key;
      setReport(prev => ({...prev, [chapterKey]: e.target.value}));
  }

  const handleNext = () => {
    if (currentChapter < dprChapters.length - 1) {
      setCurrentChapter(prev => prev + 1);
    } else {
      // Final step, save to local storage and navigate to report page
      localStorage.setItem('generatedDPR', JSON.stringify(report));
      router.push(`/dpr-report?idea=${encodeURIComponent(analysis?.title || '')}`);
    }
  };

  const handleBack = () => {
    if (currentChapter > 0) {
      setCurrentChapter(prev => prev - 1);
    }
  };

  const progress = ((currentChapter + 1) / dprChapters.length) * 100;
  
  if (error) {
      return (
          <div className="text-center py-10">
              <p className="text-destructive font-semibold">An error occurred</p>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button variant="outline" onClick={() => router.push('/brainstorm')} className="mt-4">
                  Back to Brainstorm
              </Button>
          </div>
      );
  }

  if (!analysis) {
      return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (step === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-3xl font-bold">What is the purpose of this report?</h1>
        <p className="text-muted-foreground">
          Select a format below. The AI will tailor the DPR structure and tone for your chosen purpose.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
                className="p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => setStep(1)}
            >
                <Banknote className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg">Bank Loan</h3>
            </Card>
             <Card className="p-6 text-center cursor-not-allowed bg-muted/50 opacity-50">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg text-muted-foreground">Govt. Scheme</h3>
                <p className="text-xs text-muted-foreground">(Coming Soon)</p>
            </Card>
             <Card className="p-6 text-center cursor-not-allowed bg-muted/50 opacity-50">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg text-muted-foreground">Social Article</h3>
                 <p className="text-xs text-muted-foreground">(Coming Soon)</p>
            </Card>
        </div>
      </div>
    );
  }

  const chapter = dprChapters[currentChapter];
  const contentForChapter = report[chapter.key];
  const isFinancials = chapter.key === 'financialProjections';

  return (
    <div className="space-y-6">
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/brainstorm">
            <ArrowLeft className="mr-2" />
            Back to Brainstorm
          </Link>
        </Button>
        
        <Progress value={progress} />

        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">{`${currentChapter + 1}. ${chapter.title}`}</CardTitle>
                <CardDescription>{chapter.prompt}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Button onClick={handleAutoGenerate} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isGenerating ? `Generating...` : `Auto-generate with AI`}
                    </Button>
                    <Textarea 
                        value={typeof contentForChapter === 'string' ? contentForChapter : JSON.stringify(contentForChapter, null, 2)}
                        onChange={(e) => handleTextChange(e as any)}
                        rows={isFinancials ? 20 : 10}
                        placeholder={isFinancials ? 'Financial data will be generated as a JSON object.' : 'AI-generated content will appear here, or you can write your own.'}
                        disabled={isFinancials && isGenerating}
                    />
                     {isFinancials && <p className="text-sm text-muted-foreground">The financial projections section contains complex data and should be auto-generated. Manual editing is not recommended.</p>}
                </div>
            </CardContent>
        </Card>
        <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={currentChapter === 0}>
                <ArrowLeft className="mr-2" /> Back
            </Button>
            <Button onClick={handleNext} disabled={!contentForChapter}>
                 {currentChapter === dprChapters.length - 1 ? 'Finish & View Report' : 'Next'} <ArrowRight className="ml-2" />
            </Button>
        </div>
    </div>
  );
}


export default function CustomizeDPRPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CustomizeDPRContent />
        </Suspense>
    )
}
