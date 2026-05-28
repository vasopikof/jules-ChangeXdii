'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { updateBookingStatus, createBooking, Booking, getUser, sendNotification } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Send } from 'lucide-react';

function RecordContent() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [score, setScore] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const studentId = searchParams.get('sid');

  useEffect(() => {
    async function init() {
      if (id && id !== 'new') {
        const s = await getDoc(doc(db, "bookings", id as string));
        if (s.exists()) {
           setBooking({ id: s.id, ...s.data() } as Booking);
        }
      } else if (id === 'new' && studentId) {
        // Create a temporary booking object for walk-in
        const student = await getUser(studentId);
        if (student) {
          setBooking({
            studentId: student.id,
            studentName: student.name,
            companyId: user?.id || 'unknown',
            companyName: user?.organization || user?.name || 'Company',
            timeSlot: 'Walk-in',
            status: 'scheduled',
            createdAt: new Date()
          });
        }
      }
      setInitializing(false);
    }
    init();
  }, [id, studentId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setLoading(true);
    try {
      let bookingId = booking.id;

      if (id === 'new') {
        // Create the actual booking record for walk-in
        const res = await createBooking({
          studentId: booking.studentId,
          studentName: booking.studentName,
          companyId: booking.companyId,
          companyName: booking.companyName,
          timeSlot: booking.timeSlot,
          status: 'completed'
        });
        bookingId = res.id;
      } else if (bookingId) {
        await updateBookingStatus(bookingId, 'completed');
      }

      if (booking.studentId) {
        await sendNotification({
          userId: booking.studentId,
          title: "Interview Complete",
          message: `Well done! ${user?.organization || 'The company'} has submitted your evaluation.`
        });
      }

      router.push('/company');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!booking) return <div className="text-center p-12">Booking or Student not found.</div>;

  return (
    <div className="max-w-md mx-auto space-y-6">
       <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
       </Button>

       <Card className="border-none shadow-xl">
          <CardHeader className="bg-slate-900 text-white rounded-t-xl">
             <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Assessment Form</p>
             <CardTitle className="text-xl">{booking.studentName}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                   <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Interview Score (1-10)</label>
                   <div className="flex justify-between">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                         <button
                           key={n}
                           type="button"
                           onClick={() => setScore(n)}
                           className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                             score === n ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 text-slate-400'
                           }`}
                         >
                            {n}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Internal Comments</label>
                   <textarea
                      className="w-full min-h-[120px] bg-slate-50 border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Technical skills, soft skills, culture fit..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                   />
                </div>

                <Button
                   className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold rounded-xl"
                   disabled={loading}
                >
                   {loading ? <Loader2 className="animate-spin" /> : (
                     <><Send className="mr-2 h-5 w-5" /> Submit Assessment</>
                   )}
                </Button>
             </form>
          </CardContent>
       </Card>
    </div>
  );
}

export default function RecordInterview() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <RecordContent />
      </Suspense>
    </main>
  );
}
