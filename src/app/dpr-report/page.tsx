
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, FileDown, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormattedText } from '@/components/financify/formatted-text';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { ProjectCostPieChart, FinancialProjectionsBarChart } from '@/components/financify/dpr-charts';


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


function DPRReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const ideaTitle = searchParams.get('idea');
  const promoterName = user?.displayName || 'Entrepreneur';

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

  const Section = ({
    title,
    content,
    isLoading,
    className = '',
  }: {
    title: string;
    content?: any;
    isLoading: boolean;
    className?: string;
  }) => (
    <Card className={`print:shadow-none print:border-none print-break-before ${className}`}>
      <CardHeader className="p-4 md:p-6">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : title.includes('Financial Projections') && typeof content === 'object' ? (
           <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Financial Summary</h3>
                    <FormattedText text={content.summaryText} />
                </div>
                <div className="grid grid-cols-1 @lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Project Cost Breakdown</h3>
                         <ProjectCostPieChart data={content.costBreakdown} />
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Yearly Projections</h3>
                        <FinancialProjectionsBarChart data={content.yearlyProjections} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Means of Finance</h3>
                    <FormattedText text={content.meansOfFinance} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Profitability Analysis</h3>
                    <FormattedText text={content.profitabilityAnalysis} />
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Cash Flow Statement</h3>
                    <FormattedText text={content.cashFlowStatement} />
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Loan Repayment Schedule</h3>
                    <FormattedText text={content.loanRepaymentSchedule} />
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Break-Even Analysis</h3>
                    <FormattedText text={content.breakEvenAnalysis} />
                </div>

           </div>
        ) : (
          <FormattedText
            text={content || 'No content generated for this section.'}
          />
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 @container">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
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
          
          body * {
            visibility: hidden;
          }
          #print-section,
          #print-section * {
            visibility: visible;
          }
          #print-section {
            position: relative;
            margin: 0;
            padding: 0.5cm;
            width: 100%;
            border: 1px solid #ccc;
            min-height: calc(100vh - 3cm); /* Adjust based on margin */
            float: none;
          }
          #print-section::after {
            content: 'EmpowerMint';
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
          .print-no-break {
            page-break-before: avoid;
          }
          .print-cover-page {
             height: 80vh;
             display: flex;
             flex-direction: column;
             justify-content: center;
             align-items: center;
             text-align: center;
             page-break-after: always; /* Ensure it's on its own page */
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

      <div className="flex justify-between items-start no-print">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText />
            Detailed Project Report
          </h1>
          <p className="text-muted-foreground max-w-2xl truncate">
            Final compiled report for: <span className="font-semibold">{ideaTitle}</span>
          </p>
        </div>
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/brainstorm">
            <ArrowLeft className="mr-2" />
            Back to Brainstorm
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 no-print">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isLoading || !!error}
        >
          <FileDown className="mr-2" /> Export to PDF
        </Button>
      </div>

      {error && !isLoading && (
        <Card className="text-center py-10 bg-destructive/10 border-destructive no-print">
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

      <div id="print-section" className="space-y-6">
        {/* Cover Page for Print */}
        <div className="print-cover-page hidden print:block">
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
            <Section
              key={index}
              title={`${index + 1}. ${title}`}
              isLoading={true}
            />
          ))}
        
        {report && !isLoading &&
          dprChapterTitles.map((title, index) => {
            const key = Object.keys(report).find(k => k.toLowerCase().replace(/ /g, '') === title.toLowerCase().replace(/ /g, '')) || title;
            const content = report[key];
            const sectionTitle = `${index + 1}. ${title.replace(/([A-Z])/g, ' $1').trim()}`.replace("And", "and");

            return (
              <Section
                key={key}
                title={sectionTitle}
                content={content}
                isLoading={isLoading}
                className="print-no-break"
              />
            );
          })}
      </div>
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
