'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { VolunteerInputView } from '@/components/views/VolunteerInputView';
import { AreaDashboardView } from '@/components/views/AreaDashboardView';
import { CandidateDashboardView } from '@/components/views/CandidateDashboardView';
import { TotalMultiChartView } from '@/components/views/TotalMultiChartView';
import { AdminRespondentsView } from '@/components/views/AdminRespondentsView';
import { SurveysManageView } from '@/components/views/SurveysManageView';

export default function HomePage() {
  const { activeTab, currentUser } = useApp();

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
