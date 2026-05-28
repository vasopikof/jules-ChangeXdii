'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  QrCode,
  CheckCircle,
  LogOut,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function CompanyDashboard() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'company') {
      router.push('/');
      return;
    }

    const q = query(
      collection(db, "bookings"),
      where("companyId", "==", user.id),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setInterviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    });

    return () => unsub();
  }, [user, router]);

  if (!user || user.role !== 'company') return null;

  const completedCount = interviews.filter(i => i.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <header className="bg-indigo-900 text-white px-6 py-8 rounded-b-[2.5rem] shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Partner Portal</p>
            <h1 className="text-2xl font-black">{user.organization || user.name}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="text-indigo-300 hover:text-white">
            <LogOut className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md">
            <p className="text-indigo-200 text-[10px] font-bold uppercase">Total Queued</p>
            <p className="text-2xl font-black">{interviews.length}</p>
          </div>
          <div className="bg-emerald-500/20 rounded-2xl p-4 backdrop-blur-md">
            <p className="text-emerald-300 text-[10px] font-bold uppercase">Interviews Done</p>
            <p className="text-2xl font-black text-emerald-400">{completedCount}</p>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
              <Users className="h-4 w-4" /> Student Queue
            </h2>
          </div>

          {interviews.map(item => (
            <Card
              key={item.id}
              className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/company/record/${item.id}`)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                  👤
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{item.studentName}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">{item.timeSlot}</p>
                </div>
                <div>
                   {item.status === 'completed' ? (
                     <CheckCircle className="h-5 w-5 text-emerald-500" />
                   ) : (
                     <ChevronRight className="h-5 w-5 text-slate-300" />
                   )}
                </div>
              </CardContent>
            </Card>
          ))}

          {interviews.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">Waiting for students to check in...</p>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-6">
        <Button
          className="w-full max-w-sm h-14 rounded-2xl shadow-2xl bg-slate-900 hover:bg-slate-800 text-lg font-bold"
          onClick={() => router.push('/scan')}
        >
          <QrCode className="mr-2 h-6 w-6" /> Scan Student Badge
        </Button>
      </div>
    </div>
  );
}
