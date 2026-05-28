'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { createBooking, getUser, sendNotification } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarCheck, ArrowLeft, Building2 } from 'lucide-react';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<{id: string, name: string} | null>(null);

  const companyId = searchParams.get('cid');

  useEffect(() => {
    if (companyId) {
       getUser(companyId).then(data => {
         if (data) setCompanyInfo({ id: data.id, name: data.organization || data.name });
       });
    }
  }, [companyId]);

  const handleBooking = async (time: string) => {
    if (!user || !companyInfo) return;
    setLoading(true);
    try {
      await createBooking({
        studentId: user.id,
        studentName: user.name,
        companyId: companyInfo.id,
        companyName: companyInfo.name,
        timeSlot: time,
        status: 'scheduled'
      });

      await sendNotification({
        userId: companyInfo.id,
        title: "New Booking",
        message: `${user.name} has booked a slot for ${time}`
      });

      router.push('/student');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!companyInfo) return (
     <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
     </div>
  );

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="border-none shadow-lg overflow-hidden">
          <div className="bg-indigo-600 p-8 text-center text-white">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h1 className="text-2xl font-black">{companyInfo.name}</h1>
            <p className="text-indigo-200 text-sm">Select an available interview slot</p>
          </div>
          <CardContent className="p-6">
            <div className="grid gap-3">
                {['09:00', '10:00', '11:00', '13:00', '14:00'].map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    className="h-16 justify-between text-lg font-bold hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600"
                    onClick={() => handleBooking(time)}
                    disabled={loading}
                  >
                      <span>{time}</span>
                      <CalendarCheck className="h-5 w-5 opacity-30" />
                  </Button>
                ))}
            </div>
          </CardContent>
      </Card>
    </div>
  );
}

export default function BookPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
        <BookingContent />
      </Suspense>
    </main>
  );
}
