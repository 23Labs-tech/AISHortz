// components/SupabaseProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

type SupabaseContext = {
  session: Session | null;
  supabase: SupabaseClient;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
  session: serverSession,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(serverSession);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <Context.Provider value={{ session, supabase }}>
      {children}
    </Context.Provider>
  );
}

// Hook to use in any component
export const useSupabaseSession = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabaseSession must be used within a SupabaseProvider');
  }
  return context;
};