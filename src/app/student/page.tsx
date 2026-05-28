'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking, subscribeToNotifications, AppNotification } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Bell,
  QrCode,
  Clock,
  CheckCircle2,
  LogOut,
  MapPin,
  X
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/');
      return;
    }

    const q = query(
      collection(db, "bookings"),
      where("studentId", "==", user.id),
      orderBy("createdAt", "desc")
    );
    const unsubBookings = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    });

    const unsubNotifs = subscribeToNotifications(user.id, (data) => {
      setNotifications(data);
    });

    return () => {
      unsubBookings();
      unsubNotifs();
    };
  }, [user, router]);

  const markAllAsRead = async () => {
    notifications.forEach(async (n) => {
       if (!n.read && n.id) {
          await updateDoc(doc(db, "notifications", n.id), { read: true });
       }
    });
  };

  if (!user || user.role !== 'student') return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase">Student Hub</p>
          <h1 className="text-xl font-black text-slate-900">{user.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markAllAsRead();
            }}
          >
            <Bell className="h-6 w-6 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-6 w-6 text-slate-400" />
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Notifications Modal Overlay */}
        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-start justify-end p-6 bg-black/20 backdrop-blur-sm">
             <Card className="w-full max-w-sm border-none shadow-2xl animate-in slide-in-from-right">
                <CardContent className="p-0">
                   <div className="bg-slate-900 text-white p-4 flex justify-between items-center rounded-t-xl">
                      <h3 className="font-bold">Notifications</h3>
                      <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
                         <X className="h-4 w-4" />
                      </Button>
                   </div>
                   <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-3 rounded-lg ${n.read ? 'bg-slate-50' : 'bg-indigo-50 border-l-4 border-indigo-500'}`}>
                           <p className="text-xs font-bold text-slate-900">{n.title}</p>
                           <p className="text-xs text-slate-600">{n.message}</p>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                         <p className="text-center py-4 text-slate-400 text-xs">No notifications</p>
                      )}
                   </div>
                </CardContent>
             </Card>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
            <Calendar className="h-4 w-4" /> My Interview Schedule
          </h2>
          {bookings.map(booking => (
            <Card key={booking.id} className="border-none shadow-md overflow-hidden">
              <div className={`h-1 ${booking.status === 'completed' ? 'bg-emerald-500' : booking.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'}`} />
              <CardContent className="p-5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">{booking.timeSlot}</p>
                  <p className="text-lg font-black text-slate-900">{booking.companyName}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    <span>Main Exhibition Hall</span>
                  </div>
                </div>
                <div className="text-right">
                   {booking.status === 'completed' ? (
                     <div className="flex flex-col items-end gap-1">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Completed</span>
                     </div>
                   ) : booking.status === 'cancelled' ? (
                     <div className="flex flex-col items-end gap-1">
                        <X className="h-8 w-8 text-red-500" />
                        <span className="text-[10px] font-bold text-red-600 uppercase">Cancelled</span>
                     </div>
                   ) : (
                     <div className="flex flex-col items-end gap-1">
                        <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Upcoming</span>
                     </div>
                   )}
                </div>
              </CardContent>
            </Card>
          ))}
          {bookings.length === 0 && (
             <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-8 text-center space-y-2">
               <Calendar className="h-12 w-12 text-slate-200 mx-auto" />
               <p className="text-slate-500 font-medium">No interviews scheduled yet.</p>
               <p className="text-xs text-slate-400">Scan a company QR code to book a slot!</p>
             </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-6 z-10">
        <Button
          className="w-full max-w-sm h-14 rounded-2xl shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-bold"
          onClick={() => router.push('/scan')}
        >
          <QrCode className="mr-2 h-6 w-6" /> Scan to Check-in / Book
        </Button>
      </div>
    </div>
  );
}
