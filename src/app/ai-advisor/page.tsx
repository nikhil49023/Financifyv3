
'use client';

import { useState } from 'react';
import AIAdvisorChat from '@/components/financify/ai-advisor-chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function AIAdvisorPage() {
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>();
  const { translations } = useLanguage();
  
  const sampleQuestions = [
    "Where is most of my money going?",
    "Suggest some ways I can reduce my monthly expenses.",
    "What are some government schemes for new MSMEs in Andhra Pradesh?",
    "How can I get a collateral-free loan for my small business?",
  ];

  const handleSampleQuestionClick = (question: string) => {
    // By changing the key of the AIAdvisorChat component, we force it to remount
    // with the new initial question.
    setInitialQuestion(question);
  };

  return (
    <div className="flex flex-col gap-6">
       <Card>
          <CardHeader className="p-4 md:p-6">
             <CardTitle className="flex items-center gap-2">
                <Lightbulb />
                How to Use the AI Advisor
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6 pt-0">
             <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900 [&>svg]:text-amber-600">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>AI Disclaimer</AlertTitle>
                <AlertDescription>
                  AI-generated advice can sometimes be inaccurate. Please cross-verify important information with a qualified professional.
                </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Sample Questions:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {sampleQuestions.map((q, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => handleSampleQuestionClick(q)} 
                      className="text-left text-primary hover:underline"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
       </Card>

      <Card className="flex-1 flex flex-col h-[calc(100vh-24rem)] md:h-auto overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0">
          <AIAdvisorChat key={initialQuestion} initialMessage={initialQuestion} />
        </CardContent>
      </Card>
    </div>
  );
}
