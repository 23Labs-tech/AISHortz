// components/SupabaseProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Session } from '@supabase/supabase-js';

type SupabaseContext = {
  session: Session | null;
};

const Context = createContext<SupabaseContext>({ session: null });

export default function SupabaseProvider({
  children,
  session: serverSession,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [session, setSession] = useState<Session | null>(serverSession);
  const supabase = createClientComponentClient();

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
    <Context.Provider value={{ session }}>
      {children}
    </Context.Provider>
  );
}

// Hook to use in any component
export const useSupabaseSession = () => useContext(Context);