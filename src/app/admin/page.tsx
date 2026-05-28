'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { subscribeToAllBookings, Booking, updateBookingStatus, sendNotification } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  LogOut,
  Bell,
  Trash2,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    const unsubscribe = subscribeToAllBookings((data) => {
      setBookings(data);
      const completed = data.filter(b => b.status === 'completed').length;
      setStats({
        total: data.length,
        completed,
        pending: data.length - completed
      });
    });

    return () => unsubscribe();
  }, [user, router]);

  const handleStatusChange = async (booking: Booking, newStatus: Booking['status']) => {
    if (!booking.id) return;
    await updateBookingStatus(booking.id, newStatus);

    // Send notifications to both parties
    await sendNotification({
      userId: booking.studentId,
      title: "Booking Updated",
      message: `Your interview with ${booking.companyName} is now ${newStatus}.`
    });
    await sendNotification({
      userId: booking.companyId,
      title: "Booking Updated",
      message: `Interview with ${booking.studentName} is now ${newStatus}.`
    });
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <LayoutDashboard className="text-white h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Event Admin Center</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">System Administrator</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="text-slate-600">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-indigo-50 border-b border-indigo-100 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Bookings</p>
                <Calendar className="h-4 w-4 text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-black text-slate-900">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-black text-slate-900">{stats.completed}</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-amber-50 border-b border-amber-100 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Active/Pending</p>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-black text-slate-900">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Real-Time Interview Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{booking.timeSlot}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{booking.studentName}</span>
                          <span className="text-xs text-slate-400">ID: {booking.studentId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{booking.companyName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {booking.status === 'scheduled' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-emerald-600"
                                onClick={() => handleStatusChange(booking, 'completed')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600"
                                onClick={() => handleStatusChange(booking, 'cancelled')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                             <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
