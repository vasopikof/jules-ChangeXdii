'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const { register } = useUser();
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // In production, this should check against an env variable or a backend verify endpoint
    const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'admin123';

    if (passcode === ADMIN_PASSCODE) {
      await register({
        id: 'ADMIN-001',
        name: 'Event Administrator',
        role: 'admin',
        status: 'confirmed',
      });
      router.push('/admin');
    } else {
      setError('Invalid admin passcode');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-md space-y-4">
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-white"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Guest Entry
        </Button>

        <Card className="border-none shadow-2xl bg-slate-800 text-white">
          <CardHeader>
            <div className="flex items-center gap-2">
               <ShieldCheck className="h-6 w-6 text-indigo-400" />
               <CardTitle>Admin Portal</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Enter the master passcode to access management tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Master Passcode"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                Authorize Access
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
