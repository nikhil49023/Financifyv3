'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileText,
  Loader2,
  ArrowLeft,
  Sparkles,
  Presentation,
  File,
  Globe,
  Share2,
  Shuffle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { generateDprAction } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';


const examplePrompts = [
  "An eco-friendly packaging solution using agricultural waste.",
  "A subscription box for artisanal Indian snacks.",
  "A mobile app for hyperlocal skill-sharing in Tier-2 cities.",
  "A boutique hotel focused on wellness and yoga retreats.",
  "A D2C brand for organic baby food.",
  "A vertical farming setup in urban areas to supply fresh produce."
];


function GenerateDPRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const ideaParam = searchParams.get('idea');
  const { user } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [docType, setDocType] = useState('Document');

  useEffect(() => {
    if (ideaParam) {
      setPrompt(ideaParam);
    }
  }, [ideaParam]);

  const handleGenerate = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to generate a DPR.',
      });
      router.push('/');
      return;
    }

    if (!prompt) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please describe the business idea you want to create a report for.' });
      return;
    }

    setIsGenerating(true);
    toast({
      title: 'Generating DPR',
      description: 'This may take a minute or two. Please wait...',
    });

    try {
      const dprResult = await generateDprAction({
        idea: prompt,
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

      router.push(`/dpr-report?idea=${encodeURIComponent(prompt)}`);

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
  
  const handleShuffle = () => {
      const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
      setPrompt(randomPrompt);
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 background-gradient">
        <div className="w-full max-w-4xl space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Generate</h1>
                <p className="mt-2 text-lg text-gray-600">What would you like to create today?</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {label: "Presentation", icon: Presentation},
                    {label: "Webpage", icon: Globe},
                    {label: "Document", icon: File},
                    {label: "Social", icon: Share2},
                ].map(({label, icon: Icon}) => (
                     <Card key={label} className={cn(
                         "p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                         docType === label ? "ring-2 ring-primary border-primary bg-primary/10" : "hover:bg-gray-50"
                     )} onClick={() => setDocType(label)}>
                         <Icon className={cn("h-6 w-6", docType === label ? "text-primary" : "text-gray-500")} />
                         <span className="font-medium text-sm text-gray-700">{label}</span>
                     </Card>
                ))}
            </div>

            <Card className="shadow-lg border-gray-200">
                <CardContent className="p-4">
                    <Textarea 
                        placeholder="Describe what you'd like to make..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 h-28"
                    />
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-600">Example prompts</p>
                    <Button variant="ghost" size="sm" onClick={handleShuffle}>
                        <Shuffle className="mr-2" />
                        Shuffle
                    </Button>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {examplePrompts.slice(0, 4).map((p) => (
                        <Card key={p} className="p-3 bg-white hover:bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => setPrompt(p)}>
                            <span className="text-sm text-gray-700">{p}</span>
                            <Plus className="h-4 w-4 text-gray-400" />
                        </Card>
                    ))}
                </div>
            </div>

            <div className="text-center pt-4">
                <Button size="lg" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                    Generate
                </Button>
            </div>
        </div>
    </div>
  );
}

export default function GenerateDPRPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center h-full text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <h2 className="text-xl font-semibold">Loading DPR Generator...</h2>
        </div>
      }
    >
      <GenerateDPRContent />
    </Suspense>
  );
}
