
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Sparkles, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { generateDprAction } from '@/app/actions';
import { AnimatePresence, motion } from 'framer-motion';

const themes = [
    {
        name: 'Consultant',
        className: 'theme-default',
        preview: {
            bg: 'bg-gray-50',
            title: 'text-gray-900',
            body: 'text-gray-600',
            link: 'text-blue-600',
        },
    },
    {
        name: 'Stardust',
        className: 'theme-stardust',
        preview: {
            bg: 'bg-black',
            title: 'text-white',
            body: 'text-gray-400',
            link: 'text-gray-300',
        },
    },
    {
        name: 'Blueberry',
        className: 'theme-blueberry',
        preview: {
            bg: 'bg-[#0F172A]',
            title: 'text-white',
            body: 'text-slate-300',
            link: 'text-sky-400',
        },
    },
];

function CustomizeDPRContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idea = searchParams.get('idea');
    const { user } = useAuth();
    const { toast } = useToast();

    const [selectedTheme, setSelectedTheme] = useState(themes[0].className);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        document.documentElement.className = selectedTheme;
    }, [selectedTheme]);

    const handleGenerateDPR = async () => {
        if (!idea || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Missing user or idea information.' });
            router.push('/brainstorm');
            return;
        }
        
        setIsGenerating(true);
        toast({ title: 'Generating DPR', description: 'This may take a minute or two. Please wait...' });

        try {
            const dprResult = await generateDprAction({
                idea: idea,
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

            router.push(`/dpr-report?idea=${encodeURIComponent(idea)}&theme=${selectedTheme}`);

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
    
    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl mx-auto space-y-8"
            >
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold">Customize your DPR</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Choose a theme to style your document.</p>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Palette /> Visuals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {themes.map((theme) => (
                                <div key={theme.name} className="space-y-2" onClick={() => setSelectedTheme(theme.className)}>
                                    <Card className={cn("cursor-pointer transition-all", selectedTheme === theme.className ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50')}>
                                        <div className={cn("p-6 rounded-t-lg aspect-[16/9] flex flex-col justify-center items-center", theme.preview.bg)}>
                                            <div className="w-4/5 p-4 rounded bg-white/10 backdrop-blur-sm border border-white/20">
                                                <h3 className={cn("font-bold", theme.preview.title)}>Title</h3>
                                                <p className={cn("text-sm", theme.preview.body)}>
                                                    Body & <span className={cn(theme.preview.link)}>link</span>
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                     <div className="flex items-center gap-2 cursor-pointer">
                                        <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", selectedTheme === theme.className ? 'border-primary bg-primary' : 'border-muted-foreground')}>
                                           {selectedTheme === theme.className && <Check className="h-3 w-3 text-primary-foreground" />}
                                        </div>
                                        <span className="font-medium">{theme.name}</span>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center pt-4">
                    <Button size="lg" onClick={handleGenerateDPR} disabled={isGenerating}>
                         {isGenerating ? (
                            <Loader2 className="mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2" />
                        )}
                        {isGenerating ? 'Generating, please wait...' : 'Generate Report'}
                    </Button>
                </div>

            </motion.div>
        </AnimatePresence>
    );
}

export default function CustomizeDPRPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 background-gradient">
                <CustomizeDPRContent />
            </div>
        </Suspense>
    );
}
