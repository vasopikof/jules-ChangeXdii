'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Camera } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render((decodedText) => {
      // Logic for handling the decoded QR
      // Expecting a URL like: https://ourapp.com/book?cid=COM001
      try {
        const url = new URL(decodedText);
        // Clean up internal routes to relative if possible
        const targetPath = url.pathname + url.search;
        scanner.clear().then(() => {
           router.push(targetPath);
        });
      } catch (e) {
        // If not a URL, maybe it's just an ID
        if (user.role === 'company') {
           // Company scans student ID
           scanner.clear().then(() => {
             router.push(`/company/record/new?sid=${decodedText}`);
           });
        } else {
           setError("Invalid QR Code format.");
        }
      }
    }, (err) => {
      // silenty ignore scan errors as they happen constantly during seek
    });

    return () => {
      scanner.clear().catch(e => console.error("Scanner cleanup error", e));
    };
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
       <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-between">
             <Button variant="ghost" className="text-white" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
             </Button>
             <h2 className="text-lg font-bold">Scanner</h2>
          </div>

          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
             <CardContent className="p-0">
                <div id="reader" className="w-full"></div>
                {!error && (
                   <div className="p-8 text-center space-y-4">
                      <div className="animate-pulse flex flex-col items-center gap-3">
                         <Camera className="h-12 w-12 text-slate-500" />
                         <p className="text-sm text-slate-400">Position the QR code within the frame</p>
                      </div>
                   </div>
                )}
                {error && (
                   <div className="p-8 text-center text-red-400">
                      <p>{error}</p>
                      <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                         Try Again
                      </Button>
                   </div>
                )}
             </CardContent>
          </Card>

          <div className="bg-white/5 rounded-xl p-4 text-center">
             <p className="text-xs text-slate-500 uppercase font-bold mb-1">Active User Role</p>
             <p className="text-sm font-medium">{user?.role === 'student' ? 'Student' : 'Company Representative'}</p>
          </div>
       </div>
    </div>
  );
}
