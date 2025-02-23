"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import DemoAuthForm from '@/components/ui/login_and_register/login_and_register';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push('/')}
        >
          ← Back to Home
        </Button>
        <DemoAuthForm />
      </div>
    </div>
  );
}
