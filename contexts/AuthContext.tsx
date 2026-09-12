'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthModalOptions {
  tab?: 'login' | 'signup';
  returnTo?: string;
  onSuccess?: () => void;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isVerified: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  authModalOptions: AuthModalOptions;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [authModalOptions, setAuthModalOptions] = useState<AuthModalOptions>({});

  const supabase = createClient();

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refreshUser]);

  const openAuthModal = useCallback((options?: AuthModalOptions) => {
    setAuthModalTab(options?.tab ?? 'login');
    setAuthModalOptions(options ?? {});
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalOptions({});
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const isVerified = !!user?.email_confirmed_at;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isVerified,
        isAuthModalOpen,
        authModalTab,
        authModalOptions,
        openAuthModal,
        closeAuthModal,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
