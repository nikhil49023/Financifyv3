
'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  FileText,
  FileDown,
  ArrowLeft,
  Loader2,
  Star,
  Save,
  Wand2,
  Sparkles,
  Edit,
  X,
  ImageIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import {
  ProjectCostPieChart,
  FinancialProjectionsBarChart,
} from '@/components/financify/dpr-charts';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';
import { FormattedText } from '@/components/financify/formatted-text';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { generateDprAction } from '../actions';
import type { GenerateInvestmentIdeaAnalysisOutput } from '@/ai/schemas/investment-idea-analysis';
import RichTextEditor from '@/components/financify/rich-text-editor';


const db = getFirestore(app);
const storage = getStorage(app);


type ReportData = {
  [key: string]: any;
};

const dprChapters = [
  {key: 'executiveSummary', title: 'Executive Summary', prompt: 'Summarize the entire business project, including its mission, product/service, target market, and financial highlights. This should be a concise overview.'},
  {key: 'projectIntroduction', title: 'Project Introduction', prompt: 'Provide a detailed background of the project. Explain the problem it solves, its objectives, and its scope.'},
  {key: 'promoterDetails', title: 'Promoter Details', prompt: 'Describe the background of the promoter(s), including their experience, qualifications, and role in the project. Use the promoter\'s name provided.'},
  {key: 'businessModel', title: 'Business Model', prompt: 'Explain how the business will operate. Detail the revenue streams, value proposition, and key activities.'},
  {key: 'marketAnalysis', title: 'Market Analysis', prompt: 'Analyze the industry, market size, trends, and the target audience. Include an assessment of the competition.'},
  {key: 'locationAndSite', title: 'Location and Site', prompt: 'Describe the proposed location for the business, justifying its suitability in terms of infrastructure, accessibility, and market proximity.'},
  {key: 'technicalFeasibility', title: 'Technical Feasibility', prompt: 'Detail the technology, machinery, and processes required for production or service delivery. Include raw material sourcing.'},
  {key: 'implementationSchedule', title: 'Implementation Schedule', prompt: 'Outline a timeline for key project milestones, from setup to launch and full operation.'},
  {key: 'financialProjections', title: 'Financial Projections', prompt: 'Generate realistic financial projections including project cost, means of finance, cost breakdown, yearly sales and profit, profitability analysis, cash flow, loan repayment, and break-even analysis. This must be a detailed, multi-part JSON object.'},
  {key: 'swotAnalysis', title: 'SWOT Analysis', prompt: 'Conduct a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the business.'},
  {key: 'regulatoryCompliance', title: 'Regulatory & Legal Compliance', prompt: 'List the licenses, permits, and other legal requirements applicable to the business in India.'},
  {key: 'riskAssessment', title: 'Risk Assessment', prompt: 'Identify potential risks (market, operational, financial) and propose mitigation strategies.'},
  {key: 'annexures', title: 'Annexures', prompt: 'List any supporting documents that would be attached, such as market research data, promoter CVs, or quotations for machinery.'},
];

const FeedbackSection = ({ ideaTitle }: { ideaTitle: string | null }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!user || !ideaTitle || rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Please provide a rating before submitting.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'dpr-feedback'), {
        userId: user.uid,
        ideaTitle: ideaTitle,
        rating: rating,
        comment: comment,
        submittedAt: serverTimestamp(),
      });
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for helping us improve!',
      });
      setIsSubmitted(true);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your feedback. Please try again.',
      });
      console.error('Error submitting feedback:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="no-print bg-green-50 border-green-200">
        <CardHeader className="text-center">
          <CardTitle>Thank you for your feedback!</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle>Rate this DPR</CardTitle>
        <CardDescription>
          Your feedback helps us improve the AI generation quality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={cn(
                'h-8 w-8 cursor-pointer transition-colors',
                (hoverRating || rating) >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-muted-foreground/50'
              )}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <Textarea
          placeholder="Optional: Add any comments or suggestions..."
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <Button
          onClick={handleSubmitFeedback}
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
};


function DPRReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<GenerateInvestmentIdeaAnalysisOutput | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeToolkit, setActiveToolkit] = useState<string | null>(null);
  const { user } = useAuth();

  const [isEditMode, setIsEditMode] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUploadChapter, setImageUploadChapter] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const ideaTitle = searchParams.get('idea');
  const promoterName = user?.displayName || 'Entrepreneur';

  useEffect(() => {
    const fetchReport = () => {
      if (!user || !ideaTitle) {
        setError('Could not load report. User or idea is missing.');
        setIsLoading(false);
        if (!user) router.push('/');
        return;
      }
      setIsLoading(true);

      const storedReport = localStorage.getItem('generatedDPR');
      const storedAnalysis = localStorage.getItem('dprAnalysis');
      
      if (storedReport) {
        try {
          setReport(JSON.parse(storedReport));
        } catch (e) {
          setError('Failed to parse the generated report data.');
        }
      } else {
        setError(
          'No generated report data found. Please generate the DPR first.'
        );
      }

       if (storedAnalysis) {
        try {
          setAnalysis(JSON.parse(storedAnalysis));
        } catch (e) {
          setError('Failed to parse the business analysis data.');
        }
      } else {
        setError('No business analysis found. Please analyze an idea first.');
      }
      setIsLoading(false);
    };

    fetchReport();
  }, [user, ideaTitle, router]);

  const handleExport = () => {
    window.print();
  };

  const handleSaveChanges = () => {
    localStorage.setItem('generatedDPR', JSON.stringify(report));
    toast({ title: "Saved", description: "Your changes have been saved to this browser."});
    setIsEditMode(false);
  };

  const handleToolkitAction = async (chapterKey: string, isRefinement: boolean) => {
    if (!analysis || !promoterName || !report) return;

    setIsGenerating(true);
    setActiveToolkit(null);
    
    const chapter = dprChapters.find(c => c.key === chapterKey);
    if (!chapter) return;
    
    const existingContent = report[chapter.key];

    try {
        const result = await generateDprAction({
            idea: analysis,
            promoterName: promoterName,
            section: chapter.key,
            basePrompt: chapter.prompt,
            existingContent: isRefinement ? existingContent : undefined,
            refinementPrompt: isRefinement ? refinementPrompt : undefined,
        });

        if (result.success) {
            const content = result.data.content;
            setReport(prev => prev ? ({...prev, [chapter.key]: content}) : null);
            toast({ title: 'Success', description: `Content for "${chapter.title}" has been ${isRefinement ? 'refined' : 'generated'}.` });
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
        setRefinementPrompt('');
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !imageUploadChapter || !user || !report) {
      return;
    }
    const file = e.target.files[0];
    const chapterKey = imageUploadChapter;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `dpr-images/${user.uid}/${Date.now()}-${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      const imageHtml = `<img src="${imageUrl}" alt="Image for ${dprChapters.find(c=>c.key === chapterKey)?.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 1rem; margin-bottom: 1rem;" />`;

      const currentContent = report[chapterKey] || '';
      const newContent = currentContent + imageHtml;

      handleTextChange(chapterKey, newContent);
      toast({ title: 'Image Uploaded', description: 'The image has been embedded in the section.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the image.' });
    } finally {
      setIsUploading(false);
      setImageUploadChapter(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };
  
  const handleTextChange = (chapterKey: string, value: string) => {
    setReport(prev => prev ? ({...prev, [chapterKey]: value}) : null);
  }

  const Section = ({
    chapter,
  }: {
    chapter: (typeof dprChapters)[0];
  }) => {
    const content = report ? report[chapter.key] : null;
    const isFinancials = chapter.key === 'financialProjections';

    const renderEditableContent = () => {
      if (isFinancials) return null;
      if (isLoading || !report) {
        return <div className="space-y-2"><Skeleton className="h-40 w-full" /></div>;
      }
      return (
        <RichTextEditor
            content={content || ''}
            onChange={(newContent) => handleTextChange(chapter.key, newContent)}
            editable={!isGenerating && !isFinancials}
        />
      );
    }

    const renderStaticContent = () => {
      if (isFinancials) return null;
      if (isLoading || !report) {
        return <div className="space-y-2"><Skeleton className="h-40 w-full" /></div>;
      }
      return <FormattedText text={content || 'Not generated yet.'} />;
    };
    
    const renderFinancials = () => {
        if (typeof content !== 'object' || content === null) {
            return <p>Financial projection data is invalid or missing.</p>;
        }
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Financial Summary</h3>
                    <FormattedText text={content.summaryText} />
                </div>
                <div className="grid grid-cols-1 @lg:grid-cols-2 gap-6 print:grid-cols-2">
                    <div className="space-y-4 print-no-break">
                        <h3 className="text-lg font-semibold">Project Cost Breakdown</h3>
                        <ProjectCostPieChart data={content.costBreakdown} />
                    </div>
                    <div className="space-y-4 print-no-break">
                        <h3 className="text-lg font-semibold">Yearly Projections</h3>
                        <FinancialProjectionsBarChart data={content.yearlyProjections} />
                    </div>
                </div>
            </div>
        );
    };

    return (
      <div className="space-y-4">
        <CardHeader className="p-0 mb-4 border-b pb-4 flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl md:text-3xl">{chapter.title}</CardTitle>
          </div>
          {isEditMode && !isFinancials && (
           <div className="flex gap-2 no-print">
            <Button variant="outline" size="sm" onClick={() => { setImageUploadChapter(chapter.key); imageInputRef.current?.click(); }} disabled={isUploading}>
              {isUploading && imageUploadChapter === chapter.key ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ImageIcon className="mr-2" />}
              Image
            </Button>
            <Dialog open={activeToolkit === chapter.key} onOpenChange={(isOpen) => setActiveToolkit(isOpen ? chapter.key : null)}>
              <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                      <Wand2 className="mr-2" /> AI Toolkit
                  </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>AI Toolkit: {chapter.title}</DialogTitle>
                      <DialogDescription>
                      Use the AI to generate or refine the content for this section.
                      </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                      <div className="space-y-2">
                          <Button onClick={() => handleToolkitAction(chapter.key, false)} className="w-full" disabled={isGenerating}>
                              {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <Sparkles className="mr-2" />}
                              Re-generate Section
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">Replaces the current content with a new version from scratch.</p>
                      </div>
                      <div className="space-y-4">
                          <Label htmlFor="refinement-prompt">Refine with AI</Label>
                          <Textarea 
                              id="refinement-prompt"
                              value={refinementPrompt}
                              onChange={(e) => setRefinementPrompt(e.target.value)}
                              placeholder="e.g., 'Make this more formal', 'Add more financial details', 'Expand on the marketing plan...'"
                          />
                          <Button onClick={() => handleToolkitAction(chapter.key, true)} disabled={!refinementPrompt || !content || isGenerating} className="w-full">
                             {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : null}
                              Refine
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">Refines the existing text in the editor based on your prompt.</p>
                      </div>
                  </div>
              </DialogContent>
            </Dialog>
           </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
            {isFinancials ? renderFinancials() : (isEditMode ? renderEditableContent() : renderStaticContent())}
        </CardContent>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 @container bg-background py-8">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1in;
            @top-center { content: 'Detailed Project Report: ${ideaTitle || ''}'; font-size: 10pt; color: #666; }
            @bottom-center { content: 'Page ' counter(page); font-size: 10pt; color: #666; }
          }
          html, body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          .tiptap p, .tiptap h1, .tiptap h2, .tiptap h3, .tiptap ul, .tiptap li, .tiptap img { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-break-before { break-before: always; }
          .print-no-break { break-inside: avoid; }
          .print-cover-page { height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; break-after: always; }
          .tiptap { all: unset; }
          .ProseMirror { box-shadow: none; border: none; padding: 0; }
        }
      `}</style>
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start no-print container mx-auto max-w-[210mm] px-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><FileText /> Detailed Project Report</h1>
          <p className="text-muted-foreground max-w-2xl truncate">Final compiled report for: <span className="font-semibold">{ideaTitle}</span></p>
        </div>
        <Button variant="ghost" asChild className="-ml-4 mt-2 sm:mt-0"><Link href="/brainstorm"><ArrowLeft className="mr-2" /> Back to Brainstorm</Link></Button>
      </div>

      <div className="flex gap-2 no-print container mx-auto max-w-[210mm] px-4">
        {isEditMode ? (
          <>
            <Button onClick={handleSaveChanges} disabled={isLoading || !!error}><Save className="mr-2" /> Save & Exit</Button>
            <Button variant="ghost" onClick={() => setIsEditMode(false)}><X className="mr-2" /> Cancel</Button>
          </>
        ) : (
          <Button onClick={() => setIsEditMode(true)} disabled={isLoading || !!error}><Edit className="mr-2" /> Edit Report</Button>
        )}
        <Button variant="outline" onClick={handleExport} disabled={isLoading || !!error || isEditMode}><FileDown className="mr-2" /> Export to PDF</Button>
      </div>

      {error && !isLoading && (
        <Card className="text-center py-10 bg-destructive/10 border-destructive no-print container mx-auto max-w-[210mm]">
          <CardHeader><CardTitle>Error Loading Report</CardTitle></CardHeader>
          <CardContent><p className="text-destructive">{error}</p><Button asChild className="mt-4"><Link href="/brainstorm">Start Over</Link></Button></CardContent>
        </Card>
      )}

      {/* Report Content */}
      <div id="print-section">
        <div className="bg-card shadow-lg mx-auto w-[210mm] min-h-[297mm]">
          {/* Cover Page for Print */}
          <div className="print-cover-page hidden print:flex">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold">Detailed Project Report</h1>
                <h2 className="text-2xl text-muted-foreground">{analysis?.title}</h2>
                <p className="pt-12">Prepared for Banking & Financial Review</p>
                <p>By {promoterName}</p>
            </div>
          </div>
          
          {dprChapters.map((chapter, index) => (
            <div key={chapter.key} className={cn("px-8 md:px-12 py-8", index > 0 && "print-break-before")}>
              <Section chapter={chapter} />
            </div>
          ))}
        </div>
      </div>
      
      {report && !isLoading && !isEditMode &&(
        <div className="container mx-auto max-w-[210mm] px-4 py-8">
            <FeedbackSection ideaTitle={ideaTitle} />
        </div>
      )}
    </div>
  );
}

export default function DPRReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center h-full text-center no-print">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <h2 className="text-xl font-semibold">Loading Final Report...</h2>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      }
    >
      <DPRReportContent />
    </Suspense>
  );
}
