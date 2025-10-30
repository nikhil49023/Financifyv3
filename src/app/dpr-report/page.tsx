'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, FileDown, ArrowLeft, Loader2, Sparkles, Send, Edit, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { ProjectCostPieChart, FinancialProjectionsBarChart } from '@/components/financify/dpr-charts';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateDprAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

type ReportData = {
  [key: string]: any;
};

const dprChapterTitles = [
  'Executive Summary',
  'Project Introduction',
  'Promoter Details',
  'Business Model',
  'Market Analysis',
  'Location and Site',
  'Technical Feasibility',
  'Implementation Schedule',
  'Financial Projections',
  'SWOT Analysis',
  'Regulatory Compliance',
  'Risk Assessment',
  'Annexures',
];


// A simple parser to convert markdown-like strings to HTML for contentEditable
const parseToHtml = (text: string) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]/g, '<strong class="text-red-500 font-bold">[$1]</strong>')
    .replace(/\n/g, '<br />');
};

const EditableContent = ({ initialContent, onSave, isManuallyEditing, className }: { initialContent: string, onSave: (newContent: string) => void, isManuallyEditing: boolean, className?: string }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleBlur = () => {
    if (contentRef.current) {
      onSave(contentRef.current.innerHTML); // Save HTML content
    }
  };

  useEffect(() => {
    if (isManuallyEditing && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isManuallyEditing]);
  
  return (
    <div
      ref={contentRef}
      contentEditable={isManuallyEditing}
      onBlur={handleBlur}
      dangerouslySetInnerHTML={{ __html: parseToHtml(initialContent) }}
      className={cn(
        'outline-none text-muted-foreground whitespace-pre-line leading-relaxed',
        isManuallyEditing && 'ring-2 ring-primary/20 rounded-md p-2 -m-2 transition-shadow',
        className
      )}
    />
  );
};

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
            toast({ variant: 'destructive', title: 'Please provide a rating before submitting.' });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'dpr-feedback'), {
                userId: user.uid,
                ideaTitle: ideaTitle,
                rating: rating,
                comment: comment,
                submittedAt: serverTimestamp()
            });
            toast({ title: 'Feedback Submitted', description: 'Thank you for helping us improve!' });
            setIsSubmitted(true);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit your feedback. Please try again.' });
            console.error("Error submitting feedback:", e);
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
                <CardDescription>Your feedback helps us improve the AI generation quality.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={cn(
                                'h-8 w-8 cursor-pointer transition-colors',
                                (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'
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
                    onChange={(e) => setComment(e.target.value)}
                />
                <Button onClick={handleSubmitFeedback} disabled={isSubmitting || rating === 0}>
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
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const ideaTitle = searchParams.get('idea');
  const theme = searchParams.get('theme');
  const promoterName = user?.displayName || 'Entrepreneur';

  useEffect(() => {
    if (theme) {
      document.documentElement.className = theme;
    }
    return () => {
      document.documentElement.className = ''; // Reset on unmount
    }
  }, [theme]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!user || !ideaTitle) {
        setError('Could not load report. User or idea is missing.');
        setIsLoading(false);
        if (!user) router.push('/');
        return;
      }
      setIsLoading(true);

      const storedReport = localStorage.getItem('generatedDPR');
      if (storedReport) {
        try {
          setReport(JSON.parse(storedReport));
        } catch (e) {
          setError('Failed to parse the generated report data.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setError('No generated report data found. Please generate the DPR first.');
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [user, ideaTitle, router]);

  const handleExport = () => {
    window.print();
  };

  const handleContentUpdate = (sectionKey: string, newContent: string) => {
    setReport(prev => {
        if (!prev) return null;
        const keys = sectionKey.split('.');
        const updatedReport = { ...prev };
        
        if (keys.length > 1) {
            updatedReport[keys[0]] = { ...updatedReport[keys[0]], [keys[1]]: newContent };
        } else {
            updatedReport[sectionKey] = newContent;
        }

        localStorage.setItem('generatedDPR', JSON.stringify(updatedReport));
        return updatedReport;
    });
  };

  const Section = ({
    title,
    content,
    sectionKey,
    isLoading,
    className = '',
    onRegenerate,
  }: {
    title: string;
    content?: any;
    sectionKey: string;
    isLoading: boolean;
    className?: string;
    onRegenerate: (sectionTitle: string, newContent: any) => void;
  }) => {
    const [isAiEditing, setIsAiEditing] = useState(false);
    const [isManuallyEditing, setIsManuallyEditing] = useState(false);
    const [editQuery, setEditQuery] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);
    const { toast } = useToast();

    const handleRegenerate = async () => {
        if (!editQuery || !ideaTitle) return;
        setIsRegenerating(true);
        try {
            const currentContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content);

            const result = await generateDprAction({
                idea: ideaTitle,
                promoterName: promoterName,
                sectionContext: {
                    sectionToUpdate: title,
                    currentContent: currentContent,
                    userRequest: editQuery,
                }
            });

            if (result.success) {
                const updatedSectionKey = Object.keys(result.data).find(k => k.toLowerCase().replace(/ /g, '') === title.toLowerCase().replace(/ /g, '')) || sectionKey;
                onRegenerate(updatedSectionKey, result.data[updatedSectionKey]);
                toast({ title: 'Section Updated', description: `"${title}" has been regenerated based on your request.` });
                setIsAiEditing(false);
                setEditQuery('');
            } else {
                throw new Error(result.error);
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Regeneration Failed', description: e.message });
        } finally {
            setIsRegenerating(false);
        }
    };

    const renderContent = () => {
      if (isLoading || isRegenerating) {
        return (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        );
      }

      if (title.includes('Financial Projections') && typeof content === 'object') {
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Financial Summary</h3>
              <EditableContent isManuallyEditing={isManuallyEditing} initialContent={content.summaryText} onSave={(newHtml) => handleContentUpdate(`${sectionKey}.summaryText`, newHtml)} />
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
            <div>
              <h3 className="text-lg font-semibold mb-2">Means of Finance</h3>
              <EditableContent isManuallyEditing={isManuallyEditing} initialContent={content.meansOfFinance} onSave={(newHtml) => handleContentUpdate(`${sectionKey}.meansOfFinance`, newHtml)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Profitability Analysis</h3>
              <EditableContent isManuallyEditing={isManuallyEditing} initialContent={content.profitabilityAnalysis} onSave={(newHtml) => handleContentUpdate(`${sectionKey}.profitabilityAnalysis`, newHtml)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Cash Flow Statement</h3>
              <EditableContent isManuallyEditing={isManuallyEditing} initialContent={content.cashFlowStatement} onSave={(newHtml) => handleContentUpdate(`${sectionKey}.cashFlowStatement`, newHtml)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Loan Repayment Schedule</h3>
              <EditableContent isManuallyEditing={isManuallyEditing} initialContent={content.loanRepaymentSchedule} onSave={(newHtml) => handleContentUpdate(`${sectionKey}.loanRepaymentSchedule`, newHtml)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Break-Even Analysis</h3>
              <EditableContent isManuallyEditing={isManuallyEditing} initialContent={content.breakEvenAnalysis} onSave={(newHtml) => handleContentUpdate(`${sectionKey}.breakEvenAnalysis`, newHtml)} />
            </div>
          </div>
        );
      }
      
      return (
        <EditableContent
          isManuallyEditing={isManuallyEditing}
          initialContent={content || 'No content generated for this section.'}
          onSave={(newHtml) => handleContentUpdate(sectionKey, newHtml)}
        />
      );
    };

    return (
      <div className={cn("space-y-4 print-break-before", className)}>
        <CardHeader className="p-0 mb-6 border-b pb-4">
          <CardTitle className="text-2xl md:text-3xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
        <div className="flex justify-end items-center gap-2 no-print mt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsManuallyEditing(!isManuallyEditing)}>
                <Edit className="mr-2" />
                Edit Manually
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsAiEditing(!isAiEditing)}>
                <Sparkles className="mr-2" />
                Regenerate with AI
            </Button>
        </div>
        {isAiEditing && (
            <div className="p-2 space-y-2 no-print">
                <div className="flex gap-2">
                    <Input 
                        placeholder={`e.g., "Make this section more detailed"`}
                        value={editQuery}
                        onChange={(e) => setEditQuery(e.target.value)}
                        disabled={isRegenerating}
                    />
                    <Button onClick={handleRegenerate} disabled={isRegenerating || !editQuery}>
                        {isRegenerating ? <Loader2 className="animate-spin" /> : <Send />}
                    </Button>
                </div>
            </div>
        )}
      </div>
    )
  };

  const handleSectionRegenerate = (sectionKey: string, newContent: any) => {
    setReport(prevReport => {
      if (!prevReport) return null;
      const updatedReport = {
        ...prevReport,
        [sectionKey]: newContent,
      };
      // Also update localStorage
      localStorage.setItem('generatedDPR', JSON.stringify(updatedReport));
      return updatedReport;
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 @container bg-background py-8">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1in 1in 1in 1.5in;
            @top-center {
              content: 'Detailed Project Report: ${ideaTitle || ''}';
              font-size: 10pt;
              color: #666;
            }
            @bottom-center {
              content: 'Page ' counter(page);
              font-size: 10pt;
              color: #666;
            }
          }
          
          html, body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }

          body * {
             visibility: hidden;
          }
          
          #print-section, #print-section * {
            visibility: visible;
          }

          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }

          .a4-container {
            border: none;
            box-shadow: none;
            background: white !important;
            float: none;
            width: 100%;
            min-height: auto;
          }

          .a4-container::after {
            content: 'Artha';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.05);
            pointer-events: none;
            z-index: -1;
          }

          .no-print {
            display: none !important;
          }

          .print-break-before {
            page-break-before: always;
          }

          .print-break-after {
            page-break-after: always;
          }

          .print-no-break, .print-break-inside-avoid {
            page-break-inside: avoid;
          }

          .print-cover-page {
             height: 80vh;
             display: flex;
             flex-direction: column;
             justify-content: center;
             align-items: center;
             text-align: center;
             page-break-after: always;
          }

           .print-toc {
             page-break-after: always;
           }
           .print-toc h1 {
            font-size: 18pt;
            margin-bottom: 2rem;
           }
           .print-toc table {
             width: 100%;
             border-collapse: collapse;
           }
           .print-toc td {
             padding: 0.5rem 0;
             border-bottom: 1px dotted #ccc;
           }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row justify-between items-start no-print container mx-auto max-w-[210mm] px-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText />
            Detailed Project Report
          </h1>
          <p className="text-muted-foreground max-w-2xl truncate">
            Final compiled report for: <span className="font-semibold">{ideaTitle}</span>
          </p>
        </div>
        <Button variant="ghost" asChild className="-ml-4 mt-2 sm:mt-0">
          <Link href="/brainstorm">
            <ArrowLeft className="mr-2" />
            Back to Brainstorm
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 no-print container mx-auto max-w-[210mm] px-4">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isLoading || !!error}
        >
          <FileDown className="mr-2" /> Export to PDF
        </Button>
      </div>

      {error && !isLoading && (
        <Card className="text-center py-10 bg-destructive/10 border-destructive no-print container mx-auto max-w-[210mm]">
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Error Loading Report</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <p className="text-destructive">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/brainstorm">Start Over</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div id="print-section">
        <div className="a4-container bg-card shadow-lg">
            {/* Cover Page for Print */}
            <div className="print-cover-page hidden print:flex">
                <div>
                    <h1 style={{fontSize: '28pt', fontWeight: 'bold', margin: '0'}}>{ideaTitle}</h1>
                    <p style={{fontSize: '14pt', marginTop: '1rem'}}>Detailed Project Report</p>
                    <div style={{marginTop: '20rem', fontSize: '12pt'}}>
                        <p>Prepared for:</p>
                        <p style={{fontWeight: 'bold'}}>{promoterName}</p>
                    </div>
                </div>
            </div>

            {/* Table of Contents for Print */}
            <div className="print-toc hidden print:block">
                <div>
                    <h1>Table of Contents</h1>
                    <table>
                        <tbody>
                            {dprChapterTitles.map((title, index) => (
                                <tr key={index}>
                                    <td>{index + 1}. {title}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isLoading &&
              dprChapterTitles.map((title, index) => (
                <div key={index} className="pt-12">
                   <CardHeader className="p-0 mb-6 border-b pb-4">
                      <CardTitle className="text-xl md:text-2xl">{`${index + 1}. ${title}`}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                </div>
            ))}
            
            {report && !isLoading &&
              dprChapterTitles.map((title, index) => {
                const key = Object.keys(report).find(k => k.toLowerCase().replace(/ /g, '') === title.toLowerCase().replace(/ /g, '')) || title;
                const content = report[key];
                const sectionTitle = `${index + 1}. ${title}`;

                return (
                  <Section
                    key={key}
                    sectionKey={key}
                    title={sectionTitle}
                    content={content}
                    isLoading={isLoading}
                    onRegenerate={(updatedKey, updatedContent) => handleSectionRegenerate(updatedKey, updatedContent)}
                  />
                );
              })}
        </div>
      </div>
      {report && !isLoading && (
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
