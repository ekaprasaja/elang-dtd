'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Survey } from '@/types';

interface AppContextType {
  currentUser: UserProfile | null;
  availableProfiles: UserProfile[];
  activeTab: 'input' | 'wilayah' | 'kandidat' | 'total' | 'responden' | 'surveys';
  setActiveTab: (tab: 'input' | 'wilayah' | 'kandidat' | 'total' | 'responden' | 'surveys') => void;
  selectedSurveyId: string;
  setSelectedSurveyId: (id: string) => void;
  surveys: Survey[];
  switchProfile: (userId: string) => Promise<void>;
  notification: string | null;
  setNotification: (msg: string | null) => void;
  refreshSurveys: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'wilayah' | 'kandidat' | 'total' | 'responden' | 'surveys'>('wilayah');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('survey-kepri-2026');
  const [notification, setNotification] = useState<string | null>(null);

  const refreshSurveys = async () => {
    try {
      const res = await fetch('/api/surveys');
      const data = await res.json();
      if (data.surveys && data.surveys.length > 0) {
        setSurveys(data.surveys);
        if (!selectedSurveyId || !data.surveys.find((s: any) => s.id === selectedSurveyId)) {
          setSelectedSurveyId(data.surveys[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setAvailableProfiles(data.availableProfiles || []);
        if (data.user.role === 'RELAWAN') {
          setActiveTab('input');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const switchProfile = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setNotification(`Beralih ke: ${data.user.nama} (${data.user.role})`);
        if (data.user.role === 'RELAWAN') {
          setActiveTab('input');
        }
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSession();
    refreshSurveys();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        availableProfiles,
        activeTab,
        setActiveTab,
        selectedSurveyId,
        setSelectedSurveyId,
        surveys,
        switchProfile,
        notification,
        setNotification,
        refreshSurveys,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
