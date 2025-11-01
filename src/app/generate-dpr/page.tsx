
'use client';

// This page is deprecated and no longer used.
// The user is now directed to the `customize-dpr` page instead.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DeprecatedGenerateDPRPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect users away from this deprecated page
        router.replace('/brainstorm');
    }, [router]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Redirecting...</p>
        </div>
    );
}
