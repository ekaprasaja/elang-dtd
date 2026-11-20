'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Survey } from '@/types';

interface AppContextType {
  currentUser: UserProfile | null;
  availableProfiles: UserProfile[];
  isLoading: boolean;
  activeTab: 'input' | 'wilayah' | 'kandidat' | 'total' | 'responden' | 'surveys';
  setActiveTab: (tab: 'input' | 'wilayah' | 'kandidat' | 'total' | 'responden' | 'surveys') => void;
  selectedSurveyId: string;
  setSelectedSurveyId: (id: string) => void;
  surveys: Survey[];
  switchProfile: (userId: string) => Promise<void>;
  login: (userIdOrEmail: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  notification: string | null;
  setNotification: (msg: string | null) => void;
  refreshSurveys: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (data.availableProfiles) {
          setAvailableProfiles(data.availableProfiles);
        }
      } else {
        setCurrentUser(null);
        if (data.availableProfiles) {
          setAvailableProfiles(data.availableProfiles);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
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
      } else {
        setCurrentUser(null);
        setAvailableProfiles(data.availableProfiles || []);
      }
    } catch (e) {
      console.error(e);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
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

  const login = async (userIdOrEmail: string, password?: string) => {
    try {
      const body: any = {};
      if (userIdOrEmail.startsWith('usr-')) {
        body.userId = userIdOrEmail;
      } else {
        body.email = userIdOrEmail;
        body.password = password;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setNotification(`Selamat datang, ${data.user.nama}`);
        if (data.user.role === 'RELAWAN') {
          setActiveTab('input');
        }
        setTimeout(() => setNotification(null), 3000);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login gagal' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Terjadi kesalahan sistem' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      setCurrentUser(null);
      setNotification('Anda telah berhasil keluar');
      setTimeout(() => {
        setNotification(null);
        window.location.href = '/login';
      }, 400);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSession();
    refreshSurveys();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as any;
      if (
        tabParam &&
        ['input', 'wilayah', 'kandidat', 'total', 'responden', 'surveys'].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        availableProfiles,
        isLoading,
        activeTab,
        setActiveTab,
        selectedSurveyId,
        setSelectedSurveyId,
        surveys,
        switchProfile,
        login,
        logout,
        refreshUser,
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
