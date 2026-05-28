'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, User, Building2, ShieldCheck } from 'lucide-react';

function LandingContent() {
  const { user, login, register, isLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [idInput, setIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  // Handle QR Scan pre-fill
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setIdInput(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'student') router.push('/student');
      else if (user.role === 'company') router.push('/company');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(idInput);
    if (!success) {
      setError('ID not found. If you are new, please register at the front desk.');
    }
  };

  const handleRegister = async (e: React.FormEvent, role: 'student' | 'company') => {
    e.preventDefault();
    if (!idInput || !nameInput) {
      setError('Please fill in all fields');
      return;
    }
    await register({
      id: idInput,
      name: nameInput,
      role,
      status: 'pending',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">EventConnect</h1>
        <p className="text-slate-500">Seamless event interactions via QR</p>
      </div>

      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle>{isRegistering ? 'New Registration' : 'Welcome Back'}</CardTitle>
          <CardDescription>
            {isRegistering
              ? 'Identify yourself to join the event'
              : 'Enter your ID or scan your badge QR code'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter your ID"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
              <Button type="submit" className="w-full font-bold">
                Continue
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsRegistering(true)}
              >
                Register New Participant
              </Button>
              <Button
                variant="ghost"
                className="w-full text-slate-400"
                onClick={() => router.push('/admin/login')}
              >
                <ShieldCheck className="mr-2 h-4 w-4" /> Admin Access
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
                <div className="space-y-2">
                <Input
                  placeholder="Full Name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
                <Input
                  placeholder="Assign an ID"
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button
                  className="flex flex-col h-auto py-4 gap-2"
                  onClick={(e) => handleRegister(e as any, 'student')}
                >
                  <User className="h-6 w-6" />
                  <span>I'm a Student</span>
                </Button>
                <Button
                  className="flex flex-col h-auto py-4 gap-2 bg-indigo-600 hover:bg-indigo-700"
                  onClick={(e) => handleRegister(e as any, 'company')}
                >
                  <Building2 className="h-6 w-6" />
                  <span>Company Rep</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setIsRegistering(false)}
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
        <LandingContent />
      </Suspense>
    </main>
  );
}
