'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { User } from '../types';
import supabase from '../supabase'

interface AuthContextType {
  user: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load

  const fetchSession = async () => {
    const session = await supabase.auth.getSession();
    if (session.data.session) {
      setUser(session.data.session.user);
      setLoading(false);
    }
    else {
      setUser(null);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSession()

    const {data: {subscription}} = supabase.auth.onAuthStateChange((event, session) => {
        if(event === 'SIGNED_IN'){
            setUser(session?.user)
        }else if(event === 'SIGNED_OUT'){
            setUser(null)
        }
    })

    return () => subscription.unsubscribe()
},[])

 
 

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
