'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { VolunteerInputView } from '@/components/views/VolunteerInputView';
import { ShieldCheck } from 'lucide-react';

export default function DirectInputPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/login');
    }
  }, [isLoading, currentUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Memverifikasi otentikasi petugas input...
        </p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="w-full">
      <VolunteerInputView />
    </div>
  );
}
