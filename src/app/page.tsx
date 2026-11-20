'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { VolunteerInputView } from '@/components/views/VolunteerInputView';
import { AreaDashboardView } from '@/components/views/AreaDashboardView';
import { CandidateDashboardView } from '@/components/views/CandidateDashboardView';
import { TotalMultiChartView } from '@/components/views/TotalMultiChartView';
import { AdminRespondentsView } from '@/components/views/AdminRespondentsView';
import { SurveysManageView } from '@/components/views/SurveysManageView';
import { ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { activeTab, currentUser, isLoading } = useApp();

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
          Memverifikasi otentikasi kader...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Mengarahkan ke halaman masuk...</p>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'input':
        return <VolunteerInputView />;
      case 'wilayah':
        return <AreaDashboardView />;
      case 'kandidat':
        return <CandidateDashboardView />;
      case 'total':
        return <TotalMultiChartView />;
      case 'responden':
        return <AdminRespondentsView />;
      case 'surveys':
        return <SurveysManageView />;
      default:
        return <AreaDashboardView />;
    }
  };

  return (
    <div className="w-full transition-opacity duration-300">
      {renderActiveView()}
    </div>
  );
}
